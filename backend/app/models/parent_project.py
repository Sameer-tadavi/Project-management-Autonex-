from sqlalchemy import Column, Integer, String, Date, Text, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base


class MainProject(Base):
    """
    Main Project entity for hierarchical project management.
    Supports long-term initiatives like "Yutori" with multiple sub-projects/batches.
    """
    __tablename__ = "main_projects"

    id = Column(Integer, primary_key=True, index=True)
    
    # Core fields
    name = Column(Text, nullable=False)                     # e.g., "Yutori"
    program_manager_id = Column(Integer, nullable=True)     # Reference to Employee ID
    description = Column(Text, nullable=True)               # Scope of work
    client = Column(Text, nullable=True)                    # Client details for inheritance
    
    # Timeline
    global_start_date = Column(Date, nullable=False)
    tentative_duration_months = Column(Integer, nullable=True)
    
    # Status: active, completed, archived
    status = Column(Text, default="active")
    
    # Timestamps
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now()
    )
    
    # Relationship to sub-projects
    sub_projects = relationship(
        "SubProject",
        back_populates="main_project",
        foreign_keys="SubProject.main_project_id"
    )

# Alias for backward compatibility
ParentProject = MainProject
