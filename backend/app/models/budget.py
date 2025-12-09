from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Date
from sqlalchemy.orm import relationship

from app.core.database import Base


class Budget(Base):
    """Budget model for monthly budgeting."""
    
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    month = Column(Date, nullable=False, index=True)
    total_amount = Column(Numeric(precision=12, scale=2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="budgets")
    budget_categories = relationship("BudgetCategory", back_populates="budget", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Budget {self.name} for {self.month}>"


class BudgetCategory(Base):
    """Budget category allocation model."""
    
    __tablename__ = "budget_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    allocated_amount = Column(Numeric(precision=12, scale=2), nullable=False)
    spent_amount = Column(Numeric(precision=12, scale=2), default=0.00, nullable=False)
    
    # Foreign Keys
    budget_id = Column(Integer, ForeignKey("budgets.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    
    # Relationships
    budget = relationship("Budget", back_populates="budget_categories")
    category = relationship("Category", back_populates="budget_categories")
    
    def __repr__(self):
        return f"<BudgetCategory allocated=${self.allocated_amount} spent=${self.spent_amount}>"
