from pydantic import BaseModel
from typing import List, Optional


class ChatMessageSchema(BaseModel):
    role: str          # "user" ou "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    token: str
    role: str = "ADMIN"
    historique: List[ChatMessageSchema] = []


class ChatResponse(BaseModel):
    reponse: str
    fonctions_utilisees: List[str] = []
    sources_rag: List[dict] = []
    model: str


class IndexRequest(BaseModel):
    token: str