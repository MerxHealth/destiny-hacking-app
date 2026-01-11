/**
 * Regenerate Audiobook with Chatterbox TTS Voice Cloning
 * 
 * This script regenerates all audiobook chapters using Chatterbox TTS
 * with your cloned voice to eliminate repeating word issues.
 * 
 * Usage:
 *   1. Place your voice sample audio file (10+ seconds) at: /tmp/voice_sample.wav
 *   2. Run: pnpm tsx scripts/regenerate-audiobook-chatterbox.ts
 *   3. Wait for all chapters to be generated (this will take time!)
 * 
 * The script will:
 * - Load your voice sample for cloning
 * - Process each chapter text file
 * - Generate audio using Chatterbox TTS
 * - Upload to S3
 * - Update database with new URLs
 */

import { spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { db } from '../server/_core/db';
import { bookChapters } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { storagePut } from '../server/storage';

const VOICE_SAMPLE_PATH = process.env.VOICE_SAMPLE_PATH || '/tmp/voice_sample.wav';
const CHAPTER_DIR = join(process.cwd(), 'manuscript-chapters');

interface ChapterInfo {
  id: number;
  chapterNumber: number;
  title: string;
  textFile: string;
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
      process.stdout.write(data); // Show progress
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data); // Show errors
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
 * Generate audio for a text chunk using Chatterbox TTS
 */
async function generateChatterboxAudio(
  text: string,
  voiceSamplePath: string,
  outputPath: string
): Promise<{ duration: number; sampleRate: number }> {
  const tempTextFile = join(tmpdir(), `chatterbox-text-${randomBytes(8).toString('hex')}.txt`);
  
  try {
    // Write text to temporary file
    writeFileSync(tempTextFile, text, 'utf-8');

    const pythonScript = `
import sys
import torchaudio as ta
from chatterbox.tts_turbo import ChatterboxTurboTTS

print("Loading Chatterbox model...")
model = ChatterboxTurboTTS.from_pretrained(device="cuda" if ta.cuda.is_available() else "cpu")

print("Reading text...")
with open("${tempTextFile.replace(/\\/g, '/')}", "r") as f:
    text = f.read()

print(f"Generating audio for {len(text)} characters...")
wav = model.generate(
    text,
    audio_prompt_path="${voiceSamplePath.replace(/\\/g, '/')}",
    exaggeration=0.5,
    cfg_weight=0.5
)

print("Saving audio...")
ta.save("${outputPath.replace(/\\/g, '/')}", wav, model.sr)

duration = wav.shape[-1] / model.sr
print(f"DURATION:{duration}")
print(f"SAMPLE_RATE:{model.sr}")
print("Done!")
`;

    const result = await executePythonScript(pythonScript);
    
    // Parse metadata
    const durationMatch = result.match(/DURATION:([\d.]+)/);
    const sampleRateMatch = result.match(/SAMPLE_RATE:(\d+)/);
    
    if (!durationMatch || !sampleRateMatch) {
      throw new Error('Failed to parse audio metadata');
    }

    return {
      duration: parseFloat(durationMatch[1]),
      sampleRate: parseInt(sampleRateMatch[1], 10),
    };
  } finally {
    if (existsSync(tempTextFile)) {
      unlinkSync(tempTextFile);
    }
  }
}

/**
 * Split text into sentence-aware chunks
 */
function splitIntoChunks(text: string, maxChunkSize: number = 4000): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Concatenate WAV files
 */
async function concatenateWavFiles(inputFiles: string[], outputFile: string): Promise<void> {
  const pythonScript = `
import wave
import sys

def concatenate_wav_files(input_files, output_file):
    data = []
    params = None
    
    for filename in input_files:
        with wave.open(filename, 'rb') as w:
            if params is None:
                params = w.getparams()
            data.append(w.readframes(w.getnframes()))
    
    with wave.open(output_file, 'wb') as output:
        output.setparams(params)
        for d in data:
            output.writeframes(d)

input_files = ${JSON.stringify(inputFiles)}
concatenate_wav_files(input_files, "${outputFile.replace(/\\/g, '/')}")
print("Concatenation complete")
`;

  await executePythonScript(pythonScript);
}

/**
 * Regenerate a single chapter
 */
async function regenerateChapter(chapter: ChapterInfo, voiceSamplePath: string): Promise<void> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Processing Chapter ${chapter.chapterNumber}: ${chapter.title}`);
  console.log(`${'='.repeat(80)}\n`);

  // Read chapter text
  const textPath = join(CHAPTER_DIR, chapter.textFile);
  if (!existsSync(textPath)) {
    throw new Error(`Chapter text file not found: ${textPath}`);
  }

  const fullText = readFileSync(textPath, 'utf-8');
  console.log(`Text length: ${fullText.length} characters`);

  // Split into chunks
  const chunks = splitIntoChunks(fullText, 4000);
  console.log(`Split into ${chunks.length} chunks`);

  // Generate audio for each chunk
  const tempDir = tmpdir();
  const chunkFiles: string[] = [];
  let totalDuration = 0;

  for (let i = 0; i < chunks.length; i++) {
    console.log(`\nGenerating chunk ${i + 1}/${chunks.length}...`);
    const chunkFile = join(tempDir, `chapter${chapter.chapterNumber}_chunk${i}.wav`);
    
    const { duration } = await generateChatterboxAudio(
      chunks[i],
      voiceSamplePath,
      chunkFile
    );
    
    chunkFiles.push(chunkFile);
    totalDuration += duration;
    console.log(`Chunk ${i + 1} duration: ${duration.toFixed(2)}s`);
  }

  console.log(`\nTotal duration: ${(totalDuration / 60).toFixed(2)} minutes`);

  // Concatenate chunks
  console.log('\nConcatenating audio chunks...');
  const finalWavFile = join(tempDir, `chapter${chapter.chapterNumber}_final.wav`);
  await concatenateWavFiles(chunkFiles, finalWavFile);

  // Upload to S3
  console.log('\nUploading to S3...');
  const audioBuffer = readFileSync(finalWavFile);
  const fileKey = `audiobook/chapter_${chapter.chapterNumber.toString().padStart(2, '0')}_chatterbox.wav`;
  const { url } = await storagePut(fileKey, audioBuffer, 'audio/wav');
  
  console.log(`Uploaded: ${url}`);

  // Update database
  console.log('\nUpdating database...');
  await db
    .update(bookChapters)
    .set({
      audioUrl: url,
      audioDuration: Math.round(totalDuration),
    })
    .where(eq(bookChapters.id, chapter.id));

  // Cleanup temporary files
  console.log('\nCleaning up temporary files...');
  for (const file of [...chunkFiles, finalWavFile]) {
    if (existsSync(file)) {
      unlinkSync(file);
    }
  }

  console.log(`\n✅ Chapter ${chapter.chapterNumber} complete!\n`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🎙️  Chatterbox Audiobook Regeneration Script');
  console.log('='.repeat(80));
  console.log();

  // Check voice sample
  if (!existsSync(VOICE_SAMPLE_PATH)) {
    console.error(`❌ Voice sample not found at: ${VOICE_SAMPLE_PATH}`);
    console.error('Please place your voice sample audio file (10+ seconds) at this path.');
    console.error('Supported formats: WAV, MP3, OGG');
    process.exit(1);
  }

  console.log(`✅ Voice sample found: ${VOICE_SAMPLE_PATH}`);

  // Get all chapters from database
  const chapters = await db
    .select({
      id: bookChapters.id,
      chapterNumber: bookChapters.chapterNumber,
      title: bookChapters.title,
      textFile: bookChapters.textFile,
    })
    .from(bookChapters)
    .where(eq(bookChapters.textFile, bookChapters.textFile)) // Get all with text files
    .orderBy(bookChapters.chapterNumber);

  console.log(`Found ${chapters.length} chapters to process\n`);

  // Process each chapter
  for (const chapter of chapters) {
    try {
      await regenerateChapter(chapter as ChapterInfo, VOICE_SAMPLE_PATH);
    } catch (error) {
      console.error(`\n❌ Failed to process Chapter ${chapter.chapterNumber}:`, error);
      console.error('Continuing with next chapter...\n');
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎉 Audiobook regeneration complete!');
  console.log('='.repeat(80));
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
