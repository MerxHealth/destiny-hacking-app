/**
 * Chatterbox TTS Integration
 * 
 * Provides voice cloning and text-to-speech using Chatterbox-Turbo model.
 * Requires Python environment with chatterbox-tts installed.
 */

import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

export interface ChatterboxOptions {
  text: string;
  voiceReferenceUrl?: string; // S3 URL to reference audio (10+ seconds)
  voiceReferencePath?: string; // Local path to reference audio
  exaggeration?: number; // 0.0-1.0, default 0.5
  cfgWeight?: number; // 0.0-1.0, default 0.5
}

export interface ChatterboxResult {
  audioBuffer: Buffer;
  duration: number; // seconds
  sampleRate: number;
}

/**
 * Generate speech using Chatterbox TTS with optional voice cloning
 */
export async function generateChatterboxSpeech(
  options: ChatterboxOptions
): Promise<ChatterboxResult> {
  const {
    text,
    voiceReferenceUrl,
    voiceReferencePath,
    exaggeration = 0.5,
    cfgWeight = 0.5,
  } = options;

  // Create temporary files
  const tempId = randomBytes(16).toString('hex');
  const tempDir = tmpdir();
  const textFile = join(tempDir, `chatterbox-text-${tempId}.txt`);
  const outputFile = join(tempDir, `chatterbox-output-${tempId}.wav`);
  const referenceFile = voiceReferencePath || join(tempDir, `chatterbox-ref-${tempId}.wav`);

  try {
    // Write text to file
    writeFileSync(textFile, text, 'utf-8');

    // Download reference audio if URL provided
    if (voiceReferenceUrl && !voiceReferencePath) {
      const response = await fetch(voiceReferenceUrl);
      if (!response.ok) {
        throw new Error(`Failed to download reference audio: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      writeFileSync(referenceFile, Buffer.from(arrayBuffer));
    }

    // Call Python script to generate speech
    const pythonScript = `
import sys
import torchaudio as ta
from chatterbox.tts_turbo import ChatterboxTurboTTS

# Load model
model = ChatterboxTurboTTS.from_pretrained(device="cuda" if ta.cuda.is_available() else "cpu")

# Read text
with open("${textFile.replace(/\\/g, '/')}", "r") as f:
    text = f.read()

# Generate audio
reference_path = "${referenceFile.replace(/\\/g, '/')}" if "${voiceReferencePath || voiceReferenceUrl}" else None
wav = model.generate(
    text,
    audio_prompt_path=reference_path,
    exaggeration=${exaggeration},
    cfg_weight=${cfgWeight}
)

# Save output
ta.save("${outputFile.replace(/\\/g, '/')}", wav, model.sr)

# Print metadata
print(f"DURATION:{wav.shape[-1] / model.sr}")
print(f"SAMPLE_RATE:{model.sr}")
`;

    // Execute Python script
    const result = await executePythonScript(pythonScript);
    
    // Parse metadata from output
    const durationMatch = result.match(/DURATION:([\d.]+)/);
    const sampleRateMatch = result.match(/SAMPLE_RATE:(\d+)/);
    
    if (!durationMatch || !sampleRateMatch) {
      throw new Error('Failed to parse Chatterbox output metadata');
    }

    const duration = parseFloat(durationMatch[1]);
    const sampleRate = parseInt(sampleRateMatch[1], 10);

    // Read generated audio file
    if (!existsSync(outputFile)) {
      throw new Error('Chatterbox failed to generate audio file');
    }

    const audioBuffer = await import('fs/promises').then(fs => fs.readFile(outputFile));

    return {
      audioBuffer,
      duration,
      sampleRate,
    };
  } finally {
    // Cleanup temporary files
    try {
      if (existsSync(textFile)) unlinkSync(textFile);
      if (existsSync(outputFile)) unlinkSync(outputFile);
      if (voiceReferenceUrl && existsSync(referenceFile)) unlinkSync(referenceFile);
    } catch (err) {
      console.warn('Failed to cleanup temporary files:', err);
    }
  }
}

/**
 * Execute Python script and return stdout
 */
function executePythonScript(script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', ['-c', script]);
    
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });

    python.on('error', (err) => {
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });
  });
}

/**
 * Test if Chatterbox is properly installed
 */
export async function testChatterboxInstallation(): Promise<boolean> {
  try {
    const testScript = `
import sys
try:
    from chatterbox.tts_turbo import ChatterboxTurboTTS
    print("OK")
except Exception as e:
    print(f"ERROR:{e}", file=sys.stderr)
    sys.exit(1)
`;
    const result = await executePythonScript(testScript);
    return result.trim() === 'OK';
  } catch (err) {
    console.error('Chatterbox installation test failed:', err);
    return false;
  }
}
