import httpx
from datetime import datetime, timedelta
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.config import get_settings
from app.models import User

settings = get_settings()

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Microsoft OAuth2 endpoints
AUTHORITY = f"https://login.microsoftonline.com/{settings.MICROSOFT_TENANT_ID}"
AUTHORIZE_URL = f"{AUTHORITY}/oauth2/v2.0/authorize"
TOKEN_URL = f"{AUTHORITY}/oauth2/v2.0/token"
GRAPH_URL = "https://graph.microsoft.com/v1.0/me"
SCOPES = "openid profile email User.Read"


def create_access_token(user_id: str, email: str) -> str:
    """Create a JWT token for authenticated user."""
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict | None:
    """Verify and decode a JWT token. Returns payload or None."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def get_microsoft_auth_url() -> str:
    """Build the Microsoft OAuth2 authorization URL."""
    params = {
        "client_id": settings.MICROSOFT_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": settings.MICROSOFT_REDIRECT_URI,
        "scope": SCOPES,
        "response_mode": "query",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{AUTHORIZE_URL}?{query}"


async def exchange_code_for_token(code: str) -> dict:
    """Exchange authorization code for access token from Microsoft."""
    data = {
        "client_id": settings.MICROSOFT_CLIENT_ID,
        "client_secret": settings.MICROSOFT_CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.MICROSOFT_REDIRECT_URI,
        "grant_type": "authorization_code",
        "scope": SCOPES,
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(TOKEN_URL, data=data)
        if resp.status_code != 200:
            print(f"FAILED TO EXCHANGE TOKEN. Status: {resp.status_code}")
            print(f"Error Body: {resp.text}")
            resp.raise_for_status()
        return resp.json()


async def get_microsoft_user_info(access_token: str) -> dict:
    """Fetch user profile from Microsoft Graph API."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            GRAPH_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        resp.raise_for_status()
        return resp.json()


def get_or_create_user(db: Session, email: str, display_name: str, provider: str = "microsoft") -> User:
    """Find existing user by email or create a new one."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, display_name=display_name, provider=provider)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
