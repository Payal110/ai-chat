"""
Memory Service — Short-term and long-term memory management.

Short-term: Last N messages from the current session (configurable via MEMORY_WINDOW).
Long-term: User-specific facts/preferences stored in MemoryStore table.
"""

import re
from sqlalchemy.orm import Session
from app.models import Message, MemoryStore
from app.config import get_settings

settings = get_settings()

# Keywords that might indicate memorable user facts
MEMORY_TRIGGERS = [
    r"my name is (.+)",
    r"i am (.+)",
    r"i live in (.+)",
    r"i work (?:at|for|in) (.+)",
    r"i prefer (.+)",
    r"i like (.+)",
    r"i'm (.+)",
    r"remember that (.+)",
    r"my (?:favorite|favourite) (.+?) is (.+)",
]


def get_short_term_memory(db: Session, session_id: str) -> list[dict]:
    """
    Retrieve the last N messages from the current chat session
    to use as conversation context.
    """
    messages = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.created_at.desc())
        .limit(settings.MEMORY_WINDOW)
        .all()
    )
    # Reverse so oldest first
    messages.reverse()
    return [{"role": m.role, "content": m.content} for m in messages]


def get_long_term_memory(db: Session, user_id: str) -> list[dict]:
    """
    Retrieve all stored long-term memories for a user.
    Returns list of key-value pairs that can be injected into system prompt.
    """
    memories = (
        db.query(MemoryStore)
        .filter(MemoryStore.user_id == user_id)
        .order_by(MemoryStore.created_at.desc())
        .limit(50)  # cap at 50 to avoid overloading context
        .all()
    )
    return [{"key": m.key, "value": m.value, "category": m.category} for m in memories]


def format_memory_context(memories: list[dict]) -> str:
    """Format long-term memories into a string for the system prompt."""
    if not memories:
        return ""
    lines = ["Here are some things you know about this user:"]
    for m in memories:
        lines.append(f"- {m['key']}: {m['value']}")
    return "\n".join(lines)


def extract_and_store_memories(db: Session, user_id: str, user_message: str):
    """
    Parse user message for memorable facts and store them in long-term memory.
    Uses simple regex pattern matching.
    """
    text = user_message.strip().lower()

    for pattern in MEMORY_TRIGGERS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            groups = match.groups()
            if len(groups) == 2:
                key = f"favorite {groups[0]}"
                value = groups[1].strip().rstrip(".")
            else:
                key = _extract_key(pattern)
                value = groups[0].strip().rstrip(".")

            # Avoid duplicates
            existing = (
                db.query(MemoryStore)
                .filter(
                    MemoryStore.user_id == user_id,
                    MemoryStore.key == key,
                )
                .first()
            )
            if existing:
                existing.value = value
            else:
                memory = MemoryStore(
                    user_id=user_id,
                    key=key,
                    value=value,
                    category="auto-extracted",
                )
                db.add(memory)

    db.commit()


def _extract_key(pattern: str) -> str:
    """Derive a memory key name from the regex pattern."""
    key_map = {
        r"my name is (.+)": "name",
        r"i am (.+)": "identity",
        r"i live in (.+)": "location",
        r"i work (?:at|for|in) (.+)": "workplace",
        r"i prefer (.+)": "preference",
        r"i like (.+)": "likes",
        r"i'm (.+)": "identity",
        r"remember that (.+)": "remembered_fact",
    }
    return key_map.get(pattern, "fact")


def save_memory(db: Session, user_id: str, key: str, value: str, category: str = "manual"):
    """Manually save a memory for a user."""
    memory = MemoryStore(user_id=user_id, key=key, value=value, category=category)
    db.add(memory)
    db.commit()
    db.refresh(memory)
    return memory


def delete_user_memories(db: Session, user_id: str):
    """Delete all memories for a user."""
    db.query(MemoryStore).filter(MemoryStore.user_id == user_id).delete()
    db.commit()
