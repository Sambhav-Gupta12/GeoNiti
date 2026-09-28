from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.core.security import verify_internal_key
from app.services.recommend import get_recommendations

router = APIRouter(prefix="/recommend", tags=["recommend"])

class CallerContext(BaseModel):
    role: str
    allowed_visibility: List[str]
    allowed_status: List[str]

class RecommendRequest(BaseModel):
    entity_type: str
    entity_id: str
    limit: Optional[int] = 5
    caller_context: CallerContext

@router.post("")
def recommend_api(req: RecommendRequest, _: str = Depends(verify_internal_key)):
    if req.entity_type not in ["document", "dataset", "region"]:
        raise HTTPException(status_code=400, detail="Invalid entity_type")
        
    try:
        cc = {
            "role": req.caller_context.role,
            "allowed_visibility": req.caller_context.allowed_visibility,
            "allowed_status": req.caller_context.allowed_status
        }
        res = get_recommendations(
            entity_type=req.entity_type,
            entity_id=req.entity_id,
            limit=req.limit,
            caller_context=cc
        )
        return {"data": res}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
