import os
import logging
from typing import List, Dict
from abc import ABC, abstractmethod
import httpx

logger = logging.getLogger(__name__)

class EmbeddingProvider(ABC):
    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        pass

    @abstractmethod
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        pass

class LocalEmbeddingProvider(EmbeddingProvider):
    def __init__(self, model_name: str = "BAAI/bge-small-en-v1.5"):
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError:
            raise RuntimeError("sentence-transformers is not installed")
        
        # This will download the model on first run and cache it locally
        self.model = SentenceTransformer(model_name)
        self.dim = self.model.get_sentence_embedding_dimension()
        
    def embed_text(self, text: str) -> List[float]:
        return self.model.encode([text], normalize_embeddings=True)[0].tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return self.model.encode(texts, normalize_embeddings=True).tolist()

class ApiEmbeddingProvider(EmbeddingProvider):
    def __init__(self, url: str, key: str, model: str):
        self.url = url.rstrip('/')
        self.key = key
        self.model = model
    
    def embed_text(self, text: str) -> List[float]:
        return self.embed_batch([text])[0]

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        # OpenAI-compatible /v1/embeddings endpoint
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(
                f"{self.url}/v1/embeddings",
                headers={"Authorization": f"Bearer {self.key}"},
                json={"input": texts, "model": self.model}
            )
            resp.raise_for_status()
            data = resp.json()
            return [item["embedding"] for item in sorted(data["data"], key=lambda x: x["index"])]

def get_embedding_provider() -> EmbeddingProvider:
    provider = os.getenv("EMBEDDING_PROVIDER", "local")
    expected_dim = int(os.getenv("EMBEDDING_DIM", "384"))
    
    if provider == "local":
        model = LocalEmbeddingProvider()
        if model.dim != expected_dim:
            raise ValueError(f"Local embedding model dimension {model.dim} does not match expected EMBEDDING_DIM {expected_dim}")
        return model
    elif provider == "api":
        url = os.getenv("EMBEDDING_API_URL")
        key = os.getenv("EMBEDDING_API_KEY")
        model = os.getenv("EMBEDDING_MODEL")
        if not all([url, key, model]):
            raise ValueError("api provider requires EMBEDDING_API_URL, EMBEDDING_API_KEY, and EMBEDDING_MODEL")
        return ApiEmbeddingProvider(url, key, model)
    else:
        raise ValueError(f"Unknown EMBEDDING_PROVIDER: {provider}")


class LLMProvider(ABC):
    @abstractmethod
    def generate(self, system: str, messages: List[Dict[str, str]], json_mode: bool = False) -> str:
        pass

class ApiLLMProvider(LLMProvider):
    def __init__(self, url: str, key: str, model: str):
        self.url = url.rstrip('/')
        self.key = key
        self.model = model
        
    def generate(self, system: str, messages: List[Dict[str, str]], json_mode: bool = False) -> str:
        # OpenAI-compatible chat completions API
        payload = {
            "model": self.model,
            "messages": [{"role": "system", "content": system}] + messages,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
            
        with httpx.Client(timeout=60.0) as client:
            for attempt in range(3):
                try:
                    resp = client.post(
                        f"{self.url}/v1/chat/completions",
                        headers={"Authorization": f"Bearer {self.key}"},
                        json=payload
                    )
                    resp.raise_for_status()
                    return resp.json()["choices"][0]["message"]["content"]
                except Exception as e:
                    if attempt == 2:
                        raise e

class ExtractiveLLMProvider(LLMProvider):
    def generate(self, system: str, messages: List[Dict[str, str]], json_mode: bool = False) -> str:
        if json_mode:
            return '{"error": "extractive mode does not support json generation"}'
        return "Extractive mode fallback: Please refer to the cited chunks in the evidence graph."

def get_llm_provider() -> LLMProvider:
    provider = os.getenv("LLM_PROVIDER", "api")
    if provider == "api":
        url = os.getenv("LLM_API_URL", "https://api.openai.com")
        key = os.getenv("LLM_API_KEY")
        model = os.getenv("LLM_MODEL")
        if not all([key, model]):
            raise ValueError("api LLM provider requires LLM_API_KEY and LLM_MODEL")
        return ApiLLMProvider(url, key, model)
    else:
        return ExtractiveLLMProvider()

# Singletons initialized lazily
_embedding_provider = None
_llm_provider = None

def init_providers():
    global _embedding_provider, _llm_provider
    if _embedding_provider is None:
        logger.info("Initializing embedding provider...")
        _embedding_provider = get_embedding_provider()
    if _llm_provider is None:
        logger.info("Initializing LLM provider...")
        _llm_provider = get_llm_provider()

def embed_text(text: str) -> List[float]:
    init_providers()
    return _embedding_provider.embed_text(text)

def embed_batch(texts: List[str]) -> List[List[float]]:
    init_providers()
    return _embedding_provider.embed_batch(texts)

def generate_llm(system: str, messages: List[Dict[str, str]], json_mode: bool = False) -> str:
    init_providers()
    return _llm_provider.generate(system, messages, json_mode)
