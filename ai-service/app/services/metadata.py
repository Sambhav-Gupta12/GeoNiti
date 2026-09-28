import json
import logging
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ValidationError

from app.core.providers import get_llm_provider
from app.db import get_db_pool

logger = logging.getLogger(__name__)

class MetadataExtracted(BaseModel):
    title: Optional[str] = None
    authors: List[str] = []
    year: Optional[int] = None
    organization: Optional[str] = None
    region_names: List[str] = []
    topics: List[str] = []
    keywords: List[str] = []
    document_type: str = "research_paper"
    abstract: Optional[str] = None
    confidence: Dict[str, float] = {}

def extract_metadata_heuristics(text: str) -> MetadataExtracted:
    # Basic heuristic fallback
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    title = lines[0] if lines else "Unknown Document"
    
    year_match = re.search(r'\b(19|20)\d{2}\b', text)
    year = int(year_match.group(0)) if year_match else None
    
    # Very basic abstract finding
    abstract = ""
    for i, line in enumerate(lines):
        if "abstract" in line.lower() or "summary" in line.lower():
            abstract = " ".join(lines[i+1:i+6])
            break
            
    if not abstract and len(lines) > 1:
        abstract = lines[1]
        
    return MetadataExtracted(
        title=title[:255],
        authors=[],
        year=year,
        organization=None,
        region_names=[],
        topics=["Land Use"],
        keywords=["heuristic"],
        document_type="research_paper",
        abstract=abstract[:1000] if abstract else None,
        confidence={
            "title": 0.5,
            "year": 0.8 if year else 0.0,
            "abstract": 0.4
        }
    )

def extract_metadata(text: str) -> Dict[str, Any]:
    llm = get_llm_provider()
    
    if llm.__class__.__name__ == "ExtractiveLLMProvider":
        meta = extract_metadata_heuristics(text)
        return meta.model_dump()
        
    prompt = """You are an expert document metadata extractor.
Extract the following metadata fields from the text provided:
- title (string)
- authors (list of strings)
- year (integer, e.g. 2023)
- organization (string)
- region_names (list of strings, e.g. "Delhi", "Haryana")
- topics (list of strings)
- keywords (list of strings)
- document_type (string, one of: research_paper, policy, legal, case_study, report)
- abstract (string, summarize if not explicitly present)
- confidence (object mapping each field name to a confidence score 0.0-1.0)

Output strictly in JSON format matching this schema. Do not include markdown formatting or extra text.
"""

    messages = [{"role": "user", "content": text[:8000]}] # limit text size to 8000 chars for context window
    
    for attempt in range(3):
        try:
            result = llm.generate(system=prompt, messages=messages, json_mode=True)
            
            # Clean possible markdown from JSON output just in case
            if result.startswith("```json"):
                result = result[7:]
            if result.endswith("```"):
                result = result[:-3]
                
            parsed = json.loads(result)
            validated = MetadataExtracted(**parsed)
            return validated.model_dump()
        except (json.JSONDecodeError, ValidationError) as e:
            logger.warning(f"Failed to parse or validate metadata JSON (Attempt {attempt+1}): {e}")
            if attempt == 2:
                logger.error("All extraction retries failed, falling back to heuristics.")
                return extract_metadata_heuristics(text).model_dump()
        except Exception as e:
            logger.error(f"Unexpected error during metadata extraction: {e}")
            return extract_metadata_heuristics(text).model_dump()
            
    return extract_metadata_heuristics(text).model_dump()
