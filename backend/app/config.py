from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://voicedesk:voicedesk123@localhost:5432/voicedesk"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Qdrant
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str = ""
    QDRANT_COLLECTION: str = "knowledge_base"

    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Groq
    GROQ_API_KEY: str = ""

    # App
    APP_NAME: str = "VoiceDesk AI"
    DEBUG: bool = True

    class Config:
        env_file = ".env"


settings = Settings()