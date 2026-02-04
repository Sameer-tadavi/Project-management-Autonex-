# Legacy commented code removed for clarity

from sqlalchemy import Column, Integer, String, Date, Float, Text, TIMESTAMP, JSON, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base


class SubProject(Base):
    __tablename__ = "sub_projects"

    id = Column(Integer, primary_key=True, index=True)
    
    # === Hierarchy Fields ===
    main_project_id = Column(Integer, ForeignKey("main_projects.id"), nullable=True)
    batch_name = Column(Text, nullable=True)              # e.g., "Batch 45"
    is_sub_project = Column(Boolean, default=False)
    previous_sub_project_id = Column(Integer, nullable=True)  # For cloning reference
    
    # Relationship to main project
    main_project = relationship(
        "MainProject",
        back_populates="sub_projects",
        foreign_keys=[main_project_id]
    )
    # === END Hierarchy Fields ===

    name = Column(Text, nullable=False)
    client = Column(Text, nullable=False)
    project_type = Column(Text, nullable=False)

    total_tasks = Column(Integer, nullable=False)
    estimated_time_per_task = Column(Float, nullable=False)

    # Store as JSON array: ["Python", "Data Analysis", ...]
    required_expertise = Column(JSON, nullable=True)
    
    # Store assigned employee IDs as JSON array: [1, 3, 5, ...]
    assigned_employee_ids = Column(JSON, nullable=True, default=[])

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    daily_target = Column(Integer, default=0)
    project_duration_weeks = Column(Integer, nullable=True)
    project_duration_days = Column(Integer, nullable=True)

    required_manpower = Column(Integer, default=0)  # Number of employees required
    allocated_employees = Column(Integer, default=0)  # Number actually allocated

    priority = Column(Text, default="medium")
    project_status = Column(Text, default="active")

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now()
    )

# Alias for backward compatibility
Project = SubProject