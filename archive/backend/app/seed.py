"""
Database seed script to populate initial categories.
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.category import Category
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.budget import Budget


DEFAULT_CATEGORIES = [
    {"name": "Food & Dining", "icon": "utensils", "color": "#FF6B6B"},
    {"name": "Transportation", "icon": "car", "color": "#4ECDC4"},
    {"name": "Shopping", "icon": "shopping-bag", "color": "#45B7D1"},
    {"name": "Entertainment", "icon": "film", "color": "#96CEB4"},
    {"name": "Housing", "icon": "home", "color": "#FFEAA7"},
    {"name": "Utilities", "icon": "zap", "color": "#DFE6E9"},
    {"name": "Healthcare", "icon": "heart", "color": "#FD79A8"},
    {"name": "Insurance", "icon": "shield", "color": "#A29BFE"},
    {"name": "Education", "icon": "book", "color": "#74B9FF"},
    {"name": "Personal Care", "icon": "user", "color": "#FAB1A0"},
    {"name": "Investment", "icon": "trending-up", "color": "#55EFC4"},
    {"name": "Salary", "icon": "dollar-sign", "color": "#00B894"},
    {"name": "Business", "icon": "briefcase", "color": "#6C5CE7"},
    {"name": "Gifts", "icon": "gift", "color": "#FD79A8"},
    {"name": "Other", "icon": "more-horizontal", "color": "#B2BEC3"},
]


async def seed_categories():
    """Seed default categories into the database."""
    async with AsyncSessionLocal() as db:
        try:
            # Check if categories already exist
            result = await db.execute(select(Category).filter(Category.is_default == True))
            existing_categories = result.scalars().all()
            
            if existing_categories:
                print("✓ Default categories already exist. Skipping seed.")
                return
            
            # Create default categories
            for cat_data in DEFAULT_CATEGORIES:
                category = Category(
                    name=cat_data["name"],
                    icon=cat_data["icon"],
                    color=cat_data["color"],
                    is_default=True
                )
                db.add(category)
            
            await db.commit()
            print(f"✓ Successfully seeded {len(DEFAULT_CATEGORIES)} default categories.")
            
        except Exception as e:
            await db.rollback()
            print(f"✗ Error seeding categories: {e}")
            raise


if __name__ == "__main__":
    print("🌱 Seeding database with default categories...")
    asyncio.run(seed_categories())
