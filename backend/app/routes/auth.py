from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import get_settings
from app.schemas import TokenResponse, UserResponse, DemoLoginRequest
from app.services.auth_service import (
    get_microsoft_auth_url,
    exchange_code_for_token,
    get_microsoft_user_info,
    get_or_create_user,
    create_access_token,
)
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()


@router.get("/login")
async def login():
    """Redirect to Microsoft OAuth2 login page."""
    if settings.DEMO_MODE:
        return {"message": "Demo mode active. Use POST /auth/demo-login instead.", "demo_mode": True}
    auth_url = get_microsoft_auth_url()
    return RedirectResponse(url=auth_url)


@router.get("/callback")
async def auth_callback(code: str = Query(...), db: Session = Depends(get_db)):
    """Handle Microsoft OAuth2 callback."""
    try:
        # Exchange code for Microsoft access token
        token_data = await exchange_code_for_token(code)
        ms_access_token = token_data["access_token"]

        # Get user info from Microsoft Graph
        user_info = await get_microsoft_user_info(ms_access_token)
        email = user_info.get("mail") or user_info.get("userPrincipalName", "")
        display_name = user_info.get("displayName", email)

        # Create or get user in our DB
        user = get_or_create_user(db, email, display_name, provider="microsoft")

        # Create our JWT token
        jwt_token = create_access_token(user.id, user.email)

        # Redirect to frontend with token
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/auth/callback?token={jwt_token}"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")


@router.post("/demo-login", response_model=TokenResponse)
async def demo_login(body: DemoLoginRequest, db: Session = Depends(get_db)):
    """Demo login for development/testing. Only works when DEMO_MODE=true."""
    if not settings.DEMO_MODE:
        raise HTTPException(status_code=403, detail="Demo mode is disabled")

    user = get_or_create_user(db, body.email, body.display_name, provider="demo")
    token = create_access_token(user.id, user.email)

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user info."""
    return UserResponse.model_validate(current_user)
