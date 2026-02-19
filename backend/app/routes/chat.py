from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import (
    ChatSessionCreate,
    ChatSessionResponse,
    MessageCreate,
    MessageResponse,
    ChatResponse,
    DocumentResponse,
)
from app.services import chat_service, document_service
from app.services.model_router import get_available_models
import io

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/models")
async def list_models():
    """List available AI models."""
    return get_available_models()


@router.post("/sessions", response_model=ChatSessionResponse)
async def create_session(
    body: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new chat session."""
    session = chat_service.create_session(db, current_user.id, body.title)
    return ChatSessionResponse.model_validate(session)


@router.get("/sessions", response_model=list[ChatSessionResponse])
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all chat sessions for the current user."""
    sessions = chat_service.get_user_sessions(db, current_user.id)
    return [ChatSessionResponse.model_validate(s) for s in sessions]


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a chat session."""
    deleted = chat_service.delete_session(db, session_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted"}


@router.get("/sessions/{session_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all messages in a chat session."""
    session = chat_service.get_session(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    messages = chat_service.get_session_messages(db, session_id)
    return [MessageResponse.model_validate(m) for m in messages]


@router.post("/sessions/{session_id}/messages", response_model=ChatResponse)
async def send_message(
    session_id: str,
    body: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a message and get an AI response."""
    session = chat_service.get_session(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    user_msg, assistant_msg = await chat_service.send_message(
        db=db,
        session_id=session_id,
        user_id=current_user.id,
        content=body.content,
        model_name=body.model,
        image_base64=body.image_base64,
    )

    return ChatResponse(
        user_message=MessageResponse.model_validate(user_msg),
        assistant_message=MessageResponse.model_validate(assistant_msg),
    )


@router.post("/upload-document", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Upload a document and extract its text."""
    try:
        content = await file.read()
        extracted_text = document_service.extract_text_from_file(io.BytesIO(content), file.filename)
        return DocumentResponse(filename=file.filename, content=extracted_text)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process document: {str(e)}")

