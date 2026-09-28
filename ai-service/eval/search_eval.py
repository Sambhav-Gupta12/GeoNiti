import os
import sys
import logging

# Ensure app is in path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.search import execute_search

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Mock caller context for eval
CALLER_CONTEXT = {
    "role": "public",
    "allowed_visibility": ["public"],
    "allowed_status": ["approved"]
}

# Queries and expected expected words in title/abstract or specific knowledge
# The expected documents are derived from seed data (05_datasets.ts & others)
QUERIES = [
    {
        "q": "urban sprawl eating farmland", 
        "expected": "Delhi-NCR Land-Use / Land-Cover Time Series 2005-2024",
        "semantic_expected": True
    },
    {
        "q": "groundwater depletion before monsoon", 
        "expected": "NCR Groundwater Depth Annual Observations 2005-2024",
        "semantic_expected": True
    },
    {
        "q": "road density infrastructure", 
        "expected": "NCR Road Density Estimates 2005-2024",
        "semantic_expected": False
    },
    {
        "q": "climate vulnerability flood heat", 
        "expected": "NCR Climate Vulnerability Index 2005-2024",
        "semantic_expected": False
    },
    {
        "q": "agricultural census size distribution", 
        "expected": "NCR Agricultural Census Land Holding Summary",
        "semantic_expected": False
    },
    {
        "q": "property valuation trends", 
        "expected": "NCR Land Price Index 2005-2024",
        "semantic_expected": True
    },
    {
        "q": "litigation and conflicts over land", 
        "expected": "NCR Land Dispute Court Cases Dataset", # Wait, this one is restricted. Public won't see it.
        "semantic_expected": True,
        "restricted": True
    },
    {
        "q": "delhi ncr land use", 
        "expected": "Delhi-NCR Land-Use / Land-Cover Time Series 2005-2024",
        "semantic_expected": False
    }
]

def run_eval():
    total_queries = len(QUERIES)
    hits_at_5 = 0
    
    # We will test using 'hybrid' mode
    for item in QUERIES:
        q = item["q"]
        expected_title = item["expected"]
        restricted = item.get("restricted", False)
        
        ctx = CALLER_CONTEXT.copy()
        if restricted:
            ctx["role"] = "system_admin"
            ctx["allowed_visibility"] = ["public", "internal", "restricted"]
        
        try:
            res = execute_search(
                query=q,
                filters={},
                mode="hybrid",
                limit=5,
                caller_context=ctx
            )
            
            top_5 = res["results"]
            titles = [r["document"]["title"] for r in top_5]
            
            # Check if expected title is in top 5
            found = any(expected_title.lower() in t.lower() for t in titles)
            if found:
                hits_at_5 += 1
                logger.info(f"✅ PASS | Query: '{q}' | Expected: '{expected_title}' found in Top 5")
            else:
                logger.warning(f"❌ FAIL | Query: '{q}' | Expected: '{expected_title}' NOT in Top 5")
                logger.warning(f"   Top 5 were: {titles}")
        except Exception as e:
            logger.error(f"Error evaluating query '{q}': {e}")
            
    p_at_5 = hits_at_5 / total_queries if total_queries > 0 else 0
    logger.info(f"--- Evaluation Complete ---")
    logger.info(f"Precision@5: {p_at_5:.2f} ({hits_at_5}/{total_queries})")

if __name__ == "__main__":
    # Needs DATABASE_URL set
    if not os.getenv("DATABASE_URL"):
        os.environ["DATABASE_URL"] = "postgres://bhuniti:bhuniti_pass@localhost:5432/bhuniti_db"
    run_eval()
