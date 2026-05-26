import sys
import os

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.config import settings

def add_currency_column():
    """
    Connect to the database and safely add the currency column to the users table
    if it doesn't already exist, using synchronous SQLAlchemy engine.
    """
    print(f"Connecting to database using sync URL...")
    
    engine = create_engine(settings.DATABASE_URL_SYNC)
    
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text(
            """
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='currency'
            """
        ))
        row = result.fetchone()
        
        if not row:
            print("Adding 'currency' column to 'users' table...")
            conn.execute(text("ALTER TABLE users ADD COLUMN currency VARCHAR DEFAULT 'USD'"))
            conn.commit()
            print("Successfully added 'currency' column.")
        else:
            print("'currency' column already exists.")

if __name__ == "__main__":
    add_currency_column()
