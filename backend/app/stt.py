import os
import tempfile
import base64
import whisper

# Load model once (downloads on first run ~150MB)
_model = whisper.load_model("tiny")  # "base" ki jagah "tiny"

def get_model():
    global _model
    if _model is None:
        _model = whisper.load_model("base")  # or "tiny" for faster
    return _model

def transcribe_audio(base64_audio: str):
    """Decode base64 webm and transcribe with local Whisper."""
    audio_bytes = base64.b64decode(base64_audio)
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name
    
    try:
        model = get_model()
        result = model.transcribe(tmp_path)
        return result["text"].strip(), result.get("language", "en")
    finally:
        os.unlink(tmp_path)