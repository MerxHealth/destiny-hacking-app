#!/usr/bin/env tsx
/**
 * Standalone script to generate all 14 audiobook chapters
 * 
 * Usage:
 *   pnpm tsx scripts/generate-audiobook.ts <voice_recording_url>
 * 
 * Example:
 *   pnpm tsx scripts/generate-audiobook.ts "https://s3.amazonaws.com/bucket/voice-samples/recording.webm"
 */

import { generateAllChapters } from "../server/generateAllChapters";

const voiceRecordingUrl = process.argv[2];

if (!voiceRecordingUrl) {
  console.error("Error: Voice recording URL is required");
  console.error("\nUsage:");
  console.error("  pnpm tsx scripts/generate-audiobook.ts <voice_recording_url>");
  console.error("\nExample:");
  console.error('  pnpm tsx scripts/generate-audiobook.ts "https://s3.amazonaws.com/bucket/voice-samples/recording.webm"');
  process.exit(1);
}

console.log("=".repeat(60));
console.log("  DESTINY HACKING AUDIOBOOK GENERATION");
console.log("=".repeat(60));
console.log();

generateAllChapters(voiceRecordingUrl)
  .then((result) => {
    console.log("\n" + "=".repeat(60));
    console.log("  GENERATION COMPLETE!");
    console.log("=".repeat(60));
    console.log(`\nVoice Model ID: ${result.voiceModelId}`);
    console.log(`Chapters Generated: ${result.chaptersGenerated}`);
    console.log("\nYou can now listen to the audiobook in your app!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n" + "=".repeat(60));
    console.error("  GENERATION FAILED");
    console.error("=".repeat(60));
    console.error("\nError:", error.message);
    console.error("\nStack trace:");
    console.error(error.stack);
    process.exit(1);
  });
