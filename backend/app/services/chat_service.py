"""
Chat Service — Session management and message handling.
"""

from datetime import datetime
from sqlalchemy.orm import Session
from app.models import ChatSession, Message
from app.config import get_settings
from app.services import memory_service, model_router

settings = get_settings()


def create_session(db: Session, user_id: str, title: str = "New Chat") -> ChatSession:
    """Create a new chat session for a user."""
    session = ChatSession(user_id=user_id, title=title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_user_sessions(db: Session, user_id: str) -> list[ChatSession]:
    """Get all chat sessions for a user, newest first."""
    return (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user_id)
        .order_by(ChatSession.updated_at.desc())
        .all()
    )


def get_session(db: Session, session_id: str, user_id: str) -> ChatSession | None:
    """Get a specific session, ensuring it belongs to the user."""
    return (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == user_id)
        .first()
    )


def delete_session(db: Session, session_id: str, user_id: str) -> bool:
    """Delete a chat session and all its messages."""
    session = get_session(db, session_id, user_id)
    if not session:
        return False
    db.delete(session)
    db.commit()
    return True


def get_session_messages(db: Session, session_id: str) -> list[Message]:
    """Get all messages in a session, oldest first."""
    return (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.created_at.asc())
        .all()
    )


def _auto_title(content: str) -> str:
    """Generate a short title from the first user message."""
    title = content.strip()[:60]
    if len(content) > 60:
        title += "..."
    return title


async def send_message(
    db: Session,
    session_id: str,
    user_id: str,
    content: str,
    model_name: str | None = None,
    image_base64: str | None = None,
) -> tuple[Message, Message]:
    """
    Process a user message:
    1. Save user message to DB
    2. Build context (system prompt + long-term memory + short-term messages)
    3. Send to AI model
    4. Save assistant response to DB
    5. Extract memories from user message
    6. Auto-title session if it's the first message

    Returns: (user_message, assistant_message)
    """
    # Save user message
    user_msg = Message(
        session_id=session_id,
        role="user",
        content=content,
        image_url="[image attached]" if image_base64 else None,
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # Build context
    # 1. System prompt + long-term memory
    long_term = memory_service.get_long_term_memory(db, user_id)
    memory_context = memory_service.format_memory_context(long_term)

    system_content = settings.SYSTEM_PROMPT
    if memory_context:
        system_content += f"\n\n{memory_context}"

    context_messages = [{"role": "system", "content": system_content}]

    # 2. Short-term memory (recent messages in this session)
    short_term = memory_service.get_short_term_memory(db, session_id)
    context_messages.extend(short_term)

    # 3. Get AI response
    ai_response = await model_router.get_ai_response(
        messages=context_messages,
        model_name=model_name,
        image_base64=image_base64,
    )

    # Save assistant message
    assistant_msg = Message(
        session_id=session_id,
        role="assistant",
        content=ai_response,
    )
    db.add(assistant_msg)

    # Update session timestamp
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if session:
        session.updated_at = datetime.utcnow()
        # Auto-title on first message
        if session.title == "New Chat":
            session.title = _auto_title(content)

    db.commit()
    db.refresh(assistant_msg)

    # Extract memories from user message (async, non-blocking)
    memory_service.extract_and_store_memories(db, user_id, content)

    return user_msg, assistant_msg
