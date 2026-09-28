from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from app.core.security import verify_internal_key
from app.services.assistant import generate_answer

router = APIRouter(prefix="/assistant", tags=["assistant"])

class CallerContext(BaseModel):
    role: str
    allowed_visibility: List[str]
    allowed_status: List[str]

class AnswerRequest(BaseModel):
    question: str
    session_context: List[Dict[str, str]] = []
    scope: Optional[Dict[str, Any]] = None
    caller_context: CallerContext

@router.post("/answer")
def answer(req: AnswerRequest, _: str = Depends(verify_internal_key)):
    try:
        cc = {
            "role": req.caller_context.role,
            "allowed_visibility": req.caller_context.allowed_visibility,
            "allowed_status": req.caller_context.allowed_status
        }
        res = generate_answer(
            question=req.question,
            session_context=req.session_context,
            scope=req.scope or {},
            caller_context=cc
        )
        return res
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
