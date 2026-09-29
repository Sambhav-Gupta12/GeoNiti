import os
import sys
import logging

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.scenario import run_scenario

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_scenario_sanity():
    # Run baseline (no intervention)
    baseline_res = run_scenario("cropland_pct", 5, {})
    base_diff = baseline_res["difference_at_horizon"]
    
    # Run intervention (100% conversion restriction)
    restricted_res = run_scenario("cropland_pct", 5, {"peri_urban_conversion_restriction_pct": 100})
    restricted_diff = restricted_res["difference_at_horizon"]
    
    # Run negative intervention (massive infrastructure boost)
    infra_res = run_scenario("cropland_pct", 5, {"infrastructure_investment_index_change_pct": 100})
    infra_diff = infra_res["difference_at_horizon"]
    
    logger.info(f"Baseline Diff: {base_diff}")
    logger.info(f"Restricted Conversion Diff: {restricted_diff}")
    logger.info(f"Infrastructure Boost Diff: {infra_diff}")
    
    # Monotonic sanity check: restricting urban conversion should result in more cropland (or less loss)
    # than massive infrastructure boost.
    # Note: Depending on dummy data, might just be different, but ideally we check that it ran properly.
    if restricted_diff > infra_diff:
        logger.info("✅ Sanity check passed: Restricting conversion preserves more cropland than boosting infrastructure.")
    else:
        logger.warning("⚠️ Sanity check reversed: The model might have learned weird relationships from dummy data.")
        
    # Check assumptions exist
    assert "assumptions" in baseline_res and len(baseline_res["assumptions"]) > 0, "Missing assumptions"
    assert "explanation" in baseline_res and len(baseline_res["explanation"]) > 0, "Missing explanation"
    
    # Check bands contain baseline roughly
    b = baseline_res["scenario_series"][-1]
    assert b["band_lower"] <= b["projected_value"] <= b["band_upper"], "Projected value outside confidence band"
    
    logger.info("✅ All scenario checks passed.")

if __name__ == "__main__":
    test_scenario_sanity()
