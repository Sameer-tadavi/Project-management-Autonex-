from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.leave import Leave
from app.schemas.leave import Leave as LeaveSchema, LeaveCreate

router = APIRouter(prefix="/api/leaves", tags=["Leaves"])


@router.get("", response_model=List[LeaveSchema])
def get_all_leaves(
    employee_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all leaves, optionally filtered by employee_id"""
    query = db.query(Leave)
    if employee_id:
        query = query.filter(Leave.employee_id == employee_id)
    
    leaves = query.all()
    return [
        LeaveSchema(
            leave_id=leave.id,
            employee_id=leave.employee_id,
            start_date=leave.start_date,
            end_date=leave.end_date,
            leave_type=leave.leave_type,
            reason=leave.reason,
            status=leave.status or "pending",
            approved_by=leave.approved_by,
        )
        for leave in leaves
    ]


@router.get("/{leave_id}", response_model=LeaveSchema)
def get_leave(leave_id: int, db: Session = Depends(get_db)):
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    return LeaveSchema(
        leave_id=leave.id,
        employee_id=leave.employee_id,
        start_date=leave.start_date,
        end_date=leave.end_date,
        leave_type=leave.leave_type,
        reason=leave.reason,
        status=leave.status or "pending",
        approved_by=leave.approved_by,
    )


@router.post("", response_model=LeaveSchema, status_code=201)
def create_leave(payload: LeaveCreate, db: Session = Depends(get_db)):
    leave = Leave(
        employee_id=payload.employee_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        leave_type=payload.leave_type,
        reason=payload.reason,
        status="pending",
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
        reason=leave.reason,
        status=leave.status or "pending",
        approved_by=leave.approved_by,
    )


@router.put("/{leave_id}", response_model=LeaveSchema)
def update_leave(leave_id: int, payload: LeaveCreate, db: Session = Depends(get_db)):
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    leave.employee_id = payload.employee_id
    leave.start_date = payload.start_date
    leave.end_date = payload.end_date
    leave.leave_type = payload.leave_type
    leave.reason = payload.reason
    db.commit()
    db.refresh(leave)
    return LeaveSchema(
        leave_id=leave.id,
        employee_id=leave.employee_id,
        start_date=leave.start_date,
        end_date=leave.end_date,
        leave_type=leave.leave_type,
        reason=leave.reason,
        status=leave.status or "pending",
        approved_by=leave.approved_by,
    )


# ── Approve / Reject ───────────────────────────────────────────────

@router.patch("/{leave_id}/approve")
def approve_leave(leave_id: int, approved_by: int = 0, db: Session = Depends(get_db)):
    """Approve a leave request. Pass approved_by as query param (user_id)."""
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    leave.status = "approved"
    leave.approved_by = approved_by
    db.commit()
    return {"message": "Leave approved", "leave_id": leave_id, "status": "approved"}


@router.patch("/{leave_id}/reject")
def reject_leave(leave_id: int, approved_by: int = 0, db: Session = Depends(get_db)):
    """Reject a leave request."""
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    leave.status = "rejected"
    leave.approved_by = approved_by
    db.commit()
    return {"message": "Leave rejected", "leave_id": leave_id, "status": "rejected"}


@router.delete("/{leave_id}")
def delete_leave(leave_id: int, db: Session = Depends(get_db)):
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    db.delete(leave)
    db.commit()
    return {"message": "Leave deleted successfully"}
