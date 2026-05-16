from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "HireSmart"

    ALLOWED_ORIGINS: str = ""

    @property
    def allowed_origins_list(self) -> List[str]:
        return [
            origin.strip()
            for origin in self.ALLOWED_ORIGINS.split(",")
        ]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
