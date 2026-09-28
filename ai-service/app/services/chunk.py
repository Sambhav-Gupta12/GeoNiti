import tiktoken
import re
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

def get_tokenizer():
    return tiktoken.get_encoding("cl100k_base")

def split_into_sentences(text: str) -> List[str]:
    # Basic sentence splitter
    text = text.replace('\n', ' \n ')
    # split on . ? ! followed by space or newline
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if s.strip()]

def chunk_text(text: str, max_tokens: int = 400, overlap_tokens: int = 60) -> List[Dict[str, Any]]:
    tokenizer = get_tokenizer()
    sentences = split_into_sentences(text)
    
    chunks = []
    current_chunk_sentences = []
    current_chunk_tokens = 0
    chunk_index = 0
    
    for sentence in sentences:
        tokens = tokenizer.encode(sentence)
        num_tokens = len(tokens)
        
        # If a single sentence is larger than max_tokens, it will exceed it (simplification)
        if current_chunk_tokens + num_tokens > max_tokens and current_chunk_sentences:
            # Finalize chunk
            chunk_text_str = " ".join(current_chunk_sentences)
            chunks.append({
                "chunk_index": chunk_index,
                "content": chunk_text_str,
                "token_count": current_chunk_tokens
            })
            chunk_index += 1
            
            # Start new chunk with overlap
            # keep removing from the beginning of current_chunk_sentences until token count < overlap_tokens
            # or just take the last few sentences
            overlap_sentences = []
            overlap_count = 0
            for s in reversed(current_chunk_sentences):
                s_toks = len(tokenizer.encode(s))
                if overlap_count + s_toks <= overlap_tokens:
                    overlap_sentences.insert(0, s)
                    overlap_count += s_toks
                else:
                    break
            
            current_chunk_sentences = overlap_sentences
            current_chunk_tokens = overlap_count
        
        current_chunk_sentences.append(sentence)
        current_chunk_tokens += num_tokens
        
    if current_chunk_sentences:
        chunk_text_str = " ".join(current_chunk_sentences)
        chunks.append({
            "chunk_index": chunk_index,
            "content": chunk_text_str,
            "token_count": current_chunk_tokens
        })
        
    logger.info(f"Chunked text into {len(chunks)} chunks.")
    return chunks
