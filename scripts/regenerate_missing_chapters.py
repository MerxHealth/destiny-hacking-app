#!/usr/bin/env python3
"""Regenerate only missing chapters 12, 13, 14"""

import os
import time
import requests
from pathlib import Path

ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")
ELEVENLABS_API_BASE = "https://api.elevenlabs.io"
VOICE_ID = "9SMbtbEswwG78xP75Lqm"  # Already cloned voice

def generate_speech(voice_id, text):
    """Generate speech from text using cloned voice"""
    headers = {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
    }
    
    data = {
        'text': text,
        'model_id': 'eleven_multilingual_v2',
        'voice_settings': {
            'stability': 0.5,
            'similarity_boost': 0.75
        }
    }
    
    response = requests.post(
        f"{ELEVENLABS_API_BASE}/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128",
        headers=headers,
        json=data,
        timeout=120
    )
    
    if not response.ok:
        raise Exception(f"Speech generation failed: {response.status_code} {response.text}")
    
    return response.content

def chunk_text(text, max_chunk_size=4500):
    """Split text into sentence-aware chunks"""
    import re
    sentences = re.findall(r'[^.!?]+[.!?]+', text)
    if not sentences:
        sentences = [text]
    
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        if len(current_chunk + sentence) > max_chunk_size and len(current_chunk) > 0:
            chunks.append(current_chunk.strip())
            current_chunk = sentence
        else:
            current_chunk += " " + sentence
    
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    return chunks

def concatenate_mp3_files(mp3_files):
    """Concatenate MP3 files using ffmpeg"""
    import tempfile
    import subprocess
    
    with tempfile.TemporaryDirectory() as temp_dir:
        # Write all MP3 files
        file_paths = []
        for i, mp3_data in enumerate(mp3_files):
            file_path = os.path.join(temp_dir, f"chunk_{i}.mp3")
            with open(file_path, 'wb') as f:
                f.write(mp3_data)
            file_paths.append(file_path)
        
        # Create filelist for ffmpeg
        filelist_path = os.path.join(temp_dir, "filelist.txt")
        with open(filelist_path, 'w') as f:
            for path in file_paths:
                f.write(f"file '{path}'\n")
        
        # Concatenate with ffmpeg
        output_path = os.path.join(temp_dir, "output.mp3")
        subprocess.run(
            ['ffmpeg', '-f', 'concat', '-safe', '0', '-i', filelist_path, '-c', 'copy', output_path, '-y'],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True
        )
        
        # Read result
        with open(output_path, 'rb') as f:
            return f.read()

def regenerate_chapter(voice_id, chapter_number):
    """Regenerate a single chapter"""
    print(f"\n=== Processing Chapter {chapter_number} ===")
    
    # Read chapter text
    text_file_path = f"/home/ubuntu/destiny-hacking-app/manuscript-chapters/chapter_{str(chapter_number).zfill(2)}.txt"
    with open(text_file_path, 'r') as f:
        chapter_text = f.read()
    
    print(f"📄 Loaded chapter text: {len(chapter_text)} characters")
    
    # Split into chunks
    chunks = chunk_text(chapter_text)
    print(f"📦 Split into {len(chunks)} chunks")
    
    # Generate audio for each chunk
    audio_chunks = []
    for i, chunk in enumerate(chunks):
        print(f"🎙️  Generating audio for chunk {i + 1}/{len(chunks)}...")
        try:
            audio_buffer = generate_speech(voice_id, chunk)
            audio_chunks.append(audio_buffer)
            print(f"✅ Chunk {i + 1} generated ({len(audio_buffer)} bytes)")
            
            # Longer delay to avoid rate limiting
            time.sleep(3)
        except Exception as error:
            print(f"❌ Failed to generate chunk {i + 1}: {error}")
            raise
    
    # Concatenate all chunks
    print(f"🔗 Concatenating {len(audio_chunks)} audio chunks...")
    final_audio = concatenate_mp3_files(audio_chunks)
    print(f"✅ Final audio: {len(final_audio)} bytes")
    
    # Save locally
    output_path = f"/tmp/chapter_{str(chapter_number).zfill(2)}_elevenlabs.mp3"
    with open(output_path, 'wb') as f:
        f.write(final_audio)
    
    print(f"✅ Chapter {chapter_number} complete! Saved to: {output_path}")
    return output_path

def main():
    print("🚀 Regenerating missing chapters 12, 13, 14")
    print("=" * 60)
    
    missing_chapters = [12, 13, 14]
    
    for chapter_num in missing_chapters:
        try:
            regenerate_chapter(VOICE_ID, chapter_num)
        except Exception as error:
            print(f"❌ Failed to regenerate Chapter {chapter_num}: {error}")
    
    print("\n" + "=" * 60)
    print("✅ Regeneration complete!")

if __name__ == "__main__":
    main()
