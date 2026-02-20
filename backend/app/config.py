from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "AI Assistant"
    APP_DESCRIPTION: str = "Your intelligent AI-powered assistant"
    SECRET_KEY: str = "change-me-to-a-random-secret-key"
    DEMO_MODE: bool = True
    SSL_VERIFY: bool = True


    # Database
    DATABASE_URL: str = "sqlite:///./chatbot.db"

    # AI Models — UPDATE THESE FOR EACH COMPETITION
    DEFAULT_MODEL: str = "gpt-4o"
    SYSTEM_PROMPT: str = "You are a helpful AI assistant. Answer questions clearly and concisely."
    MEMORY_WINDOW: int = 20

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"

    # DeepSeek
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com/v1"

    # Competition Model (Generic OpenAI-compatible)
    COMPETITION_API_KEY: str = ""
    COMPETITION_BASE_URL: str = ""
    COMPETITION_MODEL_IDS: str = ""  # Comma-separated list like "llama-3,mixtral"
    COMPETITION_USE_RAW_HTTP: bool = False # Set to true if not using OpenAI library

    # Microsoft OAuth2
    MICROSOFT_CLIENT_ID: str = ""
    MICROSOFT_CLIENT_SECRET: str = ""
    MICROSOFT_TENANT_ID: str = "common"
    MICROSOFT_REDIRECT_URI: str = "http://localhost:8000/auth/callback"

    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
