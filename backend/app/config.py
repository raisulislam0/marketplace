from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    mongodb_url: str
    database_name: str = "marketplace"
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    upload_dir: str = "uploads"
    
    class Config:
        env_file = ".env"


settings = Settings()

