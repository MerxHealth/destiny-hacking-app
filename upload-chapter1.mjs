import { storagePut } from '/home/ubuntu/destiny-hacking-app/server/storage.js';
import fs from 'fs';

const audio = fs.readFileSync('/tmp/chapter_01_elevenlabs.mp3');
const result = await storagePut('audiobook/chapter_01_elevenlabs_final.mp3', audio, 'audio/mpeg');
console.log(result.url);
