import { db } from '../server/db';
import { bookChapters } from '../drizzle/schema';
import { asc } from 'drizzle-orm';

async function main() {
  const chapters = await db.select({
    id: bookChapters.id,
    num: bookChapters.chapterNumber,
    title: bookChapters.title,
    titlePt: bookChapters.titlePt,
  }).from(bookChapters).orderBy(asc(bookChapters.chapterNumber));

  console.log(`Total chapters: ${chapters.length}\n`);
  for (const c of chapters) {
    console.log(`Ch${c.num} | EN: ${c.title}`);
    console.log(`       | PT: ${c.titlePt || '(MISSING)'}`);
    console.log('');
  }
  process.exit(0);
}

main();
