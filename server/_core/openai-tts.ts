/**
 * OpenAI Text-to-Speech Integration
 * 
 * Provides helper for generating speech using OpenAI TTS API
 */

import { ENV } from "./env";

const OPENAI_API_BASE = "https://api.openai.com/v1";

export type OpenAIVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

/**
 * Generate speech from text using OpenAI TTS
 * 
 * @param text - Text to convert to speech
 * @param voice - Voice to use (default: onyx)
 * @param model - Model to use (default: tts-1)
 * @returns Audio buffer (MP3 format)
 */
export async function generateSpeechOpenAI(params: {
  text: string;
  voice?: OpenAIVoice;
  model?: "tts-1" | "tts-1-hd";
}): Promise<Buffer> {
  const { text, voice = "onyx", model = "tts-1" } = params;

  const response = await fetch(`${OPENAI_API_BASE}/audio/speech`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ENV.openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice,
      input: text,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI TTS failed: ${response.status} ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
