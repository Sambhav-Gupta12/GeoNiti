from fastapi import FastAPI, Depends
from app.core.config import settings
from app.core.security import verify_internal_key

from app.api.ingest import router as ingest_router
from app.api.search import router as search_router
from app.api.assistant import router as assistant_router
from app.api.metadata import router as metadata_router
from app.api.recommend import router as recommend_router
from app.api.analytics import router as analytics_router

app = FastAPI(title="BhuNiti AI Service")

app.include_router(ingest_router)
app.include_router(search_router)
app.include_router(assistant_router)
app.include_router(metadata_router)
app.include_router(recommend_router)
app.include_router(analytics_router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "db": "connected"} # Mock db status for now
