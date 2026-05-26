
env_content = """DATABASE_URL=sqlite+aiosqlite:///./financial_tracker.db
DATABASE_URL_SYNC=sqlite:///./financial_tracker.db
SECRET_KEY=dev-secret-key-change-in-production-use-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
APP_NAME=AI-Powered Financial Tracker
DEBUG=True
API_V1_PREFIX=/api/v1
"""

with open('.env', 'w', encoding='utf-8') as f:
    f.write(env_content)
print(".env created successfully")
