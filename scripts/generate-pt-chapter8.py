#!/usr/bin/env python3
"""Generate Portuguese Chapter 8 only"""

import os
import time
import requests

ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")
ELEVENLABS_API_BASE = "https://api.elevenlabs.io"
VOICE_ID = "9SMbtbEswwG78xP75Lqm"

def generate_speech(voice_id, text):
    headers = {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
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
        raise Exception(f"Failed: {response.status_code} {response.text}")
    
    return response.content

def chunk_text(text, max_chunk_size=4500):
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

print("="*60)
print("Gerando Capítulo 8 em Português")
print("="*60)

text_file_path = "/home/ubuntu/destiny-hacking-app/manuscript-chapters-pt/chapter_08.txt"
with open(text_file_path, 'r', encoding='utf-8') as f:
    chapter_text = f.read()

print(f"📄 Texto: {len(chapter_text)} caracteres")

chunks = chunk_text(chapter_text)
print(f"📦 Partes: {len(chunks)}")

audio_chunks = []
for i, chunk in enumerate(chunks):
    print(f"🎙️  {i + 1}/{len(chunks)}...", end=' ')
    audio_buffer = generate_speech(VOICE_ID, chunk)
    audio_chunks.append(audio_buffer)
    print(f"✅ {len(audio_buffer)} bytes")
    time.sleep(3)

print("🔗 Concatenando...")
final_audio = concatenate_mp3_files(audio_chunks)
print(f"✅ Final: {(len(final_audio) / 1024 / 1024):.2f} MB")

output_path = "/tmp/chapter_08_pt.mp3"
with open(output_path, 'wb') as f:
    f.write(final_audio)

print(f"💾 Salvo: {output_path}")
print("="*60)
print("✅ Capítulo 8 completo!")
print("="*60)
