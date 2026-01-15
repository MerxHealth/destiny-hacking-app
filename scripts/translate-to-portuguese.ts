import { invokeLLM } from '../server/_core/llm';
import * as fs from 'fs';
import * as path from 'path';

async function translateChapter(chapterNumber: number) {
  console.log(`\n=== Translating Chapter ${chapterNumber} ===`);
  
  // Read English chapter
  const englishPath = `/home/ubuntu/destiny-hacking-app/manuscript-chapters/chapter_${String(chapterNumber).padStart(2, '0')}.txt`;
  const englishText = fs.readFileSync(englishPath, 'utf-8');
  console.log(`📄 Loaded English text: ${englishText.length} characters`);
  
  // Translate to Portuguese
  console.log(`🌐 Translating to Portuguese...`);
  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: 'You are a professional translator specializing in self-help and personal development books. Translate the following text from English to Brazilian Portuguese. Maintain the tone, style, and formatting. Keep paragraph breaks and structure intact. Only output the translated text, nothing else.'
      },
      {
        role: 'user',
        content: englishText
      }
    ]
  });
  
  const portugueseText = response.choices[0].message.content;
  console.log(`✅ Translated: ${portugueseText.length} characters`);
  
  // Save Portuguese version
  const portuguesePath = `/home/ubuntu/destiny-hacking-app/manuscript-chapters-pt/chapter_${String(chapterNumber).padStart(2, '0')}.txt`;
  fs.mkdirSync(path.dirname(portuguesePath), { recursive: true });
  fs.writeFileSync(portuguesePath, portugueseText, 'utf-8');
  console.log(`💾 Saved: ${portuguesePath}`);
}

async function main() {
  console.log('🚀 Starting Portuguese translation of all chapters');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  
  // Translate all 14 chapters
  for (let i = 1; i <= 14; i++) {
    try {
      await translateChapter(i);
    } catch (error) {
      console.error(`❌ Failed to translate Chapter ${i}:`, error);
    }
  }
  
  const endTime = Date.now();
  const totalMinutes = Math.round((endTime - startTime) / 1000 / 60);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Translation complete!');
  console.log(`⏱️  Total time: ${totalMinutes} minutes`);
  console.log('='.repeat(60));
}

main().catch(console.error);
