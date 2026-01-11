# Chatterbox TTS Audiobook Regeneration Guide

## Overview

This guide explains how to regenerate your entire Destiny Hacking audiobook using **Chatterbox TTS** with your cloned voice. This will eliminate the repeating words issue present in the OpenAI TTS-generated audio.

## Why Chatterbox?

- ✅ **Better Quality**: 63.75% preference over ElevenLabs in blind tests
- ✅ **Voice Cloning**: Clone your voice with just 10 seconds of reference audio
- ✅ **No Repeating Words**: Superior audio generation without glitches
- ✅ **Free & Open Source**: MIT licensed, unlimited usage
- ✅ **Fast**: Faster than realtime generation

## Prerequisites

✅ **Already Installed:**
- Chatterbox TTS (v0.1.6)
- PyTorch 2.6.0 with CUDA support
- All required dependencies

## Step 1: Prepare Your Voice Sample

### Recording Your Voice

1. **Find a quiet environment** with minimal background noise
2. **Use a good microphone** (headset mic or USB mic recommended)
3. **Record at least 10-15 seconds** of clear speech
4. **Speak naturally** in your normal reading voice
5. **Read diverse content** - narrative, questions, different emotions

### Sample Recording Script

Read this aloud for your voice sample:

```
Welcome to Destiny Hacking. In this book, we'll explore how to align your daily actions 
with your deepest values. You'll learn practical techniques for emotional calibration, 
decision-making under uncertainty, and building lasting habits. Are you ready to take 
control of your destiny? Let's begin this transformative journey together.
```

### Save Your Recording

1. Save as WAV format (highest quality)
2. Place the file at: `/tmp/voice_sample.wav`
3. Alternative path: Set `VOICE_SAMPLE_PATH` environment variable

```bash
# Example: Record with arecord (Linux)
arecord -f cd -d 15 /tmp/voice_sample.wav

# Or upload your file
cp ~/my_voice.wav /tmp/voice_sample.wav
```

## Step 2: Run the Regeneration Script

### Full Audiobook Regeneration

Regenerate all 14 chapters with your voice:

```bash
cd /home/ubuntu/destiny-hacking-app
pnpm tsx scripts/regenerate-audiobook-chatterbox.ts
```

### What Happens:

1. ✅ Loads your voice sample for cloning
2. ✅ Processes each chapter text file
3. ✅ Splits long chapters into manageable chunks
4. ✅ Generates audio using Chatterbox TTS with your voice
5. ✅ Concatenates chunks into complete chapter audio
6. ✅ Uploads to S3
7. ✅ Updates database with new URLs

### Expected Duration:

- **Per Chapter**: 5-15 minutes (depending on length)
- **Total Time**: 1-3 hours for all 14 chapters

## Step 3: Monitor Progress

The script provides detailed progress output:

```
🎙️  Chatterbox Audiobook Regeneration Script
================================================================================

✅ Voice sample found: /tmp/voice_sample.wav
Found 14 chapters to process

================================================================================
Processing Chapter 1: Introduction
================================================================================

Text length: 8543 characters
Split into 3 chunks

Generating chunk 1/3...
Loading Chatterbox model...
Reading text...
Generating audio for 2847 characters...
Saving audio...
Chunk 1 duration: 3.45s

...

Total duration: 12.34 minutes

Concatenating audio chunks...
Uploading to S3...
Uploaded: https://storage.example.com/audiobook/chapter_01_chatterbox.wav

Updating database...

✅ Chapter 1 complete!
```

## Step 4: Verify Results

### Check in the App

1. Navigate to the Audiobook page
2. Play any chapter
3. Verify the audio quality and your voice
4. Check for repeating words (should be gone!)

### Database Verification

```bash
cd /home/ubuntu/destiny-hacking-app
pnpm tsx -e "
import { db } from './server/_core/db';
import { bookChapters } from './drizzle/schema';

const chapters = await db.select().from(bookChapters);
console.log('Chapters with audio:', chapters.filter(c => c.audioUrl).length);
"
```

## Troubleshooting

### Issue: "Voice sample not found"

**Solution**: Ensure your voice file is at `/tmp/voice_sample.wav`

```bash
ls -lh /tmp/voice_sample.wav
```

### Issue: "CUDA out of memory"

**Solution**: The sandbox has limited GPU memory. Try:

1. Restart the script (it will skip completed chapters)
2. Process one chapter at a time
3. Reduce chunk size in the script

### Issue: "Chapter text file not found"

**Solution**: Verify chapter text files exist:

```bash
ls -lh /home/ubuntu/destiny-hacking-app/manuscript-chapters/
```

### Issue: "Audio quality is poor"

**Solution**: 
- Re-record voice sample with better microphone
- Ensure 10+ seconds of clear speech
- Speak naturally, not too fast or slow
- Use a quiet environment

## Advanced Usage

### Regenerate Single Chapter

Edit the script to process only one chapter:

```typescript
// In regenerate-audiobook-chatterbox.ts
const chapters = await db
  .select(...)
  .from(bookChapters)
  .where(eq(bookChapters.chapterNumber, 2)) // Only Chapter 2
  .orderBy(bookChapters.chapterNumber);
```

### Adjust Voice Parameters

Modify generation parameters for different voice characteristics:

```typescript
const { duration } = await generateChatterboxAudio(
  chunks[i],
  voiceSamplePath,
  chunkFile,
  {
    exaggeration: 0.7,  // 0.0-1.0, higher = more expressive
    cfgWeight: 0.6,     // 0.0-1.0, higher = more faithful to prompt
  }
);
```

### Custom Voice Sample Path

```bash
VOICE_SAMPLE_PATH=/path/to/my/voice.wav pnpm tsx scripts/regenerate-audiobook-chatterbox.ts
```

## Next Steps

After successful regeneration:

1. ✅ **Test all chapters** - Listen to samples from each
2. ✅ **Update todo.md** - Mark Chatterbox integration complete
3. ✅ **Save checkpoint** - Preserve the working state
4. ✅ **Share with users** - Deploy the updated audiobook

## Technical Details

### Chatterbox Model

- **Model**: Chatterbox-Turbo (350M parameters)
- **Provider**: Resemble AI
- **License**: MIT (open source)
- **Speed**: Faster than realtime
- **Quality**: State-of-the-art voice cloning

### Audio Format

- **Format**: WAV (uncompressed)
- **Sample Rate**: 22050 Hz (model default)
- **Channels**: Mono
- **Bit Depth**: 16-bit

### Storage

- **Location**: S3 bucket
- **Path**: `audiobook/chapter_XX_chatterbox.wav`
- **Access**: Public URLs (no signing required)

## Support

If you encounter issues:

1. Check the console output for error messages
2. Verify voice sample quality and format
3. Ensure sufficient disk space (2-3 GB for temp files)
4. Check GPU availability: `python3 -c "import torch; print(torch.cuda.is_available())"`

## Files Created by This Guide

- `/home/ubuntu/destiny-hacking-app/scripts/regenerate-audiobook-chatterbox.ts` - Main regeneration script
- `/home/ubuntu/destiny-hacking-app/server/_core/chatterbox-tts.ts` - Chatterbox integration module
- `/home/ubuntu/chatterbox-research.md` - Research notes on Chatterbox
- `/home/ubuntu/destiny-hacking-app/CHATTERBOX_AUDIOBOOK_GUIDE.md` - This guide

## Success Criteria

✅ All 14 chapters have new audio URLs in database  
✅ Audio plays without repeating words  
✅ Voice sounds natural and consistent  
✅ Chapter durations are reasonable (10-20 minutes each)  
✅ Users can listen to the audiobook with your voice  

---

**Ready to begin?** Start with Step 1: Prepare Your Voice Sample!
