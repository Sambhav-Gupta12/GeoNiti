from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    AI_SERVICE_KEY: str
    DATABASE_URL: str
    EMBEDDING_PROVIDER: str = "local"
    EMBEDDING_DIM: int = 384
    LLM_PROVIDER: str = "api"
    LLM_MODEL: str = "gemini-1.5-flash"
    LLM_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
