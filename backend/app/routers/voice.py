import json
import uuid
import base64
import logging
from datetime import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Company, Conversation, Order
from app.rag import search_kb
from app.llm import ask_bot
from app.stt import transcribe_audio
from app.tts import text_to_speech

router = APIRouter(prefix="/voice", tags=["Voice"])

logger = logging.getLogger(__name__)


@router.websocket("/ws/{company_slug}")
async def voice_websocket(websocket: WebSocket, company_slug: str):
    await websocket.accept()
    db = SessionLocal()
    conv = None

    try:
        # Step 1: Find company
        company = db.query(Company).filter(Company.slug == company_slug).first()
        if not company:
            logger.warning(f"Company not found: {company_slug}")
            await websocket.send_json({
                "type": "error",
                "message": "Company not found. Please check your slug."
            })
            await websocket.close(code=4004, reason="Company not found")
            return

        # Step 2: Create conversation session
        session_id = str(uuid.uuid4())
        conv = Conversation(
            company_id=company.id,
            session_id=session_id,
            transcript=[],
        )
        db.add(conv)
        db.commit()
        logger.info(f"New voice session: {session_id} for company: {company.name}")

        await websocket.send_json({
            "type": "ready",
            "session_id": session_id,
            "message": f"VoiceDesk AI for {company.name} connected. Start speaking or type."
        })

        # Step 3: Message loop
        while True:
            try:
                message = await websocket.receive_json()
            except Exception as e:
                logger.info(f"Client disconnected or invalid JSON: {e}")
                break

            msg_type = message.get("type")
            data = message.get("data", "")
            logger.info(f"Received {msg_type} message")

            user_lang = "en"

            if msg_type == "audio":
                try:
                    user_text, user_lang = transcribe_audio(data)  # <-- ab 2 values
                    logger.info(f"STT result [{user_lang}]: {user_text}")
                except Exception as e:
                    logger.error(f"STT error: {e}")
                    await websocket.send_json({
                        "type": "error",
                        "message": "Could not understand audio. Please try again or use text."
                    })
                    continue

            elif msg_type == "text":
                user_text = data
                logger.info(f"Text input: {user_text}")

            elif msg_type == "end":
                logger.info("Client sent end signal")
                break

            else:
                logger.warning(f"Unknown message type: {msg_type}")
                continue

            # Build/refresh the running transcript once per loop iteration,
            # before it's needed anywhere below (fixes the scoping bug).
            transcript = list(conv.transcript or [])

            # Log customer message to transcript
            try:
                transcript.append({
                    "speaker": "user",
                    "text": user_text,
                    "timestamp": datetime.utcnow().isoformat(),
                })
                conv.transcript = transcript
                db.commit()
            except Exception as e:
                logger.error(f"DB save error (user): {e}")
                db.rollback()

            # --- Human escalation detection ---
            if any(w in user_text.lower() for w in ["agent", "human", "representative", "manager"]):
                conv.escalation = True
                db.commit()
                bot_text = "Bilkul! Main aapko human agent se connect kar raha hoon. Hamari team 2 ghante ke andar contact karegi. Kuch aur bhi poochna ho to bataiye."
                try:
                    transcript.append({
                        "speaker": "bot",
                        "text": bot_text,
                        "timestamp": datetime.utcnow().isoformat(),
                    })
                    conv.transcript = transcript
                    db.commit()
                except Exception:
                    db.rollback()
                try:
                    await websocket.send_json({"type": "response", "text": bot_text, "audio": None})
                except Exception:
                    break
                continue

            # Look for order number
            order_data = None
            try:
                for word in user_text.split():
                    if len(word) >= 5 and word.isalnum():
                        order_obj = db.query(Order).filter(
                            Order.company_id == company.id,
                            Order.order_number.ilike(f"%{word}%")
                        ).first()
                        if order_obj:
                            order_data = {
                                "order_number": order_obj.order_number,
                                "status": order_obj.status,
                                "total_amount": order_obj.total_amount,
                                "items": order_obj.items,
                            }
                            logger.info(f"Found order: {order_obj.order_number}")
                            break
            except Exception as e:
                logger.error(f"Order lookup error: {e}")

            # Search knowledge base
            kb_chunks = []
            try:
                kb_chunks = search_kb(str(company.id), user_text, top_k=3)
                logger.info(f"KB found {len(kb_chunks)} chunks")
            except Exception as e:
                logger.error(f"KB search error: {e}")
                kb_chunks = []

            # Ask LLM
            bot_text = "I'm sorry, I'm having trouble thinking right now. Please try again in a moment."
            try:
                bot_text = ask_bot(
                    company_name=company.name,
                    question=user_text,
                    kb_chunks=kb_chunks,
                    order=order_data,
                    conversation_history=transcript,
                    language=user_lang if msg_type == "audio" else "en",
                )
                logger.info(f"Bot response: {bot_text[:100]}...")
            except Exception as e:
                logger.error(f"LLM error: {e}")
                bot_text = f"I'm sorry, I couldn't process that right now. (Error: {str(e)[:50]})"

            # Log bot message to DB
            try:
                transcript.append({
                    "speaker": "bot",
                    "text": bot_text,
                    "timestamp": datetime.utcnow().isoformat(),
                })
                conv.transcript = transcript
                db.commit()
                logger.info("Bot message saved")
            except Exception as e:
                logger.error(f"DB save error (bot): {e}")
                db.rollback()

            # Text-to-Speech (only for audio mode)
            audio_b64 = None
            if msg_type == "audio":
                try:
                    audio_b64 = text_to_speech(bot_text)
                    logger.info("TTS generated successfully")
                except Exception as e:
                    logger.error(f"TTS error: {e}")

            # Send response
            try:
                await websocket.send_json({
                    "type": "response",
                    "text": bot_text,
                    "audio": audio_b64,
                    "language": user_lang if msg_type == "audio" else "en",
                })
                logger.info("Response sent to client")
            except Exception as e:
                logger.error(f"Send error: {e}")
                break

    except WebSocketDisconnect:
        logger.info("Client disconnected normally")
    except Exception as e:
        logger.error(f"Fatal voice WS error: {e}", exc_info=True)
        try:
            await websocket.send_json({"type": "error", "message": f"Server error: {str(e)[:100]}"})
        except Exception:
            pass
    finally:
        logger.info("Cleaning up voice websocket")
        db.commit()
        db.close()
        try:
            await websocket.close()
        except Exception:
            pass