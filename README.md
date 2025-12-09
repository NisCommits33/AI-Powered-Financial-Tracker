# AI-Powered Financial Tracker

A modern, full-stack web application for personal financial management with AI-powered insights, multi-account support, and comprehensive budgeting tools.

## 🚀 Features

### Phase 1: Core MVP (Implemented)
- ✅ **User Authentication**: Secure JWT-based authentication with password hashing
- ✅ **Account Management**: Support for multiple account types (Checking, Savings, Credit, Cash)
- ✅ **Transaction Tracking**: Income and expense tracking with categorization
- ✅ **Dashboard**: Financial overview with balance, income, and expense summaries
- ✅ **Categories**: Predefined and custom transaction categories
- ✅ **RESTful API**: Complete FastAPI backend with OpenAPI documentation

### Coming Soon
- **Budgeting System**: Monthly budget tracking and alerts
- **Advanced Analytics**: Spending trends and financial insights
- **AI Features**: Auto-categorization and predictive analytics
- **Multi-user Support**: Shared accounts and collaborative budgeting

## 🏗️ Technology Stack

### Backend
- **Framework**: Python 3.11 + FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT + bcrypt
- **Cache**: Redis
- **API**: RESTful with automatic OpenAPI/Swagger docs
- **Testing**: Pytest

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit + RTK Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React

### DevOps
- **Containerization**: Docker + Docker Compose
- **Database Migrations**: Alembic

## 📋 Prerequisites

- Docker and Docker Compose **OR**
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

## 🚀 Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-Powered\ Financial\ Tracker
   ```

2. **Create environment files**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   # Edit .env with your configuration
   cd ..
   ```

3. **Start all services with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

5. **Seed the database with default categories**
   ```bash
   docker-compose exec backend python -m app.seed
   ```

## 🛠️ Manual Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Create database**
   ```bash
   # Using psql
   createdb financial_tracker
   ```

6. **Initialize database**
   ```bash
   # The app will create tables on first run, or use Alembic
   python -m app.seed
   ```

7. **Run the backend server**
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key API Endpoints

**Authentication**
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh access token

**Accounts**
- `GET /api/v1/accounts` - Get all accounts
- `POST /api/v1/accounts` - Create account
- `PUT /api/v1/accounts/{id}` - Update account
- `DELETE /api/v1/accounts/{id}` - Delete account

**Transactions**
- `GET /api/v1/transactions` - Get transactions (with filtering & pagination)
- `POST /api/v1/transactions` - Create transaction
- `PUT /api/v1/transactions/{id}` - Update transaction
- `DELETE /api/v1/transactions/{id}` - Delete transaction

**Dashboard**
- `GET /api/v1/dashboard/overview` - Get financial overview
- `GET /api/v1/dashboard/recent-transactions` - Get recent transactions
- `GET /api/v1/dashboard/spending-by-category` - Get spending breakdown

## 🗂️ Project Structure

```
financial-tracker/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/  # API endpoints
│   │   ├── core/              # Config & security
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   └── main.py            # FastAPI app
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── store/            # Redux store & API
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utility functions
│   │   └── styles/           # Global styles
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
└── docker-compose.yml
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest -v --cov=app tests/
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based authentication with refresh tokens
- Input validation with Pydantic
- SQL injection prevention with ORM
- CORS configuration
- Rate limiting (coming soon)

## 📊 Database Schema

### Core Tables
- **users** - User authentication and profiles
- **accounts** - Financial accounts
- **transactions** - Income and expense records
- **categories** - Transaction categories
- **budgets** - Budget tracking (Phase 2)

## 🤝 Contributing

This project is under active development. Contributions are welcome!

## 📝 Development Roadmap

### Phase 1: Core MVP ✅
- [x] Authentication system
- [x] Account management
- [x] Transaction tracking
- [x] Basic dashboard

### Phase 2: Advanced Features (Next)
- [ ] Budget management
- [ ] Advanced filtering
- [ ] CSV import/export
- [ ] Transaction templates

### Phase 3: AI Integration
- [ ] Auto-categorization
- [ ] Spending insights
- [ ] Cash flow forecasting
- [ ] Anomaly detection

### Phase 4: Collaboration
- [ ] Shared accounts
- [ ] Multi-user support
- [ ] Family budgeting
- [ ] API access

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -l`

### Frontend Not Loading
- Check if backend is running on port 8000
- Verify VITE_API_BASE_URL in frontend/.env
- Clear browser cache and restart dev server

### Docker Issues
- Run `docker-compose down -v` to remove volumes
- Rebuild containers: `docker-compose up --build`
- Check logs: `docker-compose logs backend`

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using FastAPI and React**
