/**
 * Upload voice sample endpoint
 * Handles file upload to S3 for voice cloning
 */

import type { Request, Response } from "express";
import { storagePut } from "../storage";
import formidable from "formidable";
import { readFileSync } from "fs";

export async function uploadVoiceSample(req: Request, res: Response) {
  try {
    // Parse multipart form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB max
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);

    const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Read file content
    const fileBuffer = readFileSync(file.filepath);

    // Generate unique S3 key
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const fileKey = `voice-samples/${timestamp}-${randomSuffix}.webm`;

    // Upload to S3
    const { url } = await storagePut(fileKey, fileBuffer, "audio/webm");

    return res.json({ url });
  } catch (error) {
    console.error("Voice sample upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}
