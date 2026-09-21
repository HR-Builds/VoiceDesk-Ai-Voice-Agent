# 🎙️ VoiceDesk AI

### AI-Powered Voice Customer Support & Knowledge Base Platform

VoiceDesk AI is a full-stack AI customer support platform that combines **voice interaction, text-based support, RAG, document knowledge bases, authentication, databases, and AI APIs**.

https://voice-desk-ai-voice-agent-c2bn.vercel.app/

## ✨ Features

- 🤖 AI-powered customer support
- 🎙️ Voice interaction and speech-to-text
- 💬 Text-based conversations
- 🧠 Retrieval-Augmented Generation (RAG)
- 📚 Company-specific knowledge base
- 📄 Document upload and processing
- 🔎 Qdrant-powered knowledge retrieval
- 🔐 JWT authentication
- 🔑 Argon2 password hashing
- 🏢 Multi-company architecture
- 💾 PostgreSQL database
- 👨‍💼 Admin functionality
- ☁️ Vercel deployment
- 🔗 React + FastAPI full-stack architecture

## 🧠 RAG Pipeline

```text
Company Documents
       ↓
Document Processing
       ↓
Text Chunking
       ↓
Knowledge Base
       ↓
Qdrant
       ↓
Customer Question
       ↓
Relevant Knowledge
       ↓
AI Model
       ↓
Support Response
```

This allows the AI to use company-specific information such as:

- Shipping policies
- Refund policies
- Payment information
- Product information
- FAQs
- Support documentation

## 🏗️ Architecture

```text
Customer
   │
   ▼
React Frontend
   │
   ▼
FastAPI Backend
   │
   ├── Authentication
   ├── Voice Processing
   ├── Conversations
   ├── Documents
   └── RAG
        │
        ├── PostgreSQL
        ├── Qdrant
        └── Groq AI
```

## 🧰 Tech Stack

### Frontend
- React
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT
- Argon2
- Pydantic

### AI & RAG
- Groq API
- Speech-to-Text
- RAG
- Qdrant
- Document chunking
- Knowledge retrieval

### Deployment
- Vercel
- PostgreSQL
- Qdrant Cloud

## 📂 Project Structure

```text
VoiceDesk/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── auth.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── rag.py
│   │   ├── stt.py
│   │   └── routers/
│   │
│   ├── requirements.txt
│   ├── run.py
│   └── vercel.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vercel.json
│
├── docker-compose.yml
└── .gitignore
```

## 🚀 Running Locally

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

Backend:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## 🔑 Environment Variables

```env
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
QDRANT_URL=your_qdrant_url
QDRANT_COLLECTION=your_collection_name
```

Frontend:

```env
VITE_API_URL=your_backend_url
```

> Never commit API keys or `.env` files to GitHub.

## 📡 Main API Areas

```text
/auth
/documents
/conversations
/health
```

Full API documentation is available through FastAPI Swagger.

## 🚧 Project Status

**Active Development**

The core VoiceDesk AI platform is implemented and deployed. Further improvements are planned for the RAG pipeline, voice experience, document management, analytics, and production infrastructure.

## 🔮 Future Improvements

- Improved semantic RAG
- Text-to-Speech
- Human-agent handoff
- Advanced analytics
- Better document processing
- Ticket management
- Real-time notifications
- Advanced monitoring
- Production optimization
