/**
 * Regenerate all audiobook chapters using Modal Chatterbox TTS
 * 
 * This script:
 * 1. Connects to the deployed Modal Chatterbox service
 * 2. Generates audio for each chapter using voice cloning
 * 3. Uploads audio to S3
 * 4. Updates database with new audio URLs
 */

import { db } from "../server/db";
import { bookChapters } from "../drizzle/schema";
import { eq, asc } from "drizzle-orm";
import { storagePut } from "../server/storage";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// Modal Chatterbox client
class ModalChatterboxClient {
  private appId = "chatterbox-tts";
  private workspace = "marco-woodwild";
  
  async generate(text: string, voiceName: string = "marco"): Promise<Buffer> {
    
    // Create temp file with text
    const tempTextFile = `/tmp/chapter_text_${Date.now()}.txt`;
    fs.writeFileSync(tempTextFile, text);
    
    // Create temp Python script to call Modal
    const pythonScript = `
import modal
import base64
import sys

ChatterboxTTS = modal.Cls.from_name("${this.appId}", "ChatterboxTTS")

tts = ChatterboxTTS()
result = tts.generate.remote(text="""${text.replace(/"/g, '\\"')}""", voice_name="${voiceName}")

# Write base64 audio to stdout
sys.stdout.buffer.write(base64.b64decode(result["audio_b64"]))
`;
    
    const tempPyFile = `/tmp/modal_generate_${Date.now()}.py`;
    fs.writeFileSync(tempPyFile, pythonScript);
    
    try {
      // Run Modal script and capture audio output
      const audioBuffer = execSync(`python3 ${tempPyFile}`, {
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer
        encoding: 'buffer'
      });
      
      // Cleanup
      fs.unlinkSync(tempTextFile);
      fs.unlinkSync(tempPyFile);
      
      return audioBuffer;
    } catch (error) {
      console.error("Modal generation failed:", error);
      throw error;
    }
  }
}

// Split text into sentence-aware chunks
function chunkText(text: string, maxChunkSize: number = 600): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += " " + sentence;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Concatenate WAV files
async function concatenateWavFiles(wavFiles: Buffer[]): Promise<Buffer> {
  const tempDir = `/tmp/wav_concat_${Date.now()}`;
  fs.mkdirSync(tempDir, { recursive: true });
  
  // Write all WAV files
  const filePaths: string[] = [];
  for (let i = 0; i < wavFiles.length; i++) {
    const filePath = path.join(tempDir, `chunk_${i}.wav`);
    fs.writeFileSync(filePath, wavFiles[i]);
    filePaths.push(filePath);
  }
  
  // Use ffmpeg to concatenate
  const fileListPath = path.join(tempDir, "filelist.txt");
  const fileListContent = filePaths.map(p => `file '${p}'`).join("\n");
  fs.writeFileSync(fileListPath, fileListContent);
  
  const outputPath = path.join(tempDir, "output.wav");
  execSync(`ffmpeg -f concat -safe 0 -i "${fileListPath}" -c copy "${outputPath}" -y`, {
    stdio: 'ignore'
  });
  
  const result = fs.readFileSync(outputPath);
  
  // Cleanup
  fs.rmSync(tempDir, { recursive: true, force: true });
  
  return result;
}

async function regenerateChapter(chapterId: number, chapterNumber: number) {
  console.log(`\n=== Processing Chapter ${chapterNumber} ===`);
  
  // Read chapter text
  const textFilePath = `/home/ubuntu/destiny-hacking-app/manuscript-chapters/chapter_${String(chapterNumber).padStart(2, '0')}.txt`;
  
  if (!fs.existsSync(textFilePath)) {
    console.error(`❌ Text file not found: ${textFilePath}`);
    return;
  }
  
  const chapterText = fs.readFileSync(textFilePath, 'utf-8');
  console.log(`📄 Loaded chapter text: ${chapterText.length} characters`);
  
  // Split into chunks
  const chunks = chunkText(chapterText);
  console.log(`📦 Split into ${chunks.length} chunks`);
  
  // Generate audio for each chunk
  const client = new ModalChatterboxClient();
  const audioChunks: Buffer[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    console.log(`🎙️  Generating audio for chunk ${i + 1}/${chunks.length}...`);
    try {
      const audioBuffer = await client.generate(chunks[i]);
      audioChunks.push(audioBuffer);
      console.log(`✅ Chunk ${i + 1} generated (${audioBuffer.length} bytes)`);
    } catch (error) {
      console.error(`❌ Failed to generate chunk ${i + 1}:`, error);
      throw error;
    }
  }
  
  // Concatenate all chunks
  console.log(`🔗 Concatenating ${audioChunks.length} audio chunks...`);
  const finalAudio = await concatenateWavFiles(audioChunks);
  console.log(`✅ Final audio: ${finalAudio.length} bytes`);
  
  // Upload to S3
  console.log(`☁️  Uploading to S3...`);
  const s3Key = `audiobook/chapter_${String(chapterNumber).padStart(2, '0')}_${Date.now()}.wav`;
  const { url } = await storagePut(s3Key, finalAudio, "audio/wav");
  console.log(`✅ Uploaded to: ${url}`);
  
  // Update database
  console.log(`💾 Updating database...`);
  await db
    .update(bookChapters)
    .set({ audioUrl: url })
    .where(eq(bookChapters.id, chapterId));
  
  console.log(`✅ Chapter ${chapterNumber} complete!`);
}

async function main() {
  console.log("🚀 Starting audiobook regeneration with Modal Chatterbox TTS");
  console.log("=" .repeat(60));
  
  // Get all chapters
  const chapters = await db
    .select()
    .from(bookChapters)
    .orderBy(asc(bookChapters.chapterNumber));
  
  console.log(`📚 Found ${chapters.length} chapters to process`);
  
  const startTime = Date.now();
  
  for (const chapter of chapters) {
    try {
      await regenerateChapter(chapter.id, chapter.chapterNumber);
    } catch (error) {
      console.error(`❌ Failed to regenerate Chapter ${chapter.chapterNumber}:`, error);
      console.log("Continuing with next chapter...");
    }
  }
  
  const duration = Math.round((Date.now() - startTime) / 1000 / 60);
  console.log("\n" + "=".repeat(60));
  console.log(`🎉 Audiobook regeneration complete!`);
  console.log(`⏱️  Total time: ${duration} minutes`);
  console.log("=".repeat(60));
}

main().catch(console.error);
