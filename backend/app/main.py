from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.config import settings
from app.routers import auth, documents, users, orders, conversations, voice, analytics

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="AI Voice-Based Customer Support Bot",
)

# CORS — allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(users.router)
app.include_router(orders.router)
app.include_router(conversations.router)
app.include_router(voice.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"message": f"Welcome to {settings.APP_NAME}"}


@app.get("/health")
def health():
    return {"status": "ok"}