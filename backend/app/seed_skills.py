from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.services import skill as skill_crud

def seed_skills():
    db = SessionLocal()
    try:
        initial_skills = [
            "Data Annotation",
            "Development",
            "Robotics",
            "Product Management",
            "React"
        ]
        
        for skill_name in initial_skills:
            skill_crud.create_skill_if_not_exists(db, skill_name)
        
        print(f"✅ Seeded {len(initial_skills)} skills")
    finally:
        db.close()

if __name__ == "__main__":
    seed_skills()