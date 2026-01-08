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

async function testChapter1() {
  console.log("\n" + "=".repeat(70));
  console.log("  TEST: Chapter 1 with FIXED audio generation");
  console.log("  Sentence-aware chunking + HD quality + improved concatenation");
  console.log("=".repeat(70));

  const chapterFile = `/home/ubuntu/destiny-hacking-app/manuscript-chapters/chapter_01.txt`;
  const manuscriptText = readFileSync(chapterFile, "utf-8");
  const wordCount = manuscriptText.split(/\s+/).length;
  
  console.log(`\n✓ Loaded Chapter 1 (${manuscriptText.length} chars, ~${wordCount} words)`);

  const chunks = splitTextBySentences(manuscriptText, MAX_CHARS);
  console.log(`✓ Split into ${chunks.length} chunks (sentence-aware)`);

  // Generate audio for each chunk
  const chunkFiles: string[] = [];
  const startTime = Date.now();
  
  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(`  [${i + 1}/${chunks.length}] Generating (${chunks[i].length} chars)... `);
    
    const audioBuffer = await generateSpeechOpenAI({
      text: chunks[i],
      voice: VOICE,
      model: "tts-1-hd",
    });

    const chunkFile = `/tmp/test_ch1_chunk${i}.mp3`;
    writeFileSync(chunkFile, audioBuffer);
    chunkFiles.push(chunkFile);
    console.log(`✓ ${(audioBuffer.length / 1024).toFixed(0)}KB`);
  }

  const genTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✓ All chunks generated in ${genTime}s`);

  // Concatenate with improved method
  if (chunks.length > 1) {
    console.log(`\n  Concatenating ${chunks.length} chunks (WAV method)...`);
    
    // Convert to WAV
    const wavFiles: string[] = [];
    for (let i = 0; i < chunkFiles.length; i++) {
      const wavFile = `/tmp/test_ch1_chunk${i}.wav`;
      await execAsync(`ffmpeg -i ${chunkFiles[i]} -ar 24000 -ac 1 ${wavFile} -y 2>&1 | tail -1`);
      wavFiles.push(wavFile);
    }

    // Concatenate WAV files
    const concatList = `/tmp/test_ch1_concat.txt`;
    writeFileSync(concatList, wavFiles.map(f => `file '${f}'`).join("\n"));
    const mergedWav = `/tmp/test_ch1_merged.wav`;
    await execAsync(`ffmpeg -f concat -safe 0 -i ${concatList} -c copy ${mergedWav} -y 2>&1 | tail -1`);

    // Convert back to MP3
    const outputFile = `/tmp/test_chapter1_FIXED.mp3`;
    await execAsync(`ffmpeg -i ${mergedWav} -b:a 128k ${outputFile} -y 2>&1 | tail -1`);
    
    const finalAudio = readFileSync(outputFile);
    console.log(`✓ Concatenated (${(finalAudio.length / 1024 / 1024).toFixed(1)}MB)`);

    // Upload to S3
    const timestamp = Date.now();
    const audioKey = `audiobooks/destiny-hacking-fixed/chapter-1-TEST-${timestamp}.mp3`;
    const { url: audioUrl } = await storagePut(audioKey, finalAudio, "audio/mpeg");
    console.log(`✓ Uploaded to S3`);
    console.log(`\n📁 Audio URL: ${audioUrl}`);

    // Update database
    const estimatedDuration = Math.ceil((wordCount / 150) * 60);
    await db.updateAudiobookChapter(30001, {
      audioUrl,
      duration: estimatedDuration,
    });
    console.log(`✓ Updated database (Duration: ${Math.floor(estimatedDuration / 60)}m ${estimatedDuration % 60}s)`);

    // Cleanup
    chunkFiles.forEach(f => { try { unlinkSync(f); } catch {} });
    wavFiles.forEach(f => { try { unlinkSync(f); } catch {} });
    try { unlinkSync(concatList); } catch {}
    try { unlinkSync(mergedWav); } catch {}
    // Keep the final file for testing
    console.log(`\n✅ TEST COMPLETE!`);
    console.log(`\nLocal file saved at: ${outputFile}`);
    console.log(`\nPlease test this audio in your app at /audiobook`);
    console.log(`Listen carefully for any stammering or word repetition.`);
    console.log(`\nIf it sounds good, I'll regenerate all 14 chapters! 🎉`);
  }
}

testChapter1()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ TEST FAILED");
    console.error("Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  });
