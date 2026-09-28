from fastapi import FastAPI, Depends
from app.core.config import settings
from app.core.security import verify_internal_key

app = FastAPI(title="BhuNiti AI Service")

@app.get("/health")
def health_check():
    return {"status": "healthy", "db": "connected"} # Mock db status for now

@app.get("/api/v1/protected", dependencies=[Depends(verify_internal_key)])
def protected_route():
    return {"message": "Authenticated successfully"}
