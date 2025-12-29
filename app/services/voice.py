import os
import requests
# import speech_recognition as sr # Standard library, but heavy dependency. 
# For MVP, let's use a Mock or simple API if key is present.
from app.services.ai import GEMINI_API_KEY # Re-use key if possible or just mock

def handle_voice_message(media_url: str) -> str:
    """
    Downloads audio and converts to text.
    """
    print(f"DEBUG: Downloading audio from {media_url}")
    
    # Simulate download
    # response = requests.get(media_url)
    # audio_data = response.content
    
    # Mock STT
    # In real app, we would send audio_data to Whisper API or Google Speech API
    
    return "[Voice Message Transcribed]: I want to book an appointment for tomorrow."
