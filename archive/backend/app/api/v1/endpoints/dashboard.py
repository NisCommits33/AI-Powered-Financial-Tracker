from typing import List, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction, TransactionType
from app.models.category import Category
from app.schemas.account import AccountSummary
from app.schemas.transaction import TransactionResponse

router = APIRouter()


@router.get("/overview")
async def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get dashboard overview with financial summary.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        dict: Dashboard overview data
    """
    # Get total balance across all accounts
    balance_result = await db.execute(
        select(func.sum(Account.balance))
        .filter(Account.user_id == current_user.id, Account.is_active == True)
    )
    total_balance = balance_result.scalar() or Decimal("0.00")
    
    # Get current month income and expenses
    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0).date()
    
    # Total income this month
    income_result = await db.execute(
        select(func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == TransactionType.INCOME,
            Transaction.transaction_date >= current_month_start
        )
    )
    monthly_income = income_result.scalar() or Decimal("0.00")
    
    # Total expenses this month
    expense_result = await db.execute(
        select(func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == TransactionType.EXPENSE,
            Transaction.transaction_date >= current_month_start
        )
    )
    monthly_expenses = expense_result.scalar() or Decimal("0.00")
    
    # Get account count
    account_count_result = await db.execute(
        select(func.count(Account.id))
        .filter(Account.user_id == current_user.id, Account.is_active == True)
    )
    account_count = account_count_result.scalar()
    
    return {
        "total_balance": float(total_balance),
        "monthly_income": float(monthly_income),
        "monthly_expenses": float(monthly_expenses),
        "net_monthly": float(monthly_income - monthly_expenses),
        "account_count": account_count
    }


@router.get("/recent-transactions")
async def get_recent_transactions(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[TransactionResponse]:
    """
    Get recent transactions for dashboard.
    
    Args:
        limit: Number of transactions to return
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List[TransactionResponse]: Recent transactions
    """
    result = await db.execute(
        select(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
        .limit(limit)
    )
    transactions = result.scalars().all()
    
    return transactions


@router.get("/spending-by-category")
async def get_spending_by_category(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Get spending breakdown by category for current month.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List[dict]: Category spending data
    """
    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0).date()
    
    # Get spending by category
    result = await db.execute(
        select(
            Category.id,
            Category.name,
            Category.color,
            func.sum(Transaction.amount).label("total")
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == TransactionType.EXPENSE,
            Transaction.transaction_date >= current_month_start
        )
        .group_by(Category.id, Category.name, Category.color)
        .order_by(func.sum(Transaction.amount).desc())
    )
    
    category_spending = []
    for row in result:
        category_spending.append({
            "category_id": row.id,
            "category_name": row.name,
            "color": row.color,
            "amount": float(row.total)
        })
    
    return category_spending


@router.get("/accounts-summary")
async def get_accounts_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[AccountSummary]:
    """
    Get summary of all accounts for dashboard.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List[AccountSummary]: Account summaries
    """
    result = await db.execute(
        select(Account)
        .filter(Account.user_id == current_user.id, Account.is_active == True)
        .order_by(Account.balance.desc())
    )
    accounts = result.scalars().all()
    
    return accounts


@router.get("/monthly-trends")
async def get_monthly_trends(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Get monthly income vs expenses trends for the last 6 months.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List[dict]: Monthly trend data
    """
    # Calculate start date (6 months ago)
    end_date = datetime.now()
    start_date = (end_date - timedelta(days=180)).replace(day=1)
    
    # Get monthly sums
    result = await db.execute(
        select(
            func.date_trunc('month', Transaction.transaction_date).label('month'),
            Transaction.transaction_type,
            func.sum(Transaction.amount).label('total')
        )
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_date >= start_date
        )
        .group_by('month', Transaction.transaction_type)
        .order_by('month')
    )
    
    # Process results into a dictionary keyed by month
    monthly_data = {}
    
    # Initialize with zero values for the range
    current_month = start_date
    while current_month <= end_date:
        month_key = current_month.strftime("%Y-%m")
        monthly_data[month_key] = {
            "month": current_month.strftime("%b %Y"),
            "income": 0,
            "expense": 0
        }
        # Move to next month
        if current_month.month == 12:
            current_month = current_month.replace(year=current_month.year + 1, month=1)
        else:
            current_month = current_month.replace(month=current_month.month + 1)
            
    # Fill with actual data
    for row in result:
        month_key = row.month.strftime("%Y-%m")
        if month_key in monthly_data:
            if row.transaction_type == TransactionType.INCOME:
                monthly_data[month_key]["income"] = float(row.total)
            elif row.transaction_type == TransactionType.EXPENSE:
                monthly_data[month_key]["expense"] = float(row.total)
                
    return list(monthly_data.values())
