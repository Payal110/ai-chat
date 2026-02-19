from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Auth ──
class UserCreate(BaseModel):
    email: str
    display_name: str
    provider: str = "microsoft"


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: str
    provider: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class DemoLoginRequest(BaseModel):
    email: str = "demo@example.com"
    display_name: str = "Demo User"


# ── Chat Sessions ──
class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Chat"


class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Messages ──
class MessageCreate(BaseModel):
    content: str
    model: Optional[str] = None  # if None, uses DEFAULT_MODEL
    image_base64: Optional[str] = None  # base64-encoded image


class MessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    image_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    user_message: MessageResponse
    assistant_message: MessageResponse


class DocumentResponse(BaseModel):
    filename: str
    content: str


# ── Memory ──
class MemoryCreate(BaseModel):
    key: str
    value: str
    category: str = "general"


class MemoryResponse(BaseModel):
    id: int
    key: str
    value: str
    category: str
    created_at: datetime

    class Config:
        from_attributes = True


class MemoryListResponse(BaseModel):
    memories: List[MemoryResponse]
