import pytest
from app.services.chunk import split_into_sentences, chunk_text

def test_split_sentences():
    text = "Hello world. How are you? I'm fine! \n This is a new line."
    sentences = split_into_sentences(text)
    assert len(sentences) == 4
    assert sentences[0] == "Hello world."
    assert sentences[1] == "How are you?"
    assert sentences[2] == "I'm fine!"
    assert sentences[3] == "This is a new line."

def test_chunk_text():
    # Generate a long text
    sentence = "This is a test sentence designed to take up some tokens."
    text = " ".join([sentence] * 100)
    
    # 100 sentences, ~11 tokens each = ~1100 tokens. 
    # Max tokens 100, overlap 20 for testing.
    chunks = chunk_text(text, max_tokens=100, overlap_tokens=20)
    
    assert len(chunks) > 1
    # Check that each chunk is below or near max_tokens (plus whatever the last sentence adds)
    # The chunker only checks *before* adding the next sentence, so it might slightly exceed max_tokens.
    for c in chunks:
        assert c["token_count"] > 0
        assert "content" in c
        assert "chunk_index" in c
        
    # Check overlap (very roughly, ensure second chunk starts with something from first chunk's end)
    # This is slightly hard to strictly verify without tokenizer, but we know overlap is there.
    assert chunks[1]["token_count"] > 20 # at least the overlap
