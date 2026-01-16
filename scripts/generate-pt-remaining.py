#!/usr/bin/env python3
"""Generate remaining Portuguese chapters 6-14"""

import os
import time
import requests
from pathlib import Path

ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")
ELEVENLABS_API_BASE = "https://api.elevenlabs.io"
VOICE_ID = "9SMbtbEswwG78xP75Lqm"

def generate_speech(voice_id, text):
    """Generate speech from Portuguese text"""
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

def generate_chapter(voice_id, chapter_number):
    """Generate Portuguese audio for a single chapter"""
    print(f"\n{'='*60}")
    print(f"Capítulo {chapter_number}")
    print('='*60)
    
    text_file_path = f"/home/ubuntu/destiny-hacking-app/manuscript-chapters-pt/chapter_{str(chapter_number).zfill(2)}.txt"
    with open(text_file_path, 'r', encoding='utf-8') as f:
        chapter_text = f.read()
    
    print(f"📄 Texto carregado: {len(chapter_text)} caracteres")
    
    chunks = chunk_text(chapter_text)
    print(f"📦 Dividido em {len(chunks)} partes")
    
    audio_chunks = []
    for i, chunk in enumerate(chunks):
        print(f"🎙️  Gerando áudio {i + 1}/{len(chunks)}...", end=' ')
        try:
            audio_buffer = generate_speech(voice_id, chunk)
            audio_chunks.append(audio_buffer)
            print(f"✅ {len(audio_buffer)} bytes")
            time.sleep(3)
        except Exception as error:
            print(f"❌ Falhou: {error}")
            raise
    
    print(f"🔗 Concatenando {len(audio_chunks)} partes...")
    final_audio = concatenate_mp3_files(audio_chunks)
    print(f"✅ Áudio final: {(len(final_audio) / 1024 / 1024):.2f} MB")
    
    output_path = f"/tmp/chapter_{str(chapter_number).zfill(2)}_pt.mp3"
    with open(output_path, 'wb') as f:
        f.write(final_audio)
    
    print(f"💾 Salvo: {output_path}")
    return output_path

def main():
    print("\n" + "="*60)
    print("Gerando Capítulos Restantes em Português (6-14)")
    print("="*60)
    
    start_time = time.time()
    completed = []
    failed = []
    
    # Only generate chapters 6-14
    for chapter_num in range(6, 15):
        try:
            output_path = generate_chapter(VOICE_ID, chapter_num)
            completed.append((chapter_num, output_path))
            print(f"\n✅ Capítulo {chapter_num} COMPLETO!")
            time.sleep(5)
        except Exception as error:
            print(f"\n❌ Capítulo {chapter_num} FALHOU: {error}")
            failed.append(chapter_num)
    
    end_time = time.time()
    total_minutes = round((end_time - start_time) / 60)
    
    print("\n" + "="*60)
    print("🎉 Geração completa!")
    print(f"⏱️  Tempo total: {total_minutes} minutos")
    print(f"✅ Completos: {len(completed)} capítulos")
    print(f"❌ Falhados: {len(failed)} capítulos")
    if failed:
        print(f"   Capítulos falhados: {failed}")
    print("="*60)

if __name__ == "__main__":
    main()
