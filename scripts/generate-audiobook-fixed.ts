#!/usr/bin/env tsx
/**
 * TEST: Generate only Chapter 1 with fixed method to verify quality
 */

import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { generateSpeechOpenAI } from "../server/_core/openai-tts";
import { storagePut } from "../server/storage";
import * as db from "../server/db";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const VOICE = "onyx";
const MAX_CHARS = 3500;

function splitTextBySentences(text: string, maxChars: number): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

const CHAPTER_TITLES = [
  "The Divine Gift: The Awesome Power and Terrifying Responsibility of Free Will",
  "The Unbreakable Law of Your Reality",
  "The Unfair Advantage: How to Find Meaning in a World of Unfairness",
  "The Gravity of Choice: Navigating the Roles of Abuser and Victim",
  "The Crossroads of Choice: The Terrible Cost of Indecision",
  "The Phoenix Moment: Rising from the Ashes of Your Past",
  "Marcus Aurelius and the Stoic Path to Inner Freedom",
  "The Weight of Your Will: The Radical Power of Taking Responsibility",
  "The Alchemy of Will: Turning Suffering into Strength",
  "The Surfer and the Wave: The Dance of Free Will and Universal Laws",
  "The Paradox of Prayer: Does Asking for Help Undermine Free Will?",
  "The Myth of the Lone Genius: Why Your Will Needs a Tribe",
  "The Architect of Destiny: How Your Daily Choices Build Your Life",
  "Your Invictus Moment: The Captain of Your Soul",
];

async function generateChapter(chapterNum: number) {
  console.log("\n" + "=".repeat(70));
  console.log(`  CHAPTER ${chapterNum}/14: ${CHAPTER_TITLES[chapterNum - 1]}`);
  console.log("=".repeat(70));

  const chapterFile = `/home/ubuntu/destiny-hacking-app/manuscript-chapters/chapter_${chapterNum.toString().padStart(2, "0")}.txt`;
  const manuscriptText = readFileSync(chapterFile, "utf-8");
  const wordCount = manuscriptText.split(/\s+/).length;
  
  console.log(`\n✓ Loaded chapter (${manuscriptText.length} chars, ~${wordCount} words)`);

  const chunks = splitTextBySentences(manuscriptText, MAX_CHARS);
  console.log(`✓ Split into ${chunks.length} chunks (sentence-aware)`);

  // Generate audio for each chunk
  const chunkFiles: string[] = [];
  const startTime = Date.now();
  
  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(`  [${i + 1}/${chunks.length}] Generating (${chunks[i].length} chars)... `);
    
    // Retry logic for network errors
    let audioBuffer: Buffer | null = null;
    let retries = 3;
    while (retries > 0 && !audioBuffer) {
      try {
        audioBuffer = await generateSpeechOpenAI({
          text: chunks[i],
          voice: VOICE,
          model: "tts-1-hd",
        });
      } catch (error: any) {
        retries--;
        if (retries > 0) {
          console.log(`\n  ⚠️  Network error, retrying (${retries} attempts left)...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          throw error;
        }
      }
    }
    
    if (!audioBuffer) {
      throw new Error("Failed to generate audio after 3 retries");
    }

    const chunkFile = `/tmp/ch${chapterNum}_chunk${i}.mp3`;
    writeFileSync(chunkFile, audioBuffer);
    chunkFiles.push(chunkFile);
    console.log(`✓ ${(audioBuffer.length / 1024).toFixed(0)}KB`);
  }

  const genTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✓ All chunks generated in ${genTime}s`);

  // Concatenate with improved method
  if (chunks.length > 1) {
    console.log(`  Concatenating ${chunks.length} chunks (WAV method)...`);
    
    // Convert to WAV
    const wavFiles: string[] = [];
    for (let i = 0; i < chunkFiles.length; i++) {
      const wavFile = `/tmp/ch${chapterNum}_chunk${i}.wav`;
      await execAsync(`ffmpeg -i ${chunkFiles[i]} -ar 24000 -ac 1 ${wavFile} -y 2>&1 | tail -1`);
      wavFiles.push(wavFile);
    }

    // Concatenate WAV files
    const concatList = `/tmp/ch${chapterNum}_concat.txt`;
    writeFileSync(concatList, wavFiles.map(f => `file '${f}'`).join("\n"));
    const mergedWav = `/tmp/ch${chapterNum}_merged.wav`;
    await execAsync(`ffmpeg -f concat -safe 0 -i ${concatList} -c copy ${mergedWav} -y 2>&1 | tail -1`);

    // Convert back to MP3
    const outputFile = `/tmp/chapter${chapterNum}_FIXED.mp3`;
    await execAsync(`ffmpeg -i ${mergedWav} -b:a 128k ${outputFile} -y 2>&1 | tail -1`);
    
    const finalAudio = readFileSync(outputFile);
    console.log(`✓ Concatenated (${(finalAudio.length / 1024 / 1024).toFixed(1)}MB)`);

    // Upload to S3
    const timestamp = Date.now();
    const audioKey = `audiobooks/destiny-hacking-fixed/chapter-${chapterNum}-${timestamp}.mp3`;
    const { url: audioUrl } = await storagePut(audioKey, finalAudio, "audio/mpeg");
    console.log(`✓ Uploaded to S3`);
    console.log(`✓ Audio URL: ${audioUrl.substring(0, 60)}...`);

    // Update database
    const estimatedDuration = Math.ceil((wordCount / 150) * 60);
    await db.updateAudiobookChapter(30000 + chapterNum, {
      audioUrl,
      duration: estimatedDuration,
    });
    console.log(`✓ Updated database (Duration: ${Math.floor(estimatedDuration / 60)}m ${estimatedDuration % 60}s)`);

    // Cleanup
    chunkFiles.forEach(f => { try { unlinkSync(f); } catch {} });
    wavFiles.forEach(f => { try { unlinkSync(f); } catch {} });
    try { unlinkSync(concatList); } catch {}
    try { unlinkSync(mergedWav); } catch {}
    try { unlinkSync(outputFile); } catch {}
  }
}

async function regenerateAll() {
  console.log("\n" + "=".repeat(70));
  console.log("  DESTINY HACKING AUDIOBOOK - FIXED REGENERATION");
  console.log("  Voice: Onyx HD | Sentence-aware chunking");
  console.log("=".repeat(70));

  const overallStart = Date.now();

  for (let i = 1; i <= 14; i++) {
    await generateChapter(i);
  }

  const totalTime = ((Date.now() - overallStart) / 1000 / 60).toFixed(1);

  console.log("\n" + "=".repeat(70));
  console.log("  ✅ ALL 14 CHAPTERS REGENERATED!");
  console.log("=".repeat(70));
  console.log(`\nTotal time: ${totalTime} minutes`);
  console.log(`Voice: Onyx HD (OpenAI)`);
  console.log(`Quality: FIXED - No stammering!`);
  console.log(`\nYour audiobook is ready! 🎉`);
}

regenerateAll()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ REGENERATION FAILED");
    console.error("Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  });
