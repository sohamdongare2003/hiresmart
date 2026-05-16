from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    APP_NAME: str = "HireSmart"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = "Mysql12"
    DB_NAME: str = "hiresmart"

    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    GEMINI_API_KEY: str = "AIzaSyAcsYSPejYymq7H45K5cAF2XHO7OEQxG4I"

    STORAGE_TYPE: str = "local"
    LOCAL_UPLOAD_DIR: str = "uploads"

    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "hiresmart-resumes"

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://hiresmart-seven.vercel.app"
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
