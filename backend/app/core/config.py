from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_KEY: str
    DO_SPACE_REGION: str
    DO_SPACE_KEY: str
    DO_SPACE_SECRET: str
    DO_SPACE_BUCKET: str

    class Config:
        env_file = ".env"

settings = Settings()