# AI-Powered Financial Tracker - Setup Script
# This script helps set up the development environment

Write-Host "🚀 AI-Powered Financial Tracker - Setup Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking for Docker..." -ForegroundColor Yellow
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerInstalled) {
    Write-Host "✓ Docker is installed" -ForegroundColor Green
    $useDocker = Read-Host "Do you want to use Docker for setup? (Y/n)"
    if ($useDocker -eq "" -or $useDocker -eq "Y" -or $useDocker -eq "y") {
        Write-Host ""
        Write-Host "Setting up with Docker..." -ForegroundColor Cyan
        
        # Create .env files
        Write-Host "Creating environment files..." -ForegroundColor Yellow
        if (!(Test-Path "backend/.env")) {
            Copy-Item "backend/.env.example" "backend/.env"
            Write-Host "✓ Created backend/.env" -ForegroundColor Green
        }
        if (!(Test-Path "frontend/.env")) {
            Copy-Item "frontend/.env.example" "frontend/.env"
            Write-Host "✓ Created frontend/.env" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "Starting Docker containers..." -ForegroundColor Yellow
        docker-compose up --build -d
        
        Write-Host ""
        Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        Write-Host ""
        Write-Host "Seeding database with default categories..." -ForegroundColor Yellow
        docker-compose exec backend python -m app.seed
        
        Write-Host ""
        Write-Host "✓ Setup complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
        Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
        Write-Host "   Backend:  http://localhost:8000" -ForegroundColor White
        Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
        Write-Host ""
        Write-Host "To view logs: docker-compose logs -f" -ForegroundColor Yellow
        Write-Host "To stop:      docker-compose down" -ForegroundColor Yellow
        exit
    }
}

# Manual setup
Write-Host ""
Write-Host "Setting up manually..." -ForegroundColor Cyan

# Backend setup
Write-Host ""
Write-Host "📦 Backend Setup" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

$pythonInstalled = Get-Command python -ErrorAction SilentlyContinue
if (!$pythonInstalled) {
    Write-Host "✗ Python is not installed. Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Python is installed" -ForegroundColor Green

Set-Location backend

if (!(Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file" -ForegroundColor Green
    Write-Host "⚠ Please update backend/.env with your database credentials" -ForegroundColor Yellow
}

Set-Location ..

# Frontend setup
Write-Host ""
Write-Host "📦 Frontend Setup" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan

$npmInstalled = Get-Command npm -ErrorAction SilentlyContinue
if (!$npmInstalled) {
    Write-Host "✗ npm is not installed. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

Write-Host "✓ npm is installed" -ForegroundColor Green

Set-Location frontend

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "✓ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update backend/.env with your PostgreSQL credentials" -ForegroundColor White
Write-Host "2. Create database: createdb financial_tracker" -ForegroundColor White
Write-Host "3. Seed categories: cd backend && python -m app.seed" -ForegroundColor White
Write-Host "4. Start backend: cd backend && uvicorn app.main:app --reload" -ForegroundColor White
Write-Host "5. Start frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
