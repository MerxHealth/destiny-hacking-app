import { storagePut } from '../server/storage';
import { db } from '../server/db';
import { bookChapters } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';

async function uploadPortugueseChapter(chapterNumber: number) {
  const localPath = `/tmp/chapter_${String(chapterNumber).padStart(2, '0')}_pt.mp3`;
  
  if (!fs.existsSync(localPath)) {
    console.log(`⏭️  Chapter ${chapterNumber}: File not found, skipping`);
    return;
  }
  
  console.log(`\n📤 Processing Portuguese Chapter ${chapterNumber}...`);
  
  const audio = fs.readFileSync(localPath);
  console.log(`   File size: ${(audio.length / 1024 / 1024).toFixed(2)} MB`);
  
  console.log(`   Uploading to S3...`);
  const s3Key = `audiobook/chapter_${String(chapterNumber).padStart(2, '0')}_pt.mp3`;
  const { url } = await storagePut(s3Key, audio, 'audio/mpeg');
  console.log(`   ✅ Uploaded: ${url}`);
  
  console.log(`   Updating database...`);
  await db
    .update(bookChapters)
    .set({ audioUrlPt: url })
    .where(eq(bookChapters.chapterNumber, chapterNumber));
  
  console.log(`   ✅ Database updated`);
}

async function main() {
  console.log('🚀 Uploading Portuguese audiobook chapters to S3');
  console.log('='.repeat(60));
  
  for (let i = 1; i <= 14; i++) {
    try {
      await uploadPortugueseChapter(i);
    } catch (error) {
      console.error(`❌ Failed to process Chapter ${i}:`, error);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Upload complete!');
  console.log('='.repeat(60));
}

main().catch(console.error);
