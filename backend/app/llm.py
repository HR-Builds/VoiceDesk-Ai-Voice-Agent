import os
from typing import List, Optional
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def build_system_prompt(company_name: str, language: str = "en") -> str:
    return (
        f"You are VoiceDesk AI, the customer support assistant for {company_name}. "
        "You are helpful, concise, and friendly. "
        "Answer using ONLY the provided knowledge base and order data. "
        "If you don't know, say so honestly and offer to escalate to a human. "
        "If the customer asks for phone, email, address, working hours, or a human agent, "
        "share the contact details from the knowledge base. "
        "Keep responses under 3 sentences when possible. "
        f"Respond in the following language: {language}."
    )

def ask_bot(
    company_name: str,
    question: str,
    kb_chunks: List[str],
    order: Optional[dict] = None,
    conversation_history: List[dict] = None,
    language: str = "en",
) -> str:
    system = build_system_prompt(company_name, language)

    context_parts = []
    if kb_chunks:
        context_parts.append("Knowledge Base:\n" + "\n---\n".join(kb_chunks))
    if order:
        context_parts.append(f"Order Data:\n{order}")

    context = "\n\n".join(context_parts) if context_parts else "No relevant data found."

    messages = [{"role": "system", "content": system}]

    if conversation_history:
        for msg in conversation_history[-6:]:
            role = "user" if msg["speaker"] == "user" else "assistant"
            messages.append({"role": role, "content": msg["text"]})

    messages.append({
        "role": "user",
        "content": f"Context:\n{context}\n\nCustomer Question: {question}",
    })

    resp = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=messages,
        temperature=0.3,
        max_tokens=300,
    )
    return resp.choices[0].message.content.strip()