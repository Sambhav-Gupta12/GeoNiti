import os
import sys
import logging

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.metadata import extract_metadata

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TEXTS = [
    """
    Annual Groundwater Report for Haryana
    2023
    Published by the State Water Board
    Abstract: This document details the declining groundwater tables across Haryana,
    specifically focusing on agricultural over-extraction in the dry season.
    """,
    """
    National Policy on Land Acquisition and Resettlement
    Year: 2013
    Ministry of Rural Development
    This policy outlines the framework for fair compensation and transparency
    in land acquisition for industrial projects.
    """,
    """
    A Study on Peri-urbanisation and Farmland Conversion in Delhi-NCR
    Authors: Dr. A. Sharma, Prof. B. Kumar
    Date of publication: 2021
    Abstract: The paper provides a demand-side analysis of how population growth
    drives farmland loss in the National Capital Region (NCR). We look at several
    districts including Gurugram and Gautam Buddha Nagar.
    """
]

def run_eval():
    passed = 0
    total = len(TEXTS)
    
    for i, text in enumerate(TEXTS):
        logger.info(f"--- Testing Sample {i+1} ---")
        try:
            res = extract_metadata(text)
            logger.info(f"Title: {res.get('title')}")
            logger.info(f"Year: {res.get('year')}")
            logger.info(f"Organization: {res.get('organization')}")
            logger.info(f"Topics: {res.get('topics')}")
            logger.info(f"Abstract: {res.get('abstract')}")
            
            # Simple check
            if res.get("title") and res.get("year") is not None:
                passed += 1
                logger.info("✅ PASS (Basic heuristic/LLM extraction successful)")
            else:
                logger.warning("❌ FAIL (Missing title or year)")
                
        except Exception as e:
            logger.error(f"Error extracting metadata: {e}")
            
    logger.info("--- Metadata Extraction Evaluation Complete ---")
    logger.info(f"Score: {passed}/{total} ({passed/total*100:.1f}%)")

if __name__ == "__main__":
    run_eval()
