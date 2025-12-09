from datetime import datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, Field

from app.models.account import AccountType


class AccountBase(BaseModel):
    """Base account schema."""
    name: str = Field(..., min_length=1, max_length=100)
    account_type: AccountType
    currency: str = Field(default="USD", min_length=3, max_length=3)
    description: Optional[str] = None


class AccountCreate(AccountBase):
    """Schema for account creation."""
    balance: Decimal = Field(default=Decimal("0.00"), ge=0)


class AccountUpdate(BaseModel):
    """Schema for account update."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class AccountResponse(AccountBase):
    """Schema for account response."""
    id: int
    balance: Decimal
    is_active: bool
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AccountSummary(BaseModel):
    """Schema for account summary in dashboard."""
    id: int
    name: str
    account_type: AccountType
    balance: Decimal
    currency: str
    
    class Config:
        from_attributes = True
