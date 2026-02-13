import { db } from '../server/db.ts';
import { bookModules } from '../drizzle/schema.ts';

const modules = await db.select().from(bookModules).orderBy(bookModules.moduleNumber);
console.log('Total modules:', modules.length);
if (modules.length === 0) {
  console.log('NO MODULES FOUND - table is empty!');
} else {
  modules.forEach(m => {
    console.log(`#${m.moduleNumber} "${m.title}" | principle: ${(m.corePrinciple || '').substring(0, 80)} | practice: ${(m.dailyPractice || '').substring(0, 60)} | est: ${m.estimatedMinutes}min`);
  });
}
process.exit(0);
