import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Front Desk"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    
    # Twilio (Load from env)
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = ""
    
    # AI
    GEMINI_API_KEY: str = ""

    # Auth
    SECRET_KEY: str = "supersecretkeyshouldbeinchangedinprod" # In prod, load from env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 3000 # Long expiry for MVP

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
