from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
from datetime import datetime

# Designation options
DesignationType = Literal["Program Manager", "Annotator", "Developer", "QA", "Reviewer"]


class EmployeeBase(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    employee_type: str = Field(..., pattern="^(Full-Time|Part-Time|Intern)$")
    
    # Designation for role-based filtering
    designation: Optional[str] = "Annotator"
    
    working_hours_per_day: float = Field(8.0, gt=0, le=24)
    weekly_availability: float = Field(40.0, gt=0, le=168)
    
    skills: Optional[List[str]] = []
    productivity_baseline: float = Field(1.0, gt=0, le=2.0)
    status: Optional[str] = "active"


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    employee_type: Optional[str] = None
    designation: Optional[str] = None
    
    working_hours_per_day: Optional[float] = None
    weekly_availability: Optional[float] = None
    
    skills: Optional[List[str]] = None
    productivity_baseline: Optional[float] = None
    status: Optional[str] = None


class EmployeeResponse(EmployeeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
