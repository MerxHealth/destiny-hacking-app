#!/usr/bin/env tsx
/**
 * Generate complete audiobook using OpenAI TTS
 * Voice: Onyx (deep, authoritative male voice)
 * Cost: ~$6 for 380k characters
 */

import { readFileSync, writeFileSync } from "fs";
import { generateSpeechOpenAI } from "../server/_core/openai-tts";
import { storagePut } from "../server/storage";
import * as db from "../server/db";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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

const VOICE = "onyx"; // Deep, authoritative male voice
const MAX_CHARS = 4000; // OpenAI recommended chunk size

function splitTextIntoChunks(text: string, maxChars: number): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    if ((currentChunk + para).length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

async function generateChapterAudio(chapterNum: number) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`  CHAPTER ${chapterNum}/14: ${CHAPTER_TITLES[chapterNum - 1]}`);
  console.log("=".repeat(70));

  // Read chapter text
  const chapterFile = `/home/ubuntu/destiny-hacking-app/manuscript-chapters/chapter_${chapterNum.toString().padStart(2, "0")}.txt`;
  const manuscriptText = readFileSync(chapterFile, "utf-8");
  const wordCount = manuscriptText.split(/\s+/).length;
  console.log(`✓ Loaded chapter (${manuscriptText.length} chars, ~${wordCount} words)`);

  // Split into chunks
  const chunks = splitTextIntoChunks(manuscriptText, MAX_CHARS);
  console.log(`✓ Split into ${chunks.length} chunks for TTS`);

  // Generate audio for each chunk
  const chunkFiles: string[] = [];
  const startTime = Date.now();
  
  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(`  [${i + 1}/${chunks.length}] Generating (${chunks[i].length} chars)... `);
    
    const audioBuffer = await generateSpeechOpenAI({
      text: chunks[i],
      voice: VOICE,
      model: "tts-1", // Standard quality (faster, cheaper)
    });

    const chunkFile = `/tmp/ch${chapterNum}_chunk${i}.mp3`;
    writeFileSync(chunkFile, audioBuffer);
    chunkFiles.push(chunkFile);
    console.log(`✓ ${(audioBuffer.length / 1024).toFixed(0)}KB`);
  }

  const genTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✓ All chunks generated in ${genTime}s`);

  // Concatenate chunks with ffmpeg
  if (chunks.length > 1) {
    console.log(`  Concatenating ${chunks.length} chunks...`);
    const concatList = `/tmp/ch${chapterNum}_concat.txt`;
    writeFileSync(concatList, chunkFiles.map(f => `file '${f}'`).join("\n"));

    const outputFile = `/tmp/ch${chapterNum}_complete.mp3`;
    await execAsync(`ffmpeg -f concat -safe 0 -i ${concatList} -c copy ${outputFile} -y 2>&1 | tail -3`);
    
    const finalAudio = readFileSync(outputFile);
    console.log(`✓ Concatenated (${(finalAudio.length / 1024 / 1024).toFixed(1)}MB)`);

    // Upload to S3
    const timestamp = Date.now();
    const audioKey = `audiobooks/destiny-hacking/chapter-${chapterNum}-${timestamp}.mp3`;
    const { url: audioUrl } = await storagePut(audioKey, finalAudio, "audio/mpeg");
    console.log(`✓ Uploaded to S3`);

    // Cleanup
    chunkFiles.forEach(f => { try { require("fs").unlinkSync(f); } catch {} });
    try { require("fs").unlinkSync(concatList); } catch {}
    try { require("fs").unlinkSync(outputFile); } catch {}

    return { audioUrl, finalAudio };
  } else {
    // Single chunk - upload directly
    const finalAudio = readFileSync(chunkFiles[0]);
    const timestamp = Date.now();
    const audioKey = `audiobooks/destiny-hacking/chapter-${chapterNum}-${timestamp}.mp3`;
    const { url: audioUrl } = await storagePut(audioKey, finalAudio, "audio/mpeg");
    console.log(`✓ Uploaded to S3 (${(finalAudio.length / 1024 / 1024).toFixed(1)}MB)`);

    // Cleanup
    try { require("fs").unlinkSync(chunkFiles[0]); } catch {}

    return { audioUrl, finalAudio };
  }
}

async function saveToDatabase(chapterNum: number, audioUrl: string, wordCount: number) {
  const estimatedDuration = Math.ceil((wordCount / 150) * 60);
  
  const chapter = await db.createAudiobookChapter({
    chapterNumber: chapterNum,
    title: CHAPTER_TITLES[chapterNum - 1],
    description: `Chapter ${chapterNum} of Destiny Hacking`,
    audioUrl,
    duration: estimatedDuration,
  });

  console.log(`✓ Saved to database (ID: ${chapter.id}, Duration: ${Math.floor(estimatedDuration / 60)}m ${estimatedDuration % 60}s)`);
}

async function generateAllChapters() {
  console.log("\n" + "=".repeat(70));
  console.log("  DESTINY HACKING AUDIOBOOK GENERATION");
  console.log("  Using OpenAI TTS - Voice: Onyx (Deep Male)");
  console.log("=".repeat(70));

  const overallStart = Date.now();

  for (let i = 1; i <= 14; i++) {
    const { audioUrl } = await generateChapterAudio(i);
    
    // Calculate word count for duration
    const chapterFile = `/home/ubuntu/destiny-hacking-app/manuscript-chapters/chapter_${i.toString().padStart(2, "0")}.txt`;
    const manuscriptText = readFileSync(chapterFile, "utf-8");
    const wordCount = manuscriptText.split(/\s+/).length;
    
    await saveToDatabase(i, audioUrl, wordCount);
  }

  const totalTime = ((Date.now() - overallStart) / 1000 / 60).toFixed(1);

  console.log("\n" + "=".repeat(70));
  console.log("  ✅ ALL 14 CHAPTERS GENERATED SUCCESSFULLY!");
  console.log("=".repeat(70));
  console.log(`\nTotal time: ${totalTime} minutes`);
  console.log(`Voice: Onyx (OpenAI)`);
  console.log(`\nYour audiobook is now live in the app! 🎉`);
}

generateAllChapters()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ GENERATION FAILED");
    console.error("Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  });
