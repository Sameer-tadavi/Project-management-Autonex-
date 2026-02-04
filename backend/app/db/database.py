from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Get DATABASE_URL from environment, or use SQLite as default
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL is None:
    # Default to SQLite if no DATABASE_URL is provided
    DATABASE_URL = "sqlite:///./autonex.db"
    print(f"⚠️  No DATABASE_URL found in .env file. Using SQLite: {DATABASE_URL}")
else:
    # Print confirmation but hide password for security
    db_info = DATABASE_URL.split('@')[0] if '@' in DATABASE_URL else DATABASE_URL
    print(f"✅ Using database: {db_info}...")

# Add connect_args for SQLite to avoid threading issues
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args=connect_args
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
