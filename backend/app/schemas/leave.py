from pydantic import BaseModel, Field, validator
from datetime import date
from typing import Optional

class LeaveBase(BaseModel):
    employee_id: int = Field(..., gt=0)
    start_date: date
    end_date: date
    leave_type: str = Field(..., pattern="^(casual|sick|vacation|personal|emergency)$")

    @validator("end_date")
    def end_after_start(cls, v, values):
        if "start_date" in values and v < values["start_date"]:
            raise ValueError("end_date must be >= start_date")
        return v


class LeaveCreate(LeaveBase):
    pass

class LeaveUpdate(LeaveBase):
    pass

class Leave(LeaveBase):
    leave_id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
