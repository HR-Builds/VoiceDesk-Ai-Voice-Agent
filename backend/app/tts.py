import base64
import os
import tempfile

from groq import Groq

from app.config import settings

groq_client = Groq(api_key=settings.GROQ_API_KEY)


def text_to_speech(text: str) -> str:
    """Convert text to audio and return base64-encoded audio."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp_path = tmp.name

    try:
        response = groq_client.audio.speech.create(
            model="playai-tts",
            voice="Fritz-PlayAI",
            input=text,
            response_format="wav",
        )
        response.write_to_file(tmp_path)

        with open(tmp_path, "rb") as f:
            audio_bytes = f.read()
        return base64.b64encode(audio_bytes).decode("utf-8")
    finally:
        os.unlink(tmp_path)