import os
import pytest
from app.core.providers import (
    get_embedding_provider, 
    get_llm_provider, 
    LocalEmbeddingProvider, 
    ApiEmbeddingProvider,
    ApiLLMProvider,
    ExtractiveLLMProvider
)

def test_get_embedding_provider_local(monkeypatch):
    monkeypatch.setenv("EMBEDDING_PROVIDER", "local")
    monkeypatch.setenv("EMBEDDING_DIM", "384")
    # Will download/load BAAI/bge-small-en-v1.5 locally
    provider = get_embedding_provider()
    assert isinstance(provider, LocalEmbeddingProvider)
    assert provider.dim == 384
    
    # Test a quick embed
    emb = provider.embed_text("Hello world")
    assert len(emb) == 384

def test_get_embedding_provider_api(monkeypatch):
    monkeypatch.setenv("EMBEDDING_PROVIDER", "api")
    monkeypatch.setenv("EMBEDDING_API_URL", "https://api.openai.com")
    monkeypatch.setenv("EMBEDDING_API_KEY", "sk-test")
    monkeypatch.setenv("EMBEDDING_MODEL", "text-embedding-3-small")
    
    provider = get_embedding_provider()
    assert isinstance(provider, ApiEmbeddingProvider)

def test_get_llm_provider_extractive(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "extractive")
    provider = get_llm_provider()
    assert isinstance(provider, ExtractiveLLMProvider)
    
    res = provider.generate("system", [{"role": "user", "content": "hello"}])
    assert "Extractive mode fallback" in res

def test_get_llm_provider_api(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "api")
    monkeypatch.setenv("LLM_API_KEY", "sk-test")
    monkeypatch.setenv("LLM_MODEL", "gpt-4o")
    
    provider = get_llm_provider()
    assert isinstance(provider, ApiLLMProvider)
    assert provider.model == "gpt-4o"
