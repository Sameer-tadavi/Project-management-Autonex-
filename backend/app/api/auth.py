"""
Authentication API: signup, login, logout, me.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List

from app.db.database import get_db
from app.models.user import User
from app.models.employee import Employee
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    blacklist_token,
    is_token_blacklisted,
    get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ── Schemas ─────────────────────────────────────────────────────────
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    skills: Optional[List[str]] = None
    role: Optional[str] = "employee"       # admin, pm, employee


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    employee_id: Optional[int] = None
    skills: Optional[list] = None

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    token: str
    user: UserResponse


# ── Endpoints ───────────────────────────────────────────────────────

@router.post("/signup", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    """Register a new user. Defaults to 'employee' role."""

    # Check duplicate email
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Only allow 'employee' or 'pm' via signup; admin is seed-only
    role = body.role if body.role in ("employee", "pm") else "employee"

    # Create matching Employee record so they appear in the team
    employee = Employee(
        name=body.name,
        email=body.email,
        employee_type="Full-Time",
        designation="Program Manager" if role == "pm" else "Annotator",
        skills=body.skills or [],
        status="active",
    )
    db.add(employee)
    db.flush()  # get employee.id

    user = User(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password),
        role=role,
        employee_id=employee.id,
        skills=body.skills or [],
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role,
        "employee_id": user.employee_id,
    })

    return LoginResponse(
        token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate with email + password, returns JWT."""

    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role,
        "employee_id": user.employee_id,
    })

    return LoginResponse(
        token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/logout")
def logout(request: Request):
    """Invalidate current token."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        blacklist_token(auth_header[7:])
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    """Return the currently authenticated user profile."""
    return UserResponse.model_validate(user)


@router.get("/verify")
def verify_token(request: Request):
    """Quick check: is the bearer token still valid?"""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return {"valid": False, "reason": "No token provided"}
    token = auth_header[7:]
    if is_token_blacklisted(token):
        return {"valid": False, "reason": "Token invalidated"}
    return {"valid": True}
