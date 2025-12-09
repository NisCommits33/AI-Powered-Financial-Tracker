from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.account import Account
from app.schemas.account import AccountCreate, AccountUpdate, AccountResponse

router = APIRouter()


@router.post("", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
async def create_account(
    account_data: AccountCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new financial account.
    
    Args:
        account_data: Account creation data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        AccountResponse: Created account data
    """
    new_account = Account(
        name=account_data.name,
        account_type=account_data.account_type,
        balance=account_data.balance,
        currency=account_data.currency,
        description=account_data.description,
        user_id=current_user.id
    )
    
    db.add(new_account)
    await db.commit()
    await db.refresh(new_account)
    
    return new_account


@router.get("", response_model=List[AccountResponse])
async def get_accounts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all accounts for current user.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List[AccountResponse]: List of user's accounts
    """
    result = await db.execute(
        select(Account)
        .filter(Account.user_id == current_user.id)
        .filter(Account.is_active == True)
        .order_by(Account.created_at.desc())
    )
    accounts = result.scalars().all()
    
    return accounts


@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific account by ID.
    
    Args:
        account_id: Account ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        AccountResponse: Account data
        
    Raises:
        HTTPException: If account not found or unauthorized
    """
    result = await db.execute(
        select(Account).filter(Account.id == account_id, Account.user_id == current_user.id)
    )
    account = result.scalar_one_or_none()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    return account


@router.put("/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: int,
    account_data: AccountUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update an account.
    
    Args:
        account_id: Account ID
        account_data: Account update data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        AccountResponse: Updated account data
        
    Raises:
        HTTPException: If account not found or unauthorized
    """
    result = await db.execute(
        select(Account).filter(Account.id == account_id, Account.user_id == current_user.id)
    )
    account = result.scalar_one_or_none()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    # Update fields
    update_data = account_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(account, field, value)
    
    await db.commit()
    await db.refresh(account)
    
    return account


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete an account (soft delete).
    
    Args:
        account_id: Account ID
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If account not found or unauthorized
    """
    result = await db.execute(
        select(Account).filter(Account.id == account_id, Account.user_id == current_user.id)
    )
    account = result.scalar_one_or_none()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    # Soft delete
    account.is_active = False
    await db.commit()
