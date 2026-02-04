from fastapi import APIRouter, Request
from typing import Set
import time

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Simple in-memory token blacklist (for production, use Redis)
# Format: {token: expiry_timestamp}
_blacklisted_tokens: Set[str] = set()

def is_token_blacklisted(token: str) -> bool:
    """Check if token is blacklisted."""
    return token in _blacklisted_tokens

@router.post("/logout")
async def logout(request: Request):
    """
    Logout endpoint - adds token to blacklist.
    In production, use Redis with TTL matching JWT expiry.
    """
    auth_header = request.headers.get("Authorization", "")
    
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]  # Remove "Bearer " prefix
        _blacklisted_tokens.add(token)
    
    return {"message": "Logged out successfully", "status": "ok"}


@router.get("/verify")
async def verify_token(request: Request):
    """
    Verify if the current token is valid (not blacklisted).
    """
    auth_header = request.headers.get("Authorization", "")
    
    if not auth_header.startswith("Bearer "):
        return {"valid": False, "reason": "No token provided"}
    
    token = auth_header[7:]
    
    if is_token_blacklisted(token):
        return {"valid": False, "reason": "Token has been invalidated"}
    
    return {"valid": True}
