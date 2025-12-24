import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { bookModules } from './drizzle/schema.ts';
import { modulesSeedData } from './server/seedModules.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('Seeding book modules...');

for (const module of modulesSeedData) {
  await db.insert(bookModules).values(module).onDuplicateKeyUpdate({
    set: {
      title: module.title,
      corePrinciple: module.corePrinciple,
      mentalModel: module.mentalModel,
      dailyPractice: module.dailyPractice,
      decisionChallenge: module.decisionChallenge,
      reflectionPrompt: module.reflectionPrompt,
      requiredPreviousModule: module.requiredPreviousModule,
      requiredPracticeDays: module.requiredPracticeDays,
      estimatedMinutes: module.estimatedMinutes,
    }
  });
  console.log(`✓ Module ${module.moduleNumber}: ${module.title}`);
}

console.log('✓ All modules seeded successfully!');
await connection.end();
