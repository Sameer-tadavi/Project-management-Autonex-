from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.leave import Leave
from app.schemas.leave import Leave as LeaveSchema, LeaveCreate

router = APIRouter(prefix="/api/leaves", tags=["Leaves"])


@router.get("", response_model=List[LeaveSchema])
def get_all_leaves(
    employee_id: int = None,
    db: Session = Depends(get_db)
):
    """Get all leaves, optionally filtered by employee_id"""
    query = db.query(Leave)
    if employee_id:
        query = query.filter(Leave.employee_id == employee_id)
    
    leaves = query.all()
    # Map id to leave_id for response
    return [
        LeaveSchema(
            leave_id=leave.id,
            employee_id=leave.employee_id,
            start_date=leave.start_date,
            end_date=leave.end_date,
            leave_type=leave.leave_type,
        )
        for leave in leaves
    ]


@router.get("/{leave_id}", response_model=LeaveSchema)
def get_leave(leave_id: int, db: Session = Depends(get_db)):
    """Get a specific leave by ID"""
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    
    return LeaveSchema(
        leave_id=leave.id,
        employee_id=leave.employee_id,
        start_date=leave.start_date,
        end_date=leave.end_date,
        leave_type=leave.leave_type,
    )


@router.post("", response_model=LeaveSchema, status_code=201)
def create_leave(payload: LeaveCreate, db: Session = Depends(get_db)):
    """Create a new leave record"""
    leave = Leave(
        employee_id=payload.employee_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        leave_type=payload.leave_type,
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    
    return LeaveSchema(
        leave_id=leave.id,
        employee_id=leave.employee_id,
        start_date=leave.start_date,
        end_date=leave.end_date,
        leave_type=leave.leave_type,
    )


@router.put("/{leave_id}", response_model=LeaveSchema)
def update_leave(
    leave_id: int,
    payload: LeaveCreate,
    db: Session = Depends(get_db)
):
    """Update an existing leave record"""
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    
    leave.employee_id = payload.employee_id
    leave.start_date = payload.start_date
    leave.end_date = payload.end_date
    leave.leave_type = payload.leave_type
    
    db.commit()
    db.refresh(leave)
    
    return LeaveSchema(
        leave_id=leave.id,
        employee_id=leave.employee_id,
        start_date=leave.start_date,
        end_date=leave.end_date,
        leave_type=leave.leave_type,
    )


@router.delete("/{leave_id}")
def delete_leave(leave_id: int, db: Session = Depends(get_db)):
    """Delete a leave record"""
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    
    db.delete(leave)
    db.commit()
    return {"message": "Leave deleted successfully"}
