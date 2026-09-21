
import os
import tempfile
import base64

from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def transcribe_audio(base64_audio: str):
    if "," in base64_audio:
        base64_audio = base64_audio.split(",", 1)[1]

    audio_bytes = base64.b64decode(base64_audio)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as audio_file:
            result = client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-large-v3-turbo",
                response_format="verbose_json",
            )

        return (
            result.text.strip(),
            getattr(result, "language", "en") or "en",
        )

    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
