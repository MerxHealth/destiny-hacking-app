import { storagePut } from '../server/storage';
import { db } from '../server/db';
import { bookChapters } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

async function uploadAndUpdateChapter(chapterNumber: number) {
  const localPath = `/tmp/chapter_${String(chapterNumber).padStart(2, '0')}_elevenlabs.mp3`;
  
  // Check if file exists
  if (!fs.existsSync(localPath)) {
    console.log(`⏭️  Chapter ${chapterNumber}: File not found, skipping`);
    return;
  }
  
  console.log(`\n📤 Processing Chapter ${chapterNumber}...`);
  
  // Read audio file
  const audio = fs.readFileSync(localPath);
  console.log(`   File size: ${(audio.length / 1024 / 1024).toFixed(2)} MB`);
  
  // Upload to S3
  console.log(`   Uploading to S3...`);
  const s3Key = `audiobook/chapter_${String(chapterNumber).padStart(2, '0')}_elevenlabs.mp3`;
  const { url } = await storagePut(s3Key, audio, 'audio/mpeg');
  console.log(`   ✅ Uploaded: ${url}`);
  
  // Update database
  console.log(`   Updating database...`);
  await db
    .update(bookChapters)
    .set({ audioUrl: url })
    .where(eq(bookChapters.chapterNumber, chapterNumber));
  
  console.log(`   ✅ Database updated`);
}

async function main() {
  console.log('🚀 Uploading completed chapters to S3 and updating database');
  console.log('='.repeat(60));
  
  // Process chapters 1-14
  for (let i = 1; i <= 14; i++) {
    try {
      await uploadAndUpdateChapter(i);
    } catch (error) {
      console.error(`❌ Failed to process Chapter ${i}:`, error);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Upload and update complete!');
}

main().catch(console.error);
