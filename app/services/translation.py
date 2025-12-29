from langdetect import detect, LangDetectException
from google import genai
import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

def detect_language(text: str) -> str:
    """
    Detects the language of the input text.
    Returns ISO 639-1 code (e.g., 'en', 'es', 'hi').
    """
    try:
        lang = detect(text)
        return lang
    except LangDetectException:
        return "en"

def translate_text(text: str, target_lang: str) -> str:
    """
    Translates text to the target language using Gemini (or fallback).
    """
    if target_lang == "en":
        return text

    if not client:
        # Mock Translation for testing
        return f"[Translated to {target_lang}]: {text}"
        
    try:
        prompt = f"Translate the following text to {target_lang}. Return ONLY the translation.\n\nText: {text}"
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        print(f"Translation Error: {e}")
        return text # Fallback to original
