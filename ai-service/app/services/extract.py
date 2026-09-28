import logging
from pypdf import PdfReader

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_path: str) -> str:
    logger.info(f"Extracting text from PDF: {file_path}")
    reader = PdfReader(file_path)
    text = ""
    for i, page in enumerate(reader.pages):
        page_text = page.extract_text()
        if page_text:
            # Keep a page marker
            text += f"\n--- Page {i+1} ---\n{page_text}"
    return text

def extract_text(file_path: str, mime_type: str = "application/pdf") -> str:
    if file_path.lower().endswith(".pdf") or "pdf" in mime_type:
        return extract_text_from_pdf(file_path)
    else:
        # Fallback to plain text
        logger.info(f"Extracting plain text: {file_path}")
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
