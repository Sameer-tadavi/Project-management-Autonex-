"""
Guideline model — Stores project guideline documents/text.
Can be attached to MainProject or SubProject level.
"""
from sqlalchemy import Column, Integer, Text, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.db.database import Base


class Guideline(Base):
    __tablename__ = "guidelines"

    id = Column(Integer, primary_key=True, index=True)

    # Link to project hierarchy (one of these should be set)
    main_project_id = Column(Integer, ForeignKey("main_projects.id"), nullable=True)
    sub_project_id = Column(Integer, ForeignKey("sub_projects.id"), nullable=True)

    title = Column(Text, nullable=False)
    content = Column(Text, nullable=True)          # Rich text / markdown content
    file_name = Column(Text, nullable=True)         # Original filename if uploaded
    file_url = Column(Text, nullable=True)          # Storage URL or local path
    uploaded_by = Column(Integer, nullable=True)     # User ID of uploader

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now()
    )
