/**
 * Test OpenAI TTS API key validation
 */

import { describe, it, expect } from "vitest";
import { generateSpeechOpenAI } from "./_core/openai-tts";

describe("OpenAI TTS Integration", () => {
  it("should validate OpenAI API key by generating test audio", async () => {
    // Generate a short test audio
    const audioBuffer = await generateSpeechOpenAI({
      text: "This is a test of the OpenAI text to speech system.",
      voice: "onyx",
      model: "tts-1",
    });

    // Verify audio was generated
    expect(audioBuffer).toBeInstanceOf(Buffer);
    expect(audioBuffer.length).toBeGreaterThan(1000); // Should be at least 1KB
    console.log(`✓ OpenAI TTS test successful (${audioBuffer.length} bytes generated)`);
  }, 30000); // 30 second timeout
});
