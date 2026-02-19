from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, MemoryStore
from app.schemas import MemoryCreate, MemoryResponse, MemoryListResponse
from app.services import memory_service

router = APIRouter(prefix="/memory", tags=["Memory"])


@router.get("/", response_model=MemoryListResponse)
async def list_memories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all long-term memories for the current user."""
    memories = memory_service.get_long_term_memory(db, current_user.id)
    items = (
        db.query(MemoryStore)
        .filter(MemoryStore.user_id == current_user.id)
        .order_by(MemoryStore.created_at.desc())
        .all()
    )
    return MemoryListResponse(
        memories=[MemoryResponse.model_validate(m) for m in items]
    )


@router.post("/", response_model=MemoryResponse)
async def create_memory(
    body: MemoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Manually add a memory."""
    memory = memory_service.save_memory(
        db, current_user.id, body.key, body.value, body.category
    )
    return MemoryResponse.model_validate(memory)


@router.delete("/")
async def clear_memories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete all memories for the current user."""
    memory_service.delete_user_memories(db, current_user.id)
    return {"message": "All memories cleared"}
