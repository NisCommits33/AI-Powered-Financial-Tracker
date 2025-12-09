from datetime import datetime, date
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, Field

from app.models.transaction import TransactionType


class TransactionBase(BaseModel):
    """Base transaction schema."""
    amount: Decimal = Field(..., gt=0)
    transaction_type: TransactionType
    description: str = Field(..., min_length=1, max_length=255)
    transaction_date: date
    notes: Optional[str] = None
    category_id: Optional[int] = None


class TransactionCreate(TransactionBase):
    """Schema for transaction creation."""
    account_id: int


class TransactionUpdate(BaseModel):
    """Schema for transaction update."""
    amount: Optional[Decimal] = Field(None, gt=0)
    transaction_type: Optional[TransactionType] = None
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    transaction_date: Optional[date] = None
    notes: Optional[str] = None
    category_id: Optional[int] = None
    account_id: Optional[int] = None


class TransactionResponse(TransactionBase):
    """Schema for transaction response."""
    id: int
    user_id: int
    account_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TransactionWithDetails(TransactionResponse):
    """Schema for transaction with account and category details."""
    account_name: Optional[str] = None
    category_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class TransactionFilter(BaseModel):
    """Schema for transaction filtering."""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    transaction_type: Optional[TransactionType] = None
    category_id: Optional[int] = None
    account_id: Optional[int] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None
