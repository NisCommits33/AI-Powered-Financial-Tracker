from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.database import init_db
from app.api.v1.api import api_router

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Financial Tracker API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handlers
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle SQLAlchemy database errors."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Database error occurred"}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )


# Event handlers
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup."""
    # Uncomment to create tables on startup (for development)
    await init_db()
    
    # Auto-migration for currency column
    try:
        from sqlalchemy import text, inspect
        from app.core.database import async_engine
        
        def check_currency_column(connection):
            inspector = inspect(connection)
            columns = [c['name'] for c in inspector.get_columns('users')]
            return 'currency' in columns

        async with async_engine.connect() as conn:
            # Check if column exists using sync inspector
            has_currency = await conn.run_sync(check_currency_column)
            
            if not has_currency:
                print("Migrating: Adding currency column to users table...")
                # SQLite syntax compatible
                await conn.execute(text("ALTER TABLE users ADD COLUMN currency VARCHAR DEFAULT 'USD'"))
                await conn.commit()
                print("Migration successful: currency column added.")
    except Exception as e:
        print(f"Migration warning: {e}")

    print(f"🚀 {settings.APP_NAME} started successfully!")
    print(f"📚 API Documentation: http://localhost:8000/docs")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown."""
    print(f"👋 {settings.APP_NAME} shutting down...")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "app": settings.APP_NAME}


# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
