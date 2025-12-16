from typing import List, Optional, Any
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.transaction import Transaction, TransactionType
from app.models.account import Account
from app.models.category import Category
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionWithDetails
)
from app.schemas.common import PaginatedResponse

router = APIRouter()


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new transaction.
    
    Args:
        transaction_data: Transaction creation data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        TransactionResponse: Created transaction data
        
    Raises:
        HTTPException: If account not found or unauthorized
    """
    # Verify account belongs to user
    result = await db.execute(
        select(Account).filter(
            Account.id == transaction_data.account_id,
            Account.user_id == current_user.id
        )
    )
    account = result.scalar_one_or_none()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    # Create transaction
    new_transaction = Transaction(
        amount=transaction_data.amount,
        transaction_type=transaction_data.transaction_type,
        description=transaction_data.description,
        transaction_date=transaction_data.transaction_date,
        notes=transaction_data.notes,
        category_id=transaction_data.category_id,
        account_id=transaction_data.account_id,
        user_id=current_user.id
    )
    
    # Update account balance
    if transaction_data.transaction_type == TransactionType.INCOME:
        account.balance += transaction_data.amount
    else:  # EXPENSE
        account.balance -= transaction_data.amount
    
    db.add(new_transaction)
    await db.commit()
    await db.refresh(new_transaction)
    
    return new_transaction


@router.get("", response_model=PaginatedResponse[TransactionWithDetails])
async def get_transactions(
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    transaction_type: Optional[TransactionType] = None,
    category_id: Optional[int] = None,
    account_id: Optional[int] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get transactions with filtering and pagination.
    
    Args:
        page: Page number
        size: Items per page
        start_date: Filter by start date
        end_date: Filter by end date
        transaction_type: Filter by transaction type
        category_id: Filter by category
        account_id: Filter by account
        min_amount: Filter by minimum amount
        max_amount: Filter by maximum amount
        search: Search term for description or notes
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        PaginatedResponse: Paginated transaction list
    """
    # Build query
    query = select(Transaction).filter(Transaction.user_id == current_user.id)
    
    # Apply filters
    if start_date:
        query = query.filter(Transaction.transaction_date >= start_date)
    if end_date:
        query = query.filter(Transaction.transaction_date <= end_date)
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if account_id:
        query = query.filter(Transaction.account_id == account_id)
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Transaction.description.ilike(search_term),
                Transaction.notes.ilike(search_term)
            )
        )
    
    # Get total count
    count_query = select(func.count()).select_from(query.alias())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    query = query.order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
    query = query.offset((page - 1) * size).limit(size)
    
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    # Enrich with account and category names
    transactions_with_details = []
    for transaction in transactions:
        # Get account name
        account_result = await db.execute(
            select(Account.name).filter(Account.id == transaction.account_id)
        )
        account_name = account_result.scalar_one_or_none()
        
        # Get category name
        category_name = None
        if transaction.category_id:
            category_result = await db.execute(
                select(Category.name).filter(Category.id == transaction.category_id)
            )
            category_name = category_result.scalar_one_or_none()
        
        transaction_dict = {
            **transaction.__dict__,
            "account_name": account_name,
            "category_name": category_name
        }
        transactions_with_details.append(TransactionWithDetails(**transaction_dict))
    
    return PaginatedResponse(
        items=transactions_with_details,
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size
    )


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific transaction by ID.
    
    Args:
        transaction_id: Transaction ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        TransactionResponse: Transaction data
        
    Raises:
        HTTPException: If transaction not found or unauthorized
    """
    result = await db.execute(
        select(Transaction).filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return transaction


@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction_data: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a transaction.
    
    Args:
        transaction_id: Transaction ID
        transaction_data: Transaction update data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        TransactionResponse: Updated transaction data
        
    Raises:
        HTTPException: If transaction not found or unauthorized
    """
    result = await db.execute(
        select(Transaction).filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Get old amount and type for balance adjustment
    old_amount = transaction.amount
    old_type = transaction.transaction_type
    old_account_id = transaction.account_id
    
    # Update fields
    update_data = transaction_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transaction, field, value)
    
    # Adjust account balances
    # Revert old transaction effect
    old_account_result = await db.execute(
        select(Account).filter(Account.id == old_account_id)
    )
    old_account = old_account_result.scalar_one()
    
    if old_type == TransactionType.INCOME:
        old_account.balance -= old_amount
    else:
        old_account.balance += old_amount
    
    # Apply new transaction effect
    new_account_result = await db.execute(
        select(Account).filter(Account.id == transaction.account_id)
    )
    new_account = new_account_result.scalar_one()
    
    if transaction.transaction_type == TransactionType.INCOME:
        new_account.balance += transaction.amount
    else:
        new_account.balance -= transaction.amount
    
    await db.commit()
    await db.refresh(transaction)
    
    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a transaction.
    
    Args:
        transaction_id: Transaction ID
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If transaction not found or unauthorized
    """
    result = await db.execute(
        select(Transaction).filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Revert balance change
    account_result = await db.execute(
        select(Account).filter(Account.id == transaction.account_id)
    )
    account = account_result.scalar_one()
    
    if transaction.transaction_type == TransactionType.INCOME:
        account.balance -= transaction.amount
    else:
        account.balance += transaction.amount
    
    await db.delete(transaction)
    await db.commit()


@router.get("/export", response_model=Any)
async def export_transactions(
    format: str = Query(..., regex="^(csv|json)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Export transactions to CSV or JSON.
    """
    result = await db.execute(
        select(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.transaction_date.desc())
    )
    transactions = result.scalars().all()

    if format == 'json':
        return [
            {
                "id": t.id,
                "date": t.transaction_date.isoformat(),
                "amount": float(t.amount),
                "type": t.transaction_type,
                "description": t.description,
                "category_id": t.category_id,
                "account_id": t.account_id
            }
            for t in transactions
        ]
    
    # CSV Format
    import csv
    import io
    from fastapi.responses import StreamingResponse
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Date', 'Amount', 'Type', 'Description', 'Category ID', 'Account ID'])
    
    for t in transactions:
        writer.writerow([
            t.transaction_date,
            t.amount,
            t.transaction_type,
            t.description,
            t.category_id,
            t.account_id
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"}
    )
