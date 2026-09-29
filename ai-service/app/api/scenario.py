from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.core.security import verify_internal_key
from app.services.scenario import get_parameters, run_scenario

router = APIRouter(prefix="/scenario", tags=["scenario"])

class ScenarioRequest(BaseModel):
    target_indicator: str = "cropland_pct"
    horizon: int = 5
    params: Dict[str, float]

@router.get("/parameters")
def api_parameters(_: str = Depends(verify_internal_key)):
    return {"data": get_parameters()}

@router.post("/run")
def api_run_scenario(req: ScenarioRequest, _: str = Depends(verify_internal_key)):
    try:
        res = run_scenario(req.target_indicator, req.horizon, req.params)
        return {"data": res}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
