from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from app.core.security import verify_internal_key
from app.services.search import execute_search

router = APIRouter(prefix="/search", tags=["search"])

class CallerContext(BaseModel):
    role: str
    allowed_visibility: List[str]
    allowed_status: List[str]

class SearchRequest(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None
    mode: str = "hybrid" # semantic | keyword | hybrid
    limit: int = 20
    caller_context: CallerContext

@router.post("")
def search(req: SearchRequest, _: str = Depends(verify_internal_key)):
    try:
        # Pass dictionary of caller context mapping
        cc = {
            "role": req.caller_context.role,
            "allowed_visibility": req.caller_context.allowed_visibility,
            "allowed_status": req.caller_context.allowed_status
        }
        res = execute_search(
            query=req.query,
            filters=req.filters or {},
            mode=req.mode,
            limit=req.limit,
            caller_context=cc
        )
        return res
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
