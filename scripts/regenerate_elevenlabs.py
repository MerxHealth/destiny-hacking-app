#!/usr/bin/env python3
"""
Regenerate all audiobook chapters using ElevenLabs TTS with voice cloning
"""

import os
import sys
import time
import requests
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")
ELEVENLABS_API_BASE = "https://api.elevenlabs.io"
VOICE_SAMPLE_PATH = "/tmp/voice_sample.wav"

if not ELEVENLABS_API_KEY:
    print("❌ ELEVENLABS_API_KEY not found in environment")
    sys.exit(1)

def clone_voice(name, audio_path):
    """Clone voice from audio sample"""
    print(f"🎤 Cloning voice '{name}' from {audio_path}...")
    
    with open(audio_path, 'rb') as audio_file:
        files = {
            'files': ('voice_sample.wav', audio_file, 'audio/wav')
        }
        data = {
            'name': name,
            'description': 'Author voice for Destiny Hacking audiobook'
        }
        headers = {
            'xi-api-key': ELEVENLABS_API_KEY
        }
        
        response = requests.post(
            f"{ELEVENLABS_API_BASE}/v1/voices/add",
            headers=headers,
            data=data,
            files=files
        )
        
        if not response.ok:
            raise Exception(f"Voice cloning failed: {response.status_code} {response.text}")
        
        result = response.json()
        voice_id = result['voice_id']
        print(f"✅ Voice cloned successfully! Voice ID: {voice_id}")
        return voice_id

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
        json=data
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

def upload_to_s3(audio_data, chapter_number):
    """Upload audio to S3 using the storage helper"""
    # We'll use curl to call the tRPC endpoint
    import subprocess
    import tempfile
    
    # Save audio to temp file
    with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
        temp_file.write(audio_data)
        temp_path = temp_file.name
    
    try:
        # Use Python to upload via storage module
        # This is a workaround - ideally we'd import the storage module
        # For now, we'll save locally and return a placeholder
        output_path = f"/tmp/chapter_{str(chapter_number).zfill(2)}_elevenlabs.mp3"
        with open(output_path, 'wb') as f:
            f.write(audio_data)
        print(f"💾 Saved locally to: {output_path}")
        return output_path
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)

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
            
            # Small delay to avoid rate limiting
            time.sleep(0.5)
        except Exception as error:
            print(f"❌ Failed to generate chunk {i + 1}: {error}")
            raise
    
    # Concatenate all chunks
    print(f"🔗 Concatenating {len(audio_chunks)} audio chunks...")
    final_audio = concatenate_mp3_files(audio_chunks)
    print(f"✅ Final audio: {len(final_audio)} bytes")
    
    # Upload to S3 (or save locally for now)
    print(f"☁️  Saving audio...")
    output_path = upload_to_s3(final_audio, chapter_number)
    
    print(f"✅ Chapter {chapter_number} complete! Saved to: {output_path}")
    return output_path

def main():
    print("🚀 Starting audiobook regeneration with ElevenLabs TTS")
    print("=" * 60)
    
    # Use existing cloned voice
    voice_id = "9SMbtbEswwG78xP75Lqm"  # Already cloned
    print(f"Using cloned voice ID: {voice_id}")
    
    # Get all chapter files
    manuscript_dir = Path("/home/ubuntu/destiny-hacking-app/manuscript-chapters")
    chapter_files = sorted(manuscript_dir.glob("chapter_*.txt"))
    
    print(f"📚 Found {len(chapter_files)} chapters to process")
    
    start_time = time.time()
    completed = []
    failed = []
    
    # Process each chapter
    for chapter_file in chapter_files:
        chapter_number = int(chapter_file.stem.split('_')[1])
        try:
            output_path = regenerate_chapter(voice_id, chapter_number)
            completed.append((chapter_number, output_path))
        except Exception as error:
            print(f"❌ Failed to regenerate Chapter {chapter_number}: {error}")
            failed.append(chapter_number)
            print("Continuing with next chapter...")
    
    end_time = time.time()
    total_minutes = round((end_time - start_time) / 60)
    
    print("=" * 60)
    print("🎉 Audiobook regeneration complete!")
    print(f"⏱️  Total time: {total_minutes} minutes")
    print(f"✅ Completed: {len(completed)} chapters")
    print(f"❌ Failed: {len(failed)} chapters")
    if failed:
        print(f"   Failed chapters: {failed}")
    print("=" * 60)
    
    # Print output paths
    print("\n📁 Generated files:")
    for chapter_num, path in completed:
        print(f"   Chapter {chapter_num}: {path}")

if __name__ == "__main__":
    main()
