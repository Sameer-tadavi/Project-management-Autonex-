"""Side Projects API — CRUD for employee personal side projects."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

from app.db.database import get_db
from app.models.side_project import SideProject

router = APIRouter(prefix="/api/side-projects", tags=["Side Projects"])


class SideProjectCreate(BaseModel):
    employee_id: int
    name: str
    description: Optional[str] = None
    status: Optional[str] = "active"
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class SideProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class SideProjectResponse(BaseModel):
    id: int
    employee_id: int
    name: str
    description: Optional[str] = None
    status: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=List[SideProjectResponse])
def list_side_projects(employee_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(SideProject)
    if employee_id:
        query = query.filter(SideProject.employee_id == employee_id)
    return query.order_by(SideProject.created_at.desc()).all()


@router.post("", response_model=SideProjectResponse, status_code=201)
def create_side_project(payload: SideProjectCreate, db: Session = Depends(get_db)):
    sp = SideProject(**payload.dict())
    db.add(sp)
    db.commit()
    db.refresh(sp)
    return sp


@router.put("/{sp_id}", response_model=SideProjectResponse)
def update_side_project(sp_id: int, payload: SideProjectUpdate, db: Session = Depends(get_db)):
    sp = db.query(SideProject).filter(SideProject.id == sp_id).first()
    if not sp:
        raise HTTPException(status_code=404, detail="Side project not found")
    for key, value in payload.dict(exclude_unset=True).items():
        setattr(sp, key, value)
    db.commit()
    db.refresh(sp)
    return sp


@router.delete("/{sp_id}")
def delete_side_project(sp_id: int, db: Session = Depends(get_db)):
    sp = db.query(SideProject).filter(SideProject.id == sp_id).first()
    if not sp:
        raise HTTPException(status_code=404, detail="Side project not found")
    db.delete(sp)
    db.commit()
    return {"message": "Side project deleted"}
