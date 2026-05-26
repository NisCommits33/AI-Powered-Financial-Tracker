# Quick Commands for AI-Powered Financial Tracker

## Docker Commands

### Start all services
```powershell
docker-compose up --build
```

###Start in detached mode
```powershell
docker-compose up -d
```

### Stop all services
```powershell
docker-compose down
```

### View logs
```powershell
docker-compose logs -f
```

### Rebuild containers
```powershell
docker-compose up --build --force-recreate
```

### Seed database
```powershell
docker-compose exec backend python -m app.seed
```

## Backend Commands (Manual)

### Activate virtual environment
```powershell
cd backend
.\venv\Scripts\Activate
```

### Install dependencies
```powershell
pip install -r requirements.txt
```

### Run development server
```powershell
uvicorn app.main:app --reload
```

### Seed database
```powershell
python -m app.seed
```

### Run tests
```powershell
pytest -v --cov=app tests/
```

## Frontend Commands

### Install dependencies
```powershell
cd frontend
npm install
```

### Run development server
```powershell
npm run dev
```

### Build for production
```powershell
npm run build
```

### Run linter
```powershell
npm run lint
```

## Database Commands

### Create database
```powershell
createdb financial_tracker
```

### Access PostgreSQL
```powershell
psql -U postgres -d financial_tracker
```

### Drop database
```powershell
dropdb financial_tracker
```

## Useful URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation (Swagger): http://localhost:8000/docs
- API Documentation (ReDoc): http://localhost:8000/redoc
