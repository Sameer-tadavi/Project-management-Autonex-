from app.db.database import Base, engine
from app.models import project, allocation, leave, employee, parent_project
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.projects import router as project_router
from app.api.allocations import router as allocation_router
from app.api.leaves import router as leave_router
from app.api.employees import router as employee_router
from app.api.skills import router as skills_router
from app.api.auth import router as auth_router
from app.api.parent_projects import router as parent_projects_router
from app.api.recommendations import router as recommendations_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Autonex Resource Planning Tool V2")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.include_router(project_router)
app.include_router(allocation_router)
app.include_router(leave_router)
app.include_router(employee_router)
app.include_router(skills_router)
app.include_router(auth_router)
app.include_router(parent_projects_router)
app.include_router(recommendations_router)
