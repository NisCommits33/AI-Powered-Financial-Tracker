import asyncio
from app.core.database import init_db

if __name__ == "__main__":
    print("Creating database tables...")
    asyncio.run(init_db())
    print("Tables created successfully.")
