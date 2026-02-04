from sqlalchemy import Column, Integer, String, Date
from app.db.database import Base

class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, nullable=False)
    leave_type = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
