/**
 * Generate all 14 audiobook chapters
 * This script:
 * 1. Finds the most recent uploaded voice recording
 * 2. Clones the voice with ElevenLabs
 * 3. Generates audio for all 14 chapters
 * 4. Uploads to S3 and saves to database
 */

import { readFileSync } from "fs";
import { join } from "path";
import { createVoiceClone, generateSpeech } from "./_core/elevenlabs";
import { storagePut } from "./storage";
import * as db from "./db";

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

export async function generateAllChapters(voiceRecordingUrl: string) {
  console.log("Starting audiobook generation...");
  console.log("Voice recording URL:", voiceRecordingUrl);

  // Step 1: Clone voice
  console.log("\n[1/3] Cloning voice...");
  const voiceModel = await createVoiceClone({
    name: "Author Voice - Destiny Hacking",
    audioFileUrl: voiceRecordingUrl,
    description: "Author's voice for Destiny Hacking audiobook narration",
  });
  console.log(`✓ Voice cloned successfully. Model ID: ${voiceModel.voiceId}`);

  // Step 2: Save voice model to database
  const dbVoiceModel = await db.createVoiceModel({
    userId: 1, // Owner user ID
    modelId: voiceModel.voiceId,
    modelName: "Author Voice - Destiny Hacking",
    sampleAudioUrl: voiceRecordingUrl,
    isPrimary: true,
  });
  console.log(`✓ Voice model saved to database. ID: ${dbVoiceModel.id}`);

  // Step 3: Generate all chapters
  console.log("\n[2/3] Generating audiobook chapters...");
  const chaptersDir = join(__dirname, "../manuscript-chapters");

  for (let i = 1; i <= 14; i++) {
    console.log(`\n--- Chapter ${i}/14 ---`);
    
    // Read chapter text
    const chapterFile = join(chaptersDir, `chapter_${i.toString().padStart(2, "0")}.txt`);
    const manuscriptText = readFileSync(chapterFile, "utf-8");
    console.log(`✓ Loaded chapter text (${manuscriptText.length} characters)`);

    // Generate speech
    console.log("  Generating audio...");
    const audioBuffer = await generateSpeech({
      voiceId: voiceModel.voiceId,
      text: manuscriptText,
      seed: i, // Use chapter number as seed for consistency
    });
    console.log(`✓ Audio generated (${audioBuffer.length} bytes)`);

    // Upload to S3
    const timestamp = Date.now();
    const audioKey = `audiobooks/destiny-hacking/chapter-${i}-${timestamp}.mp3`;
    const { url: audioUrl } = await storagePut(audioKey, audioBuffer, "audio/mpeg");
    console.log(`✓ Uploaded to S3: ${audioUrl}`);

    // Calculate duration (estimate: ~150 words per minute)
    const estimatedWords = manuscriptText.split(/\s+/).length;
    const estimatedDuration = Math.ceil((estimatedWords / 150) * 60); // in seconds
    console.log(`✓ Estimated duration: ${Math.floor(estimatedDuration / 60)}m ${estimatedDuration % 60}s`);

    // Save to database
    const chapter = await db.createAudiobookChapter({
      chapterNumber: i,
      title: CHAPTER_TITLES[i - 1],
      description: `Chapter ${i} of Destiny Hacking`,
      audioUrl,
      duration: estimatedDuration,
    });
    console.log(`✓ Saved to database. Chapter ID: ${chapter.id}`);
  }

  console.log("\n[3/3] All chapters generated successfully! 🎉");
  console.log(`\nTotal chapters: 14`);
  console.log(`Voice model ID: ${voiceModel.voiceId}`);
  
  return {
    success: true,
    voiceModelId: voiceModel.voiceId,
    chaptersGenerated: 14,
  };
}
