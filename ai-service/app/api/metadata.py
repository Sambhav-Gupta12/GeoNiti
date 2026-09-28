from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from app.core.security import verify_internal_key
from app.services.metadata import extract_metadata

router = APIRouter(prefix="/extract", tags=["extract"])

class ExtractMetadataRequest(BaseModel):
    text: Optional[str] = None
    file_path: Optional[str] = None

@router.post("/metadata")
def extract_metadata_api(req: ExtractMetadataRequest, _: str = Depends(verify_internal_key)):
    try:
        text = req.text
        if not text and req.file_path:
            from app.services.extract import extract_text
            text = extract_text(req.file_path)
            
        if not text:
            raise HTTPException(status_code=400, detail="Must provide text or file_path")
            
        res = extract_metadata(text)
        return {"data": res}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
