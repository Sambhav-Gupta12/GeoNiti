from fastapi import APIRouter, Depends, HTTPException, Security
from pydantic import BaseModel

from app.services.ingest import ingest_document, ingest_all
from app.core.providers import embed_text
from app.core.security import verify_internal_key

router = APIRouter(prefix="/ingest", tags=["ingest"])

class EmbedRequest(BaseModel):
    text: str

@router.post("/document/{document_id}")
def api_ingest_document(document_id: str, _: str = Depends(verify_internal_key)):
    try:
        res = ingest_document(document_id)
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/all")
def api_ingest_all(_: str = Depends(verify_internal_key)):
    return ingest_all()

@router.get("/status")
def api_ingest_status(_: str = Depends(verify_internal_key)):
    return {"status": "operational"}

@router.post("/embed")
def api_embed(req: EmbedRequest, _: str = Depends(verify_internal_key)):
    emb = embed_text(req.text)
    return {"dimension": len(emb), "embedding": emb}
