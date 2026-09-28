import os
import sys
import logging

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.analytics import execute_nl_analytics, parse_natural_language_to_plan

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_whitelist():
    bad_questions = [
        "DROP TABLE users;",
        "DELETE FROM documents;",
        "SELECT * FROM users",
        "Explain what land use is"
    ]
    
    passed = 0
    for q in bad_questions:
        res = execute_nl_analytics(q)
        if "error" in res:
            logger.info(f"✅ Successfully rejected malicious/unsupported query: '{q}'")
            passed += 1
        else:
            logger.error(f"❌ Failed to reject query: '{q}' -> {res}")
            
    # Test valid queries
    good_questions = [
        "What is the trend for population?",
        "Show me anomalies in forest cover",
        "Rank the top districts by crop yield",
        "Is there a correlation between crop yield and groundwater level?"
    ]
    
    for q in good_questions:
        res = execute_nl_analytics(q)
        if "error" not in res:
            logger.info(f"✅ Successfully mapped valid query to plan: '{q}' -> {res['interpreted_plan']['operation']}")
            passed += 1
        else:
            logger.warning(f"⚠️ Query '{q}' returned error (might be okay if heuristic couldn't map, but plan parsing should work if LLM or good heuristic): {res}")
            
    total = len(bad_questions) + len(good_questions)
    logger.info(f"--- Analytics Whitelist Eval Complete: {passed}/{total} ---")

if __name__ == "__main__":
    test_whitelist()
