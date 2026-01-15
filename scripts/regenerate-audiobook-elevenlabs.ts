/**
 * Regenerate all audiobook chapters using ElevenLabs TTS with voice cloning
 * 
 * This script:
 * 1. Clones voice from sample audio file
 * 2. Generates audio for each chapter using the cloned voice
 * 3. Uploads audio to S3
 * 4. Updates database with new audio URLs
 */

import { db } from "../server/db";
import { bookChapters } from "../drizzle/schema";
import { asc, eq } from "drizzle-orm";
import { storagePut } from "../server/storage";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import FormData from "form-data";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_SAMPLE_PATH = "/tmp/voice_sample.wav";

if (!ELEVENLABS_API_KEY) {
  console.error("❌ ELEVENLABS_API_KEY not found in environment");
  process.exit(1);
}

// ElevenLabs API client
class ElevenLabsClient {
  private apiKey: string;
  private voiceId: string | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Clone voice from audio sample
  async cloneVoice(name: string, audioPath: string): Promise<string> {
    console.log(`🎤 Cloning voice "${name}" from ${audioPath}...`);
    

    const form = new FormData();
    form.append('name', name);
    form.append('files', fs.createReadStream(audioPath));
    form.append('description', 'Author voice for Destiny Hacking audiobook');

    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        ...form.getHeaders(),
      },
      body: form,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Voice cloning failed: ${error}`);
    }

    const data = await response.json();
    this.voiceId = data.voice_id;
    console.log(`✅ Voice cloned successfully! Voice ID: ${this.voiceId}`);
    return this.voiceId;
  }

  // Generate speech from text
  async generateSpeech(text: string, voiceId: string): Promise<Buffer> {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Speech generation failed: ${error}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  getVoiceId(): string {
    if (!this.voiceId) {
      throw new Error("Voice not cloned yet");
    }
    return this.voiceId;
  }
}

// Split text into chunks (ElevenLabs has 5000 char limit per request)
function chunkText(text: string, maxChunkSize: number = 4500): string[] {
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

// Concatenate MP3 files
async function concatenateMp3Files(mp3Files: Buffer[]): Promise<Buffer> {
  const tempDir = `/tmp/mp3_concat_${Date.now()}`;
  fs.mkdirSync(tempDir, { recursive: true });
  
  // Write all MP3 files
  const filePaths: string[] = [];
  for (let i = 0; i < mp3Files.length; i++) {
    const filePath = path.join(tempDir, `chunk_${i}.mp3`);
    fs.writeFileSync(filePath, mp3Files[i]);
    filePaths.push(filePath);
  }
  
  // Use ffmpeg to concatenate
  const fileListPath = path.join(tempDir, "filelist.txt");
  const fileListContent = filePaths.map(p => `file '${p}'`).join("\n");
  fs.writeFileSync(fileListPath, fileListContent);
  
  const outputPath = path.join(tempDir, "output.mp3");
  execSync(`ffmpeg -f concat -safe 0 -i "${fileListPath}" -c copy "${outputPath}" -y`, {
    stdio: 'ignore'
  });
  
  const result = fs.readFileSync(outputPath);
  
  // Cleanup
  fs.rmSync(tempDir, { recursive: true, force: true });
  
  return result;
}

async function regenerateChapter(
  client: ElevenLabsClient,
  chapterId: number,
  chapterNumber: number
) {
  console.log(`\n=== Processing Chapter ${chapterNumber} ===`);
  
  // Read chapter text
  const textFilePath = `/home/ubuntu/destiny-hacking-app/manuscript-chapters/chapter_${String(chapterNumber).padStart(2, '0')}.txt`;
  const chapterText = fs.readFileSync(textFilePath, 'utf-8');
  console.log(`📄 Loaded chapter text: ${chapterText.length} characters`);
  
  // Split into chunks
  const chunks = chunkText(chapterText);
  console.log(`📦 Split into ${chunks.length} chunks`);
  
  // Generate audio for each chunk
  const audioChunks: Buffer[] = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`🎙️  Generating audio for chunk ${i + 1}/${chunks.length}...`);
    try {
      const audioBuffer = await client.generateSpeech(chunks[i], client.getVoiceId());
      audioChunks.push(audioBuffer);
      console.log(`✅ Chunk ${i + 1} generated (${audioBuffer.length} bytes)`);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed to generate chunk ${i + 1}:`, error);
      throw error;
    }
  }
  
  // Concatenate all chunks
  console.log(`🔗 Concatenating ${audioChunks.length} audio chunks...`);
  const finalAudio = await concatenateMp3Files(audioChunks);
  console.log(`✅ Final audio: ${finalAudio.length} bytes`);
  
  // Upload to S3
  console.log(`☁️  Uploading to S3...`);
  const s3Key = `audiobook/chapter_${String(chapterNumber).padStart(2, '0')}_${Date.now()}.mp3`;
  const { url } = await storagePut(s3Key, finalAudio, "audio/mpeg");
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
  console.log("🚀 Starting audiobook regeneration with ElevenLabs TTS");
  console.log("=" .repeat(60));
  
  // Initialize ElevenLabs client
  const client = new ElevenLabsClient(ELEVENLABS_API_KEY!);
  
  // Clone voice from sample
  await client.cloneVoice("Marco - Destiny Hacking", VOICE_SAMPLE_PATH);
  
  // Get all chapters
  const chapters = await db
    .select()
    .from(bookChapters)
    .orderBy(asc(bookChapters.chapterNumber));
  
  console.log(`📚 Found ${chapters.length} chapters to process`);
  
  const startTime = Date.now();
  
  // Process each chapter
  for (const chapter of chapters) {
    try {
      await regenerateChapter(client, chapter.id, chapter.chapterNumber);
    } catch (error) {
      console.error(`❌ Failed to regenerate Chapter ${chapter.chapterNumber}:`, error);
      console.log("Continuing with next chapter...");
    }
  }
  
  const endTime = Date.now();
  const totalMinutes = Math.round((endTime - startTime) / 1000 / 60);
  
  console.log("=" .repeat(60));
  console.log("🎉 Audiobook regeneration complete!");
  console.log(`⏱️  Total time: ${totalMinutes} minutes`);
  console.log("=" .repeat(60));
}

main().catch(console.error);
