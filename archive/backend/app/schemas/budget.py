from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from decimal import Decimal


class BudgetPeriod(str):
    MONTHLY = "monthly"
    YEARLY = "yearly"


class BudgetBase(BaseModel):
    category_id: int = Field(..., description="Category ID for the budget")
    amount: Decimal = Field(..., gt=0, description="Budget amount")
    period: str = Field(default="monthly", description="Budget period (monthly or yearly)")
    start_date: datetime = Field(..., description="Budget start date")
    end_date: Optional[datetime] = Field(None, description="Budget end date (optional)")


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    category_id: Optional[int] = None
    amount: Optional[Decimal] = Field(None, gt=0)
    period: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    category_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BudgetWithProgress(BudgetResponse):
    spent: Decimal = Field(default=Decimal("0.00"), description="Amount spent in this budget period")
    remaining: Decimal = Field(default=Decimal("0.00"), description="Amount remaining in budget")
    percentage: float = Field(default=0.0, description="Percentage of budget used")
    status: str = Field(default="on_track", description="Budget status: on_track, warning, exceeded")

    class Config:
        from_attributes = True
