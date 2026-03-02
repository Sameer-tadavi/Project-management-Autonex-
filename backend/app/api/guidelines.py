"""
Guidelines API — CRUD for project guidelines (text-based).
Supports creating, listing, updating, and deleting guidelines.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.db.database import get_db
from app.models.guideline import Guideline

router = APIRouter(prefix="/api/guidelines", tags=["Guidelines"])


# ── Schemas ─────────────────────────────────────────────────────────
class GuidelineCreate(BaseModel):
    main_project_id: Optional[int] = None
    sub_project_id: Optional[int] = None
    title: str
    content: Optional[str] = None
    file_name: Optional[str] = None
    uploaded_by: Optional[int] = None


class GuidelineUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class GuidelineResponse(BaseModel):
    id: int
    main_project_id: Optional[int] = None
    sub_project_id: Optional[int] = None
    title: str
    content: Optional[str] = None
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    uploaded_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Endpoints ───────────────────────────────────────────────────────

@router.get("", response_model=List[GuidelineResponse])
def list_guidelines(
    main_project_id: Optional[int] = None,
    sub_project_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """List guidelines, optionally filtered by project."""
    query = db.query(Guideline)
    if main_project_id:
        query = query.filter(Guideline.main_project_id == main_project_id)
    if sub_project_id:
        query = query.filter(Guideline.sub_project_id == sub_project_id)
    return query.order_by(Guideline.created_at.desc()).all()


@router.get("/{guideline_id}", response_model=GuidelineResponse)
def get_guideline(guideline_id: int, db: Session = Depends(get_db)):
    g = db.query(Guideline).filter(Guideline.id == guideline_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Guideline not found")
    return g


@router.post("", response_model=GuidelineResponse)
def create_guideline(payload: GuidelineCreate, db: Session = Depends(get_db)):
    g = Guideline(**payload.dict())
    db.add(g)
    db.commit()
    db.refresh(g)
    return g


@router.put("/{guideline_id}", response_model=GuidelineResponse)
def update_guideline(guideline_id: int, payload: GuidelineUpdate, db: Session = Depends(get_db)):
    g = db.query(Guideline).filter(Guideline.id == guideline_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Guideline not found")
    for key, value in payload.dict(exclude_unset=True).items():
        setattr(g, key, value)
    db.commit()
    db.refresh(g)
    return g


@router.delete("/{guideline_id}")
def delete_guideline(guideline_id: int, db: Session = Depends(get_db)):
    g = db.query(Guideline).filter(Guideline.id == guideline_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Guideline not found")
    db.delete(g)
    db.commit()
    return {"message": "Guideline deleted successfully"}
