import argparse
import sys
import logging
from app.services.ingest import ingest_all

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    parser = argparse.ArgumentParser(description="AI Service CLI")
    parser.add_argument("command", choices=["ingest-all"], help="Command to run")
    
    args = parser.parse_args()
    
    if args.command == "ingest-all":
        logger.info("Starting bulk ingestion of all approved documents...")
        results = ingest_all()
        logger.info(f"Ingestion complete: {results['total_documents']} documents, {results['total_chunks']} total chunks.")
        
        has_errors = any(r.get("status") == "error" for r in results.get("results", []))
        if has_errors:
            logger.error("Some documents failed to ingest. See logs above.")
            sys.exit(1)
    else:
        parser.print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
