from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter()


@router.get("", response_model=List[CategoryResponse])
async def get_categories(
    db: AsyncSession = Depends(get_db)
):
    """
    Get all categories (default and custom).
    
    Args:
        db: Database session
        
    Returns:
        List[CategoryResponse]: List of all categories
    """
    result = await db.execute(
        select(Category).order_by(Category.is_default.desc(), Category.name)
    )
    categories = result.scalars().all()
    
    return categories


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new custom category.
    
    Args:
        category_data: Category creation data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        CategoryResponse: Created category data
        
    Raises:
        HTTPException: If category name already exists
    """
    # Check if category name already exists
    result = await db.execute(
        select(Category).filter(Category.name == category_data.name)
    )
    existing_category = result.scalar_one_or_none()
    
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category name already exists"
        )
    
    new_category = Category(
        name=category_data.name,
        description=category_data.description,
        icon=category_data.icon,
        color=category_data.color,
        is_default=False
    )
    
    db.add(new_category)
    await db.commit()
    await db.refresh(new_category)
    
    return new_category


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a category (only custom categories can be updated).
    
    Args:
        category_id: Category ID
        category_data: Category update data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        CategoryResponse: Updated category data
        
    Raises:
        HTTPException: If category not found or is a default category
    """
    result = await db.execute(
        select(Category).filter(Category.id == category_id)
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    if category.is_default:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update default categories"
        )
    
    # Update fields
    update_data = category_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    await db.commit()
    await db.refresh(category)
    
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a category (only custom categories can be deleted).
    
    Args:
        category_id: Category ID
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If category not found or is a default category
    """
    result = await db.execute(
        select(Category).filter(Category.id == category_id)
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    if category.is_default:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete default categories"
        )
    
    await db.delete(category)
    await db.commit()
