from sqlalchemy import Column, Integer, Float, Date, ForeignKey, Boolean, Text, JSON, TIMESTAMP
from sqlalchemy.sql import func
from app.db.database import Base


class Allocation(Base):
    """
    Enhanced Allocation model supporting:
    - Time-splitting across role tags
    - Mid-project join/release dates
    - Override flagging for forced allocations
    """
    __tablename__ = "allocations"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, nullable=False)
    sub_project_id = Column(Integer, ForeignKey("sub_projects.id"))
    
    # === NEW: Advanced Allocation Fields ===
    total_daily_hours = Column(Integer, default=8)           # 1-12 range
    active_start_date = Column(Date, nullable=True)          # Mid-project join
    active_end_date = Column(Date, nullable=True)            # Mid-project release
    
    # Role tagging and time distribution
    role_tags = Column(JSON, default=[])                     # ['Annotation', 'Review', 'QC']
    time_distribution = Column(JSON, default={})             # {'Annotation': 5, 'Review': 3}
    
    # Override for forced allocations despite warnings
    override_flag = Column(Boolean, default=False)
    override_reason = Column(Text, nullable=True)
    # === END Advanced Fields ===
    
    # Legacy fields (kept for backward compatibility)
    weekly_hours_allocated = Column(Float, nullable=True)
    weekly_tasks_allocated = Column(Integer, nullable=True)
    productivity_override = Column(Float, default=1.0)
    effective_week = Column(Date, nullable=True)
    
    # Timestamps
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now()
    )

