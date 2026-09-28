import logging
import json
import re
import pandas as pd
import numpy as np
from scipy.stats import linregress, pearsonr
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.db import get_db_pool
from app.core.providers import get_llm_provider

logger = logging.getLogger(__name__)

# --- Data Fetching Helpers ---
def fetch_indicator_data(indicator: str, regions: List[str] = None, year_from: int = None, year_to: int = None) -> pd.DataFrame:
    query = """
        SELECT r.id as region_id, r.name as region_name, r.level as region_level, 
               iv.year, iv.value
        FROM indicator_values iv
        JOIN indicators ind ON iv.indicator_id = ind.id
        JOIN regions r ON iv.region_id = r.id
        WHERE ind.key = %s
    """
    params = [indicator]
    if regions:
        query += " AND r.id = ANY(%s)"
        params.append(regions)
    if year_from:
        query += " AND iv.year >= %s"
        params.append(year_from)
    if year_to:
        query += " AND iv.year <= %s"
        params.append(year_to)
        
    query += " ORDER BY iv.year ASC"
    
    with get_db_pool() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            rows = cur.fetchall()
            
    df = pd.DataFrame(rows)
    if not df.empty:
        # Convert numeric values to float
        df['value'] = df['value'].astype(float)
    return df

# --- 1. Trends ---
def analyze_trend(indicator: str, regions: List[str], year_from: Optional[int], year_to: Optional[int]) -> Dict[str, Any]:
    df = fetch_indicator_data(indicator, regions, year_from, year_to)
    if df.empty:
        return {"error": "No data available"}
        
    results = {}
    for region_name, group in df.groupby('region_name'):
        group = group.sort_values('year')
        years = group['year'].values
        values = group['value'].values
        
        if len(values) < 2:
            results[region_name] = {"series": group.to_dict('records'), "status": "insufficient_data"}
            continue
            
        start_val = values[0]
        end_val = values[-1]
        total_change = end_val - start_val
        
        # Linear fit
        slope, intercept, r_value, p_value, std_err = linregress(years, values)
        
        # CAGR calculation
        n_years = years[-1] - years[0]
        cagr = None
        if start_val > 0 and n_years > 0:
            cagr = ( (end_val / start_val) ** (1/n_years) - 1 ) * 100
            
        # Descriptor
        if slope > 0.05 * np.mean(values):
            desc = "Strongly increasing"
        elif slope > 0:
            desc = "Slightly increasing"
        elif slope < -0.05 * np.mean(values):
            desc = "Strongly decreasing"
        else:
            desc = "Slightly decreasing"
            
        if abs(slope) < 0.01 * np.mean(values):
            desc = "Relatively stable"
            
        results[region_name] = {
            "series": [{"year": int(y), "value": float(v)} for y, v in zip(years, values)],
            "cagr_percent": round(cagr, 2) if cagr is not None else None,
            "linear_slope": round(slope, 4),
            "total_change": round(total_change, 4),
            "descriptor": desc
        }
    return results

# --- 2. Compare / Ranking ---
def get_ranking(indicator: str, year: Optional[int] = None, level: str = "district") -> List[Dict[str, Any]]:
    # Simple query for top
    with get_db_pool() as conn:
        with conn.cursor() as cur:
            if not year:
                # Get latest year across board
                cur.execute("SELECT MAX(year) FROM indicator_values iv JOIN indicators ind ON iv.indicator_id=ind.id WHERE ind.key=%s", (indicator,))
                res = cur.fetchone()
                if res and res['max']:
                    year = res['max']
                else:
                    return []
                    
            cur.execute("""
                SELECT r.id, r.name, r.level, iv.value
                FROM indicator_values iv
                JOIN indicators ind ON iv.indicator_id = ind.id
                JOIN regions r ON iv.region_id = r.id
                WHERE ind.key = %s AND iv.year = %s AND r.level = %s
                ORDER BY iv.value DESC
            """, (indicator, year, level))
            return [dict(row) for row in cur.fetchall()]

# --- 3. Correlation ---
def analyze_correlation(indicator_x: str, indicator_y: str, year_from: Optional[int] = None, year_to: Optional[int] = None) -> Dict[str, Any]:
    df_x = fetch_indicator_data(indicator_x, None, year_from, year_to)
    df_y = fetch_indicator_data(indicator_y, None, year_from, year_to)
    
    if df_x.empty or df_y.empty:
        return {"error": "Insufficient data"}
        
    df = pd.merge(df_x, df_y, on=['region_id', 'region_name', 'year'], suffixes=('_x', '_y'))
    if len(df) < 3:
        return {"error": "Need at least 3 overlapping data points to correlate"}
        
    r, p = pearsonr(df['value_x'], df['value_y'])
    
    return {
        "pearson_r": round(r, 4),
        "p_value": round(p, 4),
        "n_samples": len(df),
        "caution": "Correlation does not imply causation. Check confounding factors."
    }

# --- 4. Anomalies ---
def detect_anomalies(indicator: str, regions: List[str] = None) -> Dict[str, Any]:
    df = fetch_indicator_data(indicator, regions)
    if df.empty:
        return {"error": "No data"}
        
    anomalies = []
    
    for region_name, group in df.groupby('region_name'):
        group = group.sort_values('year')
        if len(group) < 3:
            continue
            
        group['yoy_change'] = group['value'].diff()
        
        # Robust MAD
        changes = group['yoy_change'].dropna()
        if len(changes) < 2:
            continue
            
        median = changes.median()
        mad = (changes - median).abs().median()
        
        if mad == 0:
            mad = changes.std() or 0.001
            
        group['z_score'] = (group['yoy_change'] - median) / mad
        
        for idx, row in group.iterrows():
            if pd.notna(row['z_score']) and abs(row['z_score']) > 3:
                direction = "spike" if row['z_score'] > 0 else "drop"
                anomalies.append({
                    "region": region_name,
                    "year": int(row['year']),
                    "value": float(row['value']),
                    "yoy_change": float(row['yoy_change']),
                    "score": round(row['z_score'], 2),
                    "reason": f"Unusual {direction} detected (Robust Z-score > 3 on YoY change)"
                })
                
    return {"anomalies": anomalies, "method": "Robust MAD (Median Absolute Deviation) on Year-over-Year change"}

# --- 5. Natural Language Analytics ---
WHITELIST = ["trend", "compare_regions", "ranking", "correlation", "anomalies"]

class AnalyticsPlan(BaseModel):
    operation: str
    indicator_1: Optional[str] = None
    indicator_2: Optional[str] = None
    regions: Optional[List[str]] = None
    year_from: Optional[int] = None
    year_to: Optional[int] = None
    level: Optional[str] = None

def parse_natural_language_to_plan(question: str) -> Optional[AnalyticsPlan]:
    # Extract known keys using regex/heuristics or LLM
    llm = get_llm_provider()
    
    if llm.__class__.__name__ == "ExtractiveLLMProvider":
        # Simple regex heuristics if no LLM
        q = question.lower()
        op = None
        if "correlat" in q or "vs" in q: op = "correlation"
        elif "anomal" in q or "spike" in q: op = "anomalies"
        elif "rank" in q or "top" in q: op = "ranking"
        elif "trend" in q or "change" in q: op = "trend"
        
        if not op:
            return None
            
        # Very basic fallback matching (assuming some common indicators)
        ind1 = "population"
        if "forest" in q: ind1 = "forest_cover"
        elif "water" in q or "groundwater" in q: ind1 = "groundwater_level"
        elif "yield" in q: ind1 = "crop_yield"
        
        ind2 = "crop_yield" if op == "correlation" else None
        
        return AnalyticsPlan(operation=op, indicator_1=ind1, indicator_2=ind2)
        
    prompt = f"""
You are an analytics routing engine. Analyze the user's question and map it to one of the following operations: {', '.join(WHITELIST)}.
Identify parameters if mentioned.
Output strictly as JSON matching this schema:
{{
  "operation": "trend|compare_regions|ranking|correlation|anomalies",
  "indicator_1": "string (snake_case key like population, forest_cover, groundwater_level, crop_yield)",
  "indicator_2": "string (for correlation)",
  "regions": ["list", "of", "Region Names"],
  "year_from": 2010,
  "year_to": 2023,
  "level": "district|state|country"
}}
Do not execute SQL or return code. Just the JSON plan.
"""
    messages = [{"role": "user", "content": question}]
    for _ in range(3):
        try:
            result = llm.generate(system=prompt, messages=messages, json_mode=True)
            result = result.strip().strip("```json").strip("```").strip()
            data = json.loads(result)
            plan = AnalyticsPlan(**data)
            if plan.operation not in WHITELIST:
                return None
            return plan
        except Exception as e:
            logger.warning(f"Failed to parse analysis plan: {e}")
            continue
    return None

def execute_nl_analytics(question: str) -> Dict[str, Any]:
    plan = parse_natural_language_to_plan(question)
    if not plan:
        return {"error": "Could not map question to a safe, whitelisted operation. Please rephrase."}
        
    # Resolve region names to IDs
    region_ids = None
    if plan.regions:
        with get_db_pool() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM regions WHERE name = ANY(%s)", (plan.regions,))
                rows = cur.fetchall()
                region_ids = [str(r['id']) for r in rows]
                
    result = {}
    chart_hint = "none"
    
    try:
        if plan.operation == "trend":
            result = analyze_trend(plan.indicator_1, region_ids, plan.year_from, plan.year_to)
            chart_hint = "line"
        elif plan.operation == "correlation":
            result = analyze_correlation(plan.indicator_1, plan.indicator_2, plan.year_from, plan.year_to)
            chart_hint = "scatter"
        elif plan.operation == "anomalies":
            result = detect_anomalies(plan.indicator_1, region_ids)
            chart_hint = "bar" # or line with markers
        elif plan.operation == "ranking":
            result = get_ranking(plan.indicator_1, plan.year_from or plan.year_to, plan.level or "district")
            chart_hint = "bar"
        else:
            result = {"error": "Operation not fully implemented"}
    except Exception as e:
        logger.error(f"Error executing analytics plan: {e}")
        return {"error": "An error occurred executing the analysis."}
        
    return {
        "interpreted_plan": plan.model_dump(),
        "result": result,
        "chart_hint": chart_hint,
        "notes": "Generated safely from whitelisted functions."
    }
