from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.project import SubProject, Project  # SubProject with alias
from app.models.allocation import Allocation
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
)

router = APIRouter(
    prefix="/api/sub-projects",
    tags=["sub-projects"],
)

# ✅ CREATE PROJECT
@router.post("", response_model=ProjectResponse)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db)
):
    project = Project(**payload.dict())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


# ✅ LIST PROJECTS
@router.get("", response_model=list[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    return db.query(Project).order_by(Project.id.asc()).all()


# ✅ UPDATE PROJECT
@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = payload.dict(exclude_unset=True)
    old_status = project.project_status
    new_status = update_data.get('project_status', old_status)

    for key, value in update_data.items():
        setattr(project, key, value)

    # Auto-release: when project is completed, delete all allocations
    if new_status == 'completed' and old_status != 'completed':
        db.query(Allocation).filter(Allocation.sub_project_id == project_id).delete()
        project.allocated_employees = 0

    db.commit()
    db.refresh(project)
    return project


# ✅ DELETE PROJECT
@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Delete related allocations first to avoid FK constraint violation
    db.query(Allocation).filter(Allocation.sub_project_id == project_id).delete()

    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}