import { db } from '../server/_core/db.js';
import { bookChapters } from '../drizzle/schema.js';
import { asc } from 'drizzle-orm';

async function main() {
  const chapters = await db.select({
    id: bookChapters.id,
    num: bookChapters.chapterNumber,
    title: bookChapters.title,
    audioGenerated: bookChapters.audioGenerated,
  }).from(bookChapters).orderBy(asc(bookChapters.chapterNumber));

  console.log(`Total chapters: ${chapters.length}`);
  for (const c of chapters) {
    console.log(`${c.id} | Ch${c.num} | ${c.title} | ${c.audioGenerated ? 'audio' : 'no-audio'}`);
  }
  process.exit(0);
}

main();
