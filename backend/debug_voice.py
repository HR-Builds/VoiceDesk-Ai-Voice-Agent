# backend/debug_voice.py
import os
import sys

# Force load env
from dotenv import load_dotenv
load_dotenv()

print("=" * 50)
print("VOICEDESK DEBUG SCRIPT")
print("=" * 50)

# Test 1: Database
print("\n[1] Testing Database...")
try:
    from app.database import SessionLocal
    from app.models import Company, Conversation, Order
    db = SessionLocal()
    company = db.query(Company).first()
    if company:
        print(f"   OK - Company found: {company.name} (ID: {company.id})")
    else:
        print("   FAIL - No company found! Register one first.")
        sys.exit(1)
except Exception as e:
    print(f"   FAIL - {e}")
    sys.exit(1)

# Test 2: Qdrant
print("\n[2] Testing Qdrant...")
try:
    from app.rag import ensure_collection, search_kb
    ensure_collection()
    chunks = search_kb(str(company.id), "test query", top_k=1)
    print(f"   OK - Qdrant working, found {len(chunks)} chunks")
except Exception as e:
    print(f"   FAIL - {e}")
    print("   Fix: docker-compose up -d")

# Test 3: OpenAI LLM
print("\n[3] Testing OpenAI LLM...")
try:
    from app.llm import ask_bot
    reply = ask_bot(company.name, "hello", [], None, [])
    print(f"   OK - LLM reply: {reply[:60]}...")
except Exception as e:
    print(f"   FAIL - {e}")
    print("   Fix: Check OPENAI_API_KEY in .env")

# Test 4: OpenAI TTS
print("\n[4] Testing OpenAI TTS...")
try:
    from app.tts import text_to_speech
    audio = text_to_speech("Hello, this is a test.")
    print(f"   OK - TTS generated, length: {len(audio)} chars")
except Exception as e:
    print(f"   FAIL - {e}")

# Test 5: OpenAI STT (Whisper)
print("\n[5] Testing OpenAI STT...")
try:
    from app.stt import transcribe_audio
    # Create a dummy base64 webm (1 second of silence-ish)
    import base64
    dummy_audio = base64.b64encode(b'\x00\x00\x00\x00' * 1000).decode()
    # This will likely fail but let's see the error
    result = transcribe_audio(dummy_audio)
    print(f"   OK - STT: {result}")
except Exception as e:
    print(f"   EXPECTED FAIL (dummy audio) - {str(e)[:80]}")

# Test 6: JSON Transcript
print("\n[6] Testing DB JSON Transcript...")
try:
    conv = Conversation(
        company_id=company.id,
        session_id="test-session-123",
        transcript=[],
    )
    db.add(conv)
    db.commit()
    
    # Append to transcript
    transcript = list(conv.transcript or [])
    transcript.append({"speaker": "customer", "text": "hi"})
    conv.transcript = transcript
    db.commit()
    
    # Verify
    conv_check = db.query(Conversation).filter_by(session_id="test-session-123").first()
    print(f"   OK - Transcript saved: {conv_check.transcript}")
    
    # Cleanup
    db.delete(conv)
    db.commit()
except Exception as e:
    print(f"   FAIL - {e}")

db.close()
print("\n" + "=" * 50)
print("DEBUG COMPLETE")
print("=" * 50)