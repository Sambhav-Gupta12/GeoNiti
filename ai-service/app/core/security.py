from fastapi import Header, HTTPException, Security
from app.core.config import settings

def verify_internal_key(x_internal_key: str = Header(...)):
    if x_internal_key != settings.AI_SERVICE_KEY:
        raise HTTPException(status_code=403, detail="Invalid internal key")
    return x_internal_key
