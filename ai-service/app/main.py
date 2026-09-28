from fastapi import FastAPI, Depends
from app.core.config import settings
from app.core.security import verify_internal_key

from app.api.ingest import router as ingest_router

app = FastAPI(title="BhuNiti AI Service")

app.include_router(ingest_router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "db": "connected"} # Mock db status for now
