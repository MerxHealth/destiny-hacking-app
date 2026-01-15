#!/usr/bin/env python3
"""Regenerate chapters 12-14 with improved API handling"""

import os
import time
import requests
from pathlib import Path
import json

ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")
ELEVENLABS_API_BASE = "https://api.elevenlabs.io"
VOICE_ID = "9SMbtbEswwG78xP75Lqm"

def generate_speech_with_retry(voice_id, text, max_retries=3):
    """Generate speech with retry logic"""
    
    headers = {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'audio/mpeg',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    
    data = {
        'text': text,
        'model_id': 'eleven_multilingual_v2',
        'voice_settings': {
            'stability': 0.5,
            'similarity_boost': 0.75
        }
    }
    
    for attempt in range(max_retries):
        try:
            response = requests.post(
                f"{ELEVENLABS_API_BASE}/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128",
                headers=headers,
                json=data,
                timeout=120
            )
            
            # Check if response is HTML (Cloudflare block)
            content_type = response.headers.get('Content-Type', '')
            if 'text/html' in content_type:
                print(f"   ⚠️  Got HTML response (attempt {attempt + 1}/{max_retries}), retrying...")
                time.sleep(10 * (attempt + 1))  # Exponential backoff
                continue
            
            if not response.ok:
                print(f"   ⚠️  API error {response.status_code} (attempt {attempt + 1}/{max_retries})")
                time.sleep(5 * (attempt + 1))
                continue
            
            return response.content
            
        except Exception as e:
            print(f"   ⚠️  Request failed (attempt {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(10 * (attempt + 1))
            else:
                raise
    
    raise Exception("Failed after all retries")

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
        file_paths = []
        for i, mp3_data in enumerate(mp3_files):
            file_path = os.path.join(temp_dir, f"chunk_{i}.mp3")
            with open(file_path, 'wb') as f:
                f.write(mp3_data)
            file_paths.append(file_path)
        
        filelist_path = os.path.join(temp_dir, "filelist.txt")
        with open(filelist_path, 'w') as f:
            for path in file_paths:
                f.write(f"file '{path}'\n")
        
        output_path = os.path.join(temp_dir, "output.mp3")
        subprocess.run(
            ['ffmpeg', '-f', 'concat', '-safe', '0', '-i', filelist_path, '-c', 'copy', output_path, '-y'],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True
        )
        
        with open(output_path, 'rb') as f:
            return f.read()

def regenerate_chapter(voice_id, chapter_number):
    """Regenerate a single chapter"""
    print(f"\n{'='*60}")
    print(f"Processing Chapter {chapter_number}")
    print('='*60)
    
    text_file_path = f"/home/ubuntu/destiny-hacking-app/manuscript-chapters/chapter_{str(chapter_number).zfill(2)}.txt"
    with open(text_file_path, 'r') as f:
        chapter_text = f.read()
    
    print(f"📄 Loaded: {len(chapter_text)} characters")
    
    chunks = chunk_text(chapter_text)
    print(f"📦 Split into {len(chunks)} chunks")
    
    audio_chunks = []
    for i, chunk in enumerate(chunks):
        print(f"\n🎙️  Chunk {i + 1}/{len(chunks)} ({len(chunk)} chars)")
        try:
            audio_buffer = generate_speech_with_retry(voice_id, chunk)
            audio_chunks.append(audio_buffer)
            print(f"   ✅ Generated: {len(audio_buffer)} bytes")
            
            # Longer delay between chunks
            time.sleep(5)
        except Exception as error:
            print(f"   ❌ Failed: {error}")
            raise
    
    print(f"\n🔗 Concatenating {len(audio_chunks)} chunks...")
    final_audio = concatenate_mp3_files(audio_chunks)
    print(f"✅ Final audio: {(len(final_audio) / 1024 / 1024):.2f} MB")
    
    output_path = f"/tmp/chapter_{str(chapter_number).zfill(2)}_elevenlabs.mp3"
    with open(output_path, 'wb') as f:
        f.write(final_audio)
    
    print(f"💾 Saved: {output_path}")
    return output_path

def main():
    print("\n" + "="*60)
    print("Regenerating Chapters 12, 13, 14")
    print("="*60)
    
    for chapter_num in [12, 13, 14]:
        try:
            regenerate_chapter(VOICE_ID, chapter_num)
            print(f"\n✅ Chapter {chapter_num} COMPLETE!")
            # Longer delay between chapters
            time.sleep(10)
        except Exception as error:
            print(f"\n❌ Chapter {chapter_num} FAILED: {error}")
            print("Continuing with next chapter...")
    
    print("\n" + "="*60)
    print("✅ Regeneration process complete!")
    print("="*60)

if __name__ == "__main__":
    main()
