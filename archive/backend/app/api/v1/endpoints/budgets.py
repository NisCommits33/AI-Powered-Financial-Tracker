from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from datetime import datetime, date
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.budget import Budget, BudgetCategory
from app.models.category import Category
from app.models.transaction import Transaction, TransactionType
from app.schemas.budget import (
    BudgetCreate,
    BudgetUpdate,
    BudgetResponse,
    BudgetWithProgress
)

router = APIRouter()


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(
    budget_data: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new budget for a category.
    """
    # Create budget
    new_budget = Budget(
        name=f"Budget for {budget_data.start_date.strftime('%B %Y')}",
        month=budget_data.start_date.date(),
        total_amount=budget_data.amount,
        user_id=current_user.id
    )
    
    db.add(new_budget)
    await db.flush()
    
    # Create budget category allocation
    budget_category = BudgetCategory(
        budget_id=new_budget.id,
        category_id=budget_data.category_id,
        allocated_amount=budget_data.amount,
        spent_amount=Decimal("0.00")
    )
    
    db.add(budget_category)
    await db.commit()
    await db.refresh(new_budget)
    
    # Get category name
    category_result = await db.execute(
        select(Category).filter(Category.id == budget_data.category_id)
    )
    category = category_result.scalar_one_or_none()
    
    return BudgetResponse(
        id=new_budget.id,
        category_id=budget_data.category_id,
        amount=budget_data.amount,
        period=budget_data.period,
        start_date=budget_data.start_date,
        end_date=budget_data.end_date,
        user_id=current_user.id,
        category_name=category.name if category else None,
        created_at=new_budget.created_at,
        updated_at=new_budget.updated_at
    )


@router.get("", response_model=List[BudgetWithProgress])
async def get_budgets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all budgets for the current user with progress.
    """
    # Get all budgets for user
    result = await db.execute(
        select(Budget)
        .filter(Budget.user_id == current_user.id)
        .order_by(Budget.month.desc())
    )
    budgets = result.scalars().all()
    
    budget_list = []
    for budget in budgets:
        # Get budget categories
        bc_result = await db.execute(
            select(BudgetCategory)
            .filter(BudgetCategory.budget_id == budget.id)
        )
        budget_categories = bc_result.scalars().all()
        
        for bc in budget_categories:
            # Get category
            cat_result = await db.execute(
                select(Category).filter(Category.id == bc.category_id)
            )
            category = cat_result.scalar_one_or_none()
            
            # Calculate spent amount for this category in this month
            start_of_month = budget.month
            end_of_month = date(start_of_month.year, start_of_month.month + 1 if start_of_month.month < 12 else 1, 1)
            
            spent_result = await db.execute(
                select(func.sum(Transaction.amount))
                .filter(
                    and_(
                        Transaction.user_id == current_user.id,
                        Transaction.category_id == bc.category_id,
                        Transaction.transaction_type == TransactionType.EXPENSE,
                        Transaction.transaction_date >= start_of_month,
                        Transaction.transaction_date < end_of_month
                    )
                )
            )
            spent = spent_result.scalar() or Decimal("0.00")
            
            # Calculate progress
            allocated = bc.allocated_amount
            remaining = allocated - spent
            percentage = float((spent / allocated * 100)) if allocated > 0 else 0.0
            
            # Determine status
            if percentage >= 100:
                status_str = "exceeded"
            elif percentage >= 80:
                status_str = "warning"
            else:
                status_str = "on_track"
            
            budget_list.append(BudgetWithProgress(
                id=budget.id,
                category_id=bc.category_id,
                amount=allocated,
                period="monthly",
                start_date=datetime.combine(budget.month, datetime.min.time()),
                end_date=None,
                user_id=current_user.id,
                category_name=category.name if category else None,
                created_at=budget.created_at,
                updated_at=budget.updated_at,
                spent=spent,
                remaining=remaining,
                percentage=percentage,
                status=status_str
            ))
    
    return budget_list


@router.get("/{budget_id}", response_model=BudgetWithProgress)
async def get_budget(
    budget_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific budget by ID with progress.
    """
    result = await db.execute(
        select(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id)
    )
    budget = result.scalar_one_or_none()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Get first budget category (simplified)
    bc_result = await db.execute(
        select(BudgetCategory).filter(BudgetCategory.budget_id == budget.id).limit(1)
    )
    bc = bc_result.scalar_one_or_none()
    
    if not bc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget category not found"
        )
    
    # Get category
    cat_result = await db.execute(
        select(Category).filter(Category.id == bc.category_id)
    )
    category = cat_result.scalar_one_or_none()
    
    # Calculate spent
    start_of_month = budget.month
    end_of_month = date(start_of_month.year, start_of_month.month + 1 if start_of_month.month < 12 else 1, 1)
    
    spent_result = await db.execute(
        select(func.sum(Transaction.amount))
        .filter(
            and_(
                Transaction.user_id == current_user.id,
                Transaction.category_id == bc.category_id,
                Transaction.transaction_type == TransactionType.EXPENSE,
                Transaction.transaction_date >= start_of_month,
                Transaction.transaction_date < end_of_month
            )
        )
    )
    spent = spent_result.scalar() or Decimal("0.00")
    
    allocated = bc.allocated_amount
    remaining = allocated - spent
    percentage = float((spent / allocated * 100)) if allocated > 0 else 0.0
    
    if percentage >= 100:
        status_str = "exceeded"
    elif percentage >= 80:
        status_str = "warning"
    else:
        status_str = "on_track"
    
    return BudgetWithProgress(
        id=budget.id,
        category_id=bc.category_id,
        amount=allocated,
        period="monthly",
        start_date=datetime.combine(budget.month, datetime.min.time()),
        end_date=None,
        user_id=current_user.id,
        category_name=category.name if category else None,
        created_at=budget.created_at,
        updated_at=budget.updated_at,
        spent=spent,
        remaining=remaining,
        percentage=percentage,
        status=status_str
    )


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    budget_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a budget.
    """
    result = await db.execute(
        select(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id)
    )
    budget = result.scalar_one_or_none()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    await db.delete(budget)
    await db.commit()
