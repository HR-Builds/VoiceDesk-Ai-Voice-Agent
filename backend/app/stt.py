import os
import tempfile
import base64
import whisper

# Load the small Whisper model once.
# This keeps memory usage much lower than base/small/medium.
_model = whisper.load_model("tiny")


def get_model():
    global _model

    if _model is None:
        _model = whisper.load_model("tiny")

    return _model


def transcribe_audio(base64_audio: str):
    """Decode base64 WebM audio and transcribe it with local Whisper."""

    # Remove data URL prefix if the frontend sends one.
    if "," in base64_audio:
        base64_audio = base64_audio.split(",", 1)[1]

    audio_bytes = base64.b64decode(base64_audio)

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".webm"
    ) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        model = get_model()
        result = model.transcribe(tmp_path)

        return (
            result["text"].strip(),
            result.get("language", "en")
        )

    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)