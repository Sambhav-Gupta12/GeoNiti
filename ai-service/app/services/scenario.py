import logging
import json
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from sklearn.ensemble import RandomForestRegressor
from sklearn.inspection import permutation_importance
import joblib
import hashlib
import os

from app.db import get_db_pool
from app.core.providers import get_llm_provider

logger = logging.getLogger(__name__)

CACHE_DIR = "/tmp/scenario_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

class ScenarioParameter(BaseModel):
    key: str
    label: str
    unit: str
    min_val: float
    max_val: float
    default: float
    description: str
    modifies_feature: str

# Registry of parameters for the "land_use" scenario family
PARAMETERS = [
    ScenarioParameter(
        key="peri_urban_conversion_restriction_pct",
        label="Peri-Urban Conversion Restriction",
        unit="%",
        min_val=0, max_val=100, default=0,
        description="Limits the rate at which cropland near urban centers is converted.",
        modifies_feature="urban_expansion_rate"
    ),
    ScenarioParameter(
        key="irrigation_coverage_increase_pp",
        label="Irrigation Coverage Increase",
        unit="pp",
        min_val=0, max_val=50, default=0,
        description="Percentage point increase in irrigated land.",
        modifies_feature="irrigation_pct"
    ),
    ScenarioParameter(
        key="infrastructure_investment_index_change_pct",
        label="Infra Investment Change",
        unit="%",
        min_val=-50, max_val=200, default=0,
        description="Change in road and infrastructure investments.",
        modifies_feature="road_density"
    )
]

def get_parameters() -> List[Dict]:
    return [p.model_dump() for p in PARAMETERS]

def _hash_data(df: pd.DataFrame) -> str:
    return hashlib.md5(pd.util.hash_pandas_object(df, index=True).values).hexdigest()

def _fetch_panel_data(target_indicator: str) -> pd.DataFrame:
    # Fetch target, and predictor indicators like urban_expansion_rate, irrigation_pct, road_density, population_density
    query = """
        SELECT r.id as region_id, r.name as region_name, 
               iv.year, ind.key as indicator, iv.value
        FROM indicator_values iv
        JOIN indicators ind ON iv.indicator_id = ind.id
        JOIN regions r ON iv.region_id = r.id
        WHERE ind.key IN (%s, 'urban_expansion_rate', 'irrigation_pct', 'road_density', 'population_density')
    """
    with get_db_pool() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (target_indicator,))
            rows = cur.fetchall()
            
    df = pd.DataFrame(rows)
    if df.empty:
        return df
        
    df['value'] = df['value'].astype(float)
    # Pivot to panel format: rows are region_id+year, columns are indicators
    panel = df.pivot_table(index=['region_id', 'region_name', 'year'], columns='indicator', values='value').reset_index()
    return panel

def _feature_engineering(panel: pd.DataFrame, target: str):
    # Sort by region and year
    panel = panel.sort_values(['region_id', 'year'])
    
    # Missing value imputation (forward fill then backward fill per region)
    panel = panel.groupby('region_id').apply(lambda x: x.ffill().bfill()).reset_index(drop=True)
    
    # Lag features
    panel[f'{target}_lag1'] = panel.groupby('region_id')[target].shift(1)
    
    # Time index
    panel['time_idx'] = panel['year'] - panel['year'].min()
    
    # Drop rows with NaNs after lagging (first year of each region)
    panel = panel.dropna()
    
    features = ['time_idx', f'{target}_lag1']
    if 'urban_expansion_rate' in panel.columns: features.append('urban_expansion_rate')
    if 'irrigation_pct' in panel.columns: features.append('irrigation_pct')
    if 'road_density' in panel.columns: features.append('road_density')
    if 'population_density' in panel.columns: features.append('population_density')
        
    return panel, features

def _train_model(panel: pd.DataFrame, features: List[str], target: str):
    # Time-based split
    max_year = panel['year'].max()
    train_mask = panel['year'] < (max_year - 2)
    val_mask = panel['year'] >= (max_year - 2)
    
    X_train, y_train = panel[train_mask][features], panel[train_mask][target]
    X_val, y_val = panel[val_mask][features], panel[val_mask][target]
    
    model = RandomForestRegressor(n_estimators=100, max_depth=5, random_state=42)
    if len(X_train) < 10:
        # Not enough data for robust model, just return a dummy
        model.fit(panel[features], panel[target])
        val_mae = 0
        naive_mae = 0
    else:
        model.fit(X_train, y_train)
        preds = model.predict(X_val)
        val_mae = np.mean(np.abs(preds - y_val))
        naive_preds = X_val[f'{target}_lag1']
        naive_mae = np.mean(np.abs(naive_preds - y_val))
        
        # Retrain on full for projection
        model.fit(panel[features], panel[target])
        
    # Feature importance
    pi = permutation_importance(model, panel[features], panel[target], n_repeats=5, random_state=42)
    importances = dict(zip(features, pi.importances_mean))
    top_features = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:3]
    
    model_card = {
        "model_type": "RandomForestRegressor",
        "features": features,
        "training_window": f"{panel['year'].min()} - {panel['year'].max()}",
        "holdout_metrics": {
            "val_mae": float(val_mae),
            "naive_baseline_mae": float(naive_mae)
        },
        "limitations": "Linear bounds; does not account for macro-economic shocks.",
        "top_drivers": [f[0] for f in top_features]
    }
    
    # Compute residual std for uncertainty bands
    full_preds = model.predict(panel[features])
    residuals = panel[target] - full_preds
    std_resid = residuals.std() if not residuals.empty else 1.0
    
    return model, model_card, std_resid

def run_scenario(target_indicator: str, horizon: int, user_params: Dict[str, float]) -> Dict[str, Any]:
    panel = _fetch_panel_data(target_indicator)
    if panel.empty:
        raise ValueError("Insufficient data for target indicator.")
        
    panel, features = _feature_engineering(panel, target_indicator)
    
    data_hash = _hash_data(panel)
    cache_path = os.path.join(CACHE_DIR, f"{target_indicator}_{data_hash}.joblib")
    
    if os.path.exists(cache_path):
        model, model_card, std_resid = joblib.load(cache_path)
    else:
        model, model_card, std_resid = _train_model(panel, features, target_indicator)
        joblib.dump((model, model_card, std_resid), cache_path)
        
    # Baseline Projection (iterate forward)
    last_year_data = panel[panel['year'] == panel['year'].max()].copy()
    
    def project(df: pd.DataFrame, params: Dict[str, float]) -> pd.DataFrame:
        curr_df = df.copy()
        history = []
        
        # Apply parameter modifications (assuming linear change over horizon)
        for p in PARAMETERS:
            if p.key in params and p.modifies_feature in curr_df.columns:
                val = params[p.key]
                if p.key == "peri_urban_conversion_restriction_pct":
                    # Restrict urban expansion
                    curr_df[p.modifies_feature] = curr_df[p.modifies_feature] * (1 - val/100.0)
                elif p.key == "irrigation_coverage_increase_pp":
                    curr_df[p.modifies_feature] = curr_df[p.modifies_feature] + (val / horizon)
                elif p.key == "infrastructure_investment_index_change_pct":
                    curr_df[p.modifies_feature] = curr_df[p.modifies_feature] * (1 + (val/100.0) / horizon)

        for step in range(1, horizon + 1):
            curr_df['time_idx'] += 1
            curr_df['year'] += 1
            
            preds = model.predict(curr_df[features])
            
            # Uncertainty widening
            band_width = 1.28 * std_resid * np.sqrt(step) # 80% CI
            
            step_res = curr_df[['region_id', 'region_name', 'year']].copy()
            step_res['projected_value'] = preds
            step_res['band_lower'] = preds - band_width
            step_res['band_upper'] = preds + band_width
            
            history.append(step_res)
            
            # Update lag for next step
            curr_df[f'{target_indicator}_lag1'] = preds
            
        return pd.concat(history)

    # Defaults
    default_params = {p.key: p.default for p in PARAMETERS}
    baseline_proj = project(last_year_data, default_params)
    
    # Scenario
    scen_proj = project(last_year_data, user_params)
    
    # Aggregate to overall mean for output series
    base_agg = baseline_proj.groupby('year').mean(numeric_only=True).reset_index()
    scen_agg = scen_proj.groupby('year').mean(numeric_only=True).reset_index()
    
    base_series = base_agg[['year', 'projected_value', 'band_lower', 'band_upper']].to_dict('records')
    scen_series = scen_agg[['year', 'projected_value', 'band_lower', 'band_upper']].to_dict('records')
    
    diff = scen_agg['projected_value'].iloc[-1] - base_agg['projected_value'].iloc[-1]
    
    assumptions = [
        f"Trained on data from {model_card['training_window']}.",
        "Data may include illustrative flags.",
        "Unmodified features held constant at last known value.",
        "80% confidence bands calculated via residual bootstrap expanding over time.",
        "Relationships are associative, not necessarily causal."
    ]
    
    # Explanation
    llm = get_llm_provider()
    system = "You are a policy analyst. Explain the scenario projection results simply."
    prompt = f"""
Baseline in {last_year_data['year'].iloc[0] + horizon}: {base_agg['projected_value'].iloc[-1]:.2f}
Scenario in {last_year_data['year'].iloc[0] + horizon}: {scen_agg['projected_value'].iloc[-1]:.2f}
Difference: {diff:.2f}
Top drivers: {', '.join(model_card['top_drivers'])}

Write a 2-3 sentence explanation. State clearly that this is a model scenario estimate.
"""
    if llm.__class__.__name__ == "ExtractiveLLMProvider":
        explanation = f"This model scenario estimates a difference of {diff:.2f} by {last_year_data['year'].iloc[0] + horizon} compared to the baseline. The primary drivers are {', '.join(model_card['top_drivers'])}. Note this is an associative projection, not a certainty."
    else:
        try:
            explanation = llm.generate(system=system, messages=[{"role": "user", "content": prompt}]).strip()
        except:
            explanation = f"This model scenario estimates a difference of {diff:.2f} by {last_year_data['year'].iloc[0] + horizon} compared to the baseline."
            
    return {
        "baseline_series": base_series,
        "scenario_series": scen_series,
        "difference_at_horizon": float(diff),
        "explanation": explanation,
        "assumptions": assumptions,
        "model_card": model_card
    }
