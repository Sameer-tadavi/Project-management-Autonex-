# Autonex Backend

FastAPI backend for the Autonex Resource Planning Tool with PostgreSQL/SQLite database support.

## Quick Start

### Method 1: Automated Setup (Recommended)

**Windows - PowerShell:**
```powershell
.\setup-database.ps1
```

**Windows - Command Prompt:**
```cmd
setup-database.bat
```

This will create the `.env` file automatically with SQLite configuration.

### Method 2: Manual Setup

1. **Create `.env` file** in the backend directory:
   ```
   DATABASE_URL=sqlite:///./autonex.db
   ```

2. **Or copy from example:**
   ```bash
   cp .env.example .env
   ```

## Installation

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

2. **Activate virtual environment:**
   
   **Windows:**
   ```cmd
   venv\Scripts\activate
   ```
   
   **Mac/Linux:**
   ```bash
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Running the Backend

```bash
uvicorn app.main:app --reload
```

The backend will be available at: http://localhost:8000

**API Documentation:** http://localhost:8000/docs

## Database Configuration

### Option 1: SQLite (Default - Recommended for Development)

**Pros:**
- ✅ No installation required
- ✅ Single file database
- ✅ Perfect for development
- ✅ Easy to reset/backup

**Configuration (.env):**
```
DATABASE_URL=sqlite:///./autonex.db
```

### Option 2: PostgreSQL (Production)

**Pros:**
- ✅ Production-ready
- ✅ Better performance
- ✅ Advanced features
- ✅ Concurrent access

**Setup:**

1. **Install PostgreSQL** on your system

2. **Create database:**
   ```sql
   CREATE DATABASE autonex_db;
   CREATE USER autonex_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE autonex_db TO autonex_user;
   ```

3. **Update .env:**
   ```
   DATABASE_URL=postgresql://autonex_user:your_password@localhost:5432/autonex_db
   ```

## API Endpoints

### Projects
- `GET /projects` - List all projects
- `POST /projects` - Create new project
- `GET /projects/{id}` - Get project by ID
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

### Allocations
- `GET /allocations` - List all allocations
- `POST /allocations` - Create new allocation
- `PUT /allocations/{id}` - Update allocation
- `DELETE /allocations/{id}` - Delete allocation

### Leaves
- `GET /leaves` - List all leaves
- `POST /leaves` - Create new leave

## Project Structure

```
backend/
├── app/
│   ├── api/              # API endpoints
│   │   ├── projects.py
│   │   ├── allocations.py
│   │   └── leaves.py
│   ├── db/               # Database configuration
│   │   ├── database.py
│   │   └── deps.py
│   ├── models/           # SQLAlchemy models
│   │   ├── project.py
│   │   ├── allocation.py
│   │   └── leave.py
│   ├── schemas/          # Pydantic schemas
│   │   ├── project.py
│   │   ├── allocation.py
│   │   └── leave.py
│   ├── services/         # Business logic
│   │   ├── project_service.py
│   │   ├── allocation_service.py
│   │   └── leave_service.py
│   └── main.py           # FastAPI application
├── .env                  # Environment variables (create this!)
├── .env.example          # Environment variables template
├── requirements.txt      # Python dependencies
├── setup-database.bat    # Windows setup script
└── setup-database.ps1    # PowerShell setup script
```

## Dependencies

- **FastAPI** - Modern web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **python-dotenv** - Environment variables
- **psycopg2-binary** - PostgreSQL adapter (if using PostgreSQL)

## Development

### Reset Database

**SQLite:**
```bash
# Simply delete the database file
rm autonex.db
# Restart the backend to recreate tables
```

**PostgreSQL:**
```sql
DROP DATABASE autonex_db;
CREATE DATABASE autonex_db;
```

### View Database

**SQLite:**
```bash
# Install sqlite3 (usually pre-installed)
sqlite3 autonex.db
.tables
.schema projects
SELECT * FROM projects;
```

**PostgreSQL:**
```bash
psql -U autonex_user -d autonex_db
\dt
\d projects
SELECT * FROM projects;
```

## Common Issues & Solutions

### Issue 1: "Expected string or URL object, got None"
**Cause:** Missing .env file
**Solution:** Run `setup-database.bat` or `setup-database.ps1`, or create .env manually

### Issue 2: "No module named 'app'"
**Cause:** Wrong directory or virtual environment not activated
**Solution:** 
```bash
# Make sure you're in backend directory
cd backend
# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
```

### Issue 3: "Address already in use"
**Cause:** Port 8000 is already in use
**Solution:** 
```bash
# Use a different port
uvicorn app.main:app --reload --port 8001
```

### Issue 4: SQLite "database is locked"
**Cause:** Multiple processes accessing SQLite
**Solution:** The improved database.py handles this automatically with `check_same_thread=False`

### Issue 5: "Could not connect to database"
**Cause:** PostgreSQL not running or wrong credentials
**Solution:**
- Check PostgreSQL service is running
- Verify DATABASE_URL in .env
- Check username, password, host, and database name

## Testing

### Test API Endpoints

```bash
# Test with curl
curl http://localhost:8000/projects

# Test create project
curl -X POST http://localhost:8000/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "client": "Test Client",
    "project_type": "Full",
    "total_tasks": 100,
    "estimated_time_per_task": 2.5,
    "required_expertise": ["Python"],
    "start_date": "2025-01-15",
    "end_date": "2025-03-15",
    "priority": "high"
  }'
```

### Interactive API Docs

Visit http://localhost:8000/docs for interactive API documentation powered by Swagger UI.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | Database connection string | `sqlite:///./autonex.db` or `postgresql://user:pass@localhost:5432/db` |

## Security Notes

- ⚠️ Never commit `.env` file to version control
- ⚠️ Use strong passwords for production databases
- ⚠️ Keep DATABASE_URL secret
- ✅ `.env` is already in `.gitignore`

## Production Deployment

1. Use PostgreSQL instead of SQLite
2. Set proper environment variables
3. Use a production ASGI server (Uvicorn with Gunicorn)
4. Enable HTTPS
5. Set up proper logging
6. Configure CORS properly
7. Use database migrations (Alembic)

## Migration from SQLite to PostgreSQL

1. Export data from SQLite
2. Set up PostgreSQL database
3. Update DATABASE_URL in .env
4. Restart backend (tables will be created automatically)
5. Import data to PostgreSQL

## Support

For issues or questions:
1. Check the main README.md in the parent directory
2. Review CHANGES.md for recent updates
3. Check FastAPI documentation: https://fastapi.tiangolo.com/
4. Check SQLAlchemy documentation: https://www.sqlalchemy.org/

## License

This project is proprietary software for Autonex.
