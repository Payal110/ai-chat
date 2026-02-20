"""
Model Router — Unified interface for multiple AI providers.

To add a new model for competition:
1. Add it to AVAILABLE_MODELS dict below
2. Set DEFAULT_MODEL in .env
That's it!
"""

import base64
import httpx
import json
from openai import AsyncOpenAI
from app.config import get_settings

settings = get_settings()

# ── Available Models Registry ──
# Base models always available
BASE_MODELS = {
    "gpt-4o": {"provider": "openai", "model_id": "gpt-4o", "vision": True},
    "gpt-4o-mini": {"provider": "openai", "model_id": "gpt-4o-mini", "vision": True},
    "deepseek-chat": {"provider": "deepseek", "model_id": "deepseek-chat", "vision": False},
    "deepseek-reasoner": {"provider": "deepseek", "model_id": "deepseek-reasoner", "vision": False},
}

def get_full_registry() -> dict:
    """Merge static models with dynamic competition models from .env."""
    registry = BASE_MODELS.copy()
    
    if settings.COMPETITION_MODEL_IDS:
        ids = [i.strip() for i in settings.COMPETITION_MODEL_IDS.split(",") if i.strip()]
        for model_id in ids:
            # Check if we should use raw HTTP or OpenAI library
            provider_type = "competition_raw" if settings.COMPETITION_USE_RAW_HTTP else "competition"
            registry[model_id] = {
                "provider": provider_type,
                "model_id": model_id,
                "vision": True
            }
    elif settings.COMPETITION_BASE_URL:
        # Fallback to single generic model if no IDs are provided but URL is
        registry["competition-model"] = {
            "provider": "competition",
            "model_id": "custom",
            "vision": True
        }
        
    return registry


def get_available_models() -> list[dict]:
    """Return list of models the user can choose from."""
    registry = get_full_registry()
    return [
        {"id": k, "name": k, "vision": v["vision"]}
        for k, v in registry.items()
    ]


def _get_client(provider: str) -> AsyncOpenAI:
    """Get the appropriate OpenAI-compatible client for a provider."""
    if provider == "openai":
        return AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
            http_client=httpx.AsyncClient(verify=settings.SSL_VERIFY)
        )
    elif provider == "deepseek":
        return AsyncOpenAI(
            api_key=settings.DEEPSEEK_API_KEY,
            base_url=settings.DEEPSEEK_BASE_URL,
            http_client=httpx.AsyncClient(verify=settings.SSL_VERIFY)
        )
    elif provider == "competition":
        return AsyncOpenAI(
            api_key=settings.COMPETITION_API_KEY,
            base_url=settings.COMPETITION_BASE_URL,
            http_client=httpx.AsyncClient(verify=settings.SSL_VERIFY)
        )
    else:
        raise ValueError(f"Unknown provider: {provider}")


def _build_messages(messages: list[dict], image_base64: str | None = None) -> list[dict]:
    """
    Build the message list for the API call.
    If image_base64 is provided, attach it to the last user message as a vision input.
    """
    formatted = []
    for msg in messages:
        formatted.append({"role": msg["role"], "content": msg["content"]})

    # Attach image to the last user message if provided
    if image_base64 and formatted:
        last_msg = formatted[-1]
        if last_msg["role"] == "user":
            formatted[-1] = {
                "role": "user",
                "content": [
                    {"type": "text", "text": last_msg["content"]},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{image_base64}",
                        },
                    },
                ],
            }
    return formatted


async def get_ai_response(
    messages: list[dict],
    model_name: str | None = None,
    image_base64: str | None = None,
) -> str:
    """
    Send messages to the selected AI model and return the response text.

    Args:
        messages: List of {"role": ..., "content": ...} dicts
        model_name: Model key from AVAILABLE_MODELS. Defaults to settings.DEFAULT_MODEL
        image_base64: Optional base64-encoded image for vision models

    Returns:
        The assistant's response text.
    """
    model_name = model_name or settings.DEFAULT_MODEL
    registry = get_full_registry()
    model_info = registry.get(model_name)
    
    if not model_info:
        return f"Error: Unknown model '{model_name}'. Available: {list(registry.keys())}"

    provider = model_info["provider"]

    # Check if API key is configured
    if provider == "openai" and not settings.OPENAI_API_KEY:
        return _echo_response(messages, model_name)
    if provider == "deepseek" and not settings.DEEPSEEK_API_KEY:
        return _echo_response(messages, model_name)

    try:
        if provider == "competition_raw":
            return await _get_raw_http_response(messages, model_info["model_id"], image_base64)
            
        client = _get_client(provider)
        formatted_messages = _build_messages(messages, image_base64)

        response = await client.chat.completions.create(
            model=model_info["model_id"],
            messages=formatted_messages,
            max_tokens=4096,
            temperature=0.7,
        )
        return response.choices[0].message.content or ""

    except Exception as e:
        return f"Error communicating with {model_name}: {str(e)}"


async def _get_raw_http_response(messages: list[dict], model_id: str, image_base64: str | None = None) -> str:
    """
    Fallback for non-OpenAI APIs. Calls base_url directly using httpx.
    EDIT THIS FUNCTION tomorrow if the competition API has a unique JSON structure.
    """
    url = settings.COMPETITION_BASE_URL
    headers = {
        "Authorization": f"Bearer {settings.COMPETITION_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # ── CUSTOMIZE THIS PAYLOAD ──
    # Most custom APIs look like this:
    payload = {
        "model": model_id,
        "prompt": messages[-1]["content"], # Just the last message
        "system_prompt": settings.SYSTEM_PROMPT,
        "temperature": 0.7,
        # "image": image_base64 # Uncomment if they want base64 image
    }

    async with httpx.AsyncClient(verify=settings.SSL_VERIFY) as client:
        response = await client.post(url, json=payload, headers=headers, timeout=30.0)
        response.raise_for_status()
        data = response.json()
        
    # ── CUSTOMIZE THIS EXTRACTION ──
    # Check if the text is in 'response', 'text', or 'choices'
    if isinstance(data, dict):
        if "response" in data:
            return str(data["response"])
        elif "text" in data:
            return str(data["text"])
        elif "choices" in data and len(data["choices"]) > 0:
            choice = data["choices"][0]
            if "message" in choice and "content" in choice["message"]:
                return str(choice["message"]["content"])
            elif "text" in choice:
                return str(choice["text"])
            
    return json.dumps(data, indent=2) # Fallback to showing raw JSON if unknown structure


def _echo_response(messages: list[dict], model_name: str) -> str:
    """Fallback echo response when no API key is configured."""
    last_user_msg = ""
    for msg in reversed(messages):
        if msg["role"] == "user":
            last_user_msg = msg["content"]
            break

    return (
        f"**[Demo Mode — {model_name}]**\n\n"
        f"API key not configured. Here's an echo of your message:\n\n"
        f"> {last_user_msg}\n\n"
        f"To enable real AI responses, add your API key to the `.env` file."
    )
