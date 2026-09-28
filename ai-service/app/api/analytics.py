from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.core.security import verify_internal_key
from app.services.analytics import (
    analyze_trend,
    get_ranking,
    analyze_correlation,
    detect_anomalies,
    execute_nl_analytics
)

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/trend")
def api_trend(
    indicator: str, 
    regions: Optional[str] = None, 
    year_from: Optional[int] = None, 
    year_to: Optional[int] = None,
    _: str = Depends(verify_internal_key)
):
    try:
        region_list = regions.split(",") if regions else None
        res = analyze_trend(indicator, region_list, year_from, year_to)
        return {"data": res}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ranking")
def api_ranking(
    indicator: str, 
    year: Optional[int] = None, 
    level: str = "district",
    _: str = Depends(verify_internal_key)
):
    try:
        res = get_ranking(indicator, year, level)
        return {"data": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/correlation")
def api_correlation(
    x: str,
    y: str,
    year_from: Optional[int] = None, 
    year_to: Optional[int] = None,
    _: str = Depends(verify_internal_key)
):
    try:
        res = analyze_correlation(x, y, year_from, year_to)
        return {"data": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/anomalies")
def api_anomalies(
    indicator: str,
    regions: Optional[str] = None,
    _: str = Depends(verify_internal_key)
):
    try:
        region_list = regions.split(",") if regions else None
        res = detect_anomalies(indicator, region_list)
        return {"data": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AskRequest(BaseModel):
    question: str

@router.post("/ask")
def api_ask(req: AskRequest, _: str = Depends(verify_internal_key)):
    try:
        res = execute_nl_analytics(req.question)
        if "error" in res:
            raise HTTPException(status_code=400, detail=res["error"])
        return {"data": res}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
