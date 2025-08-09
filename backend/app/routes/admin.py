from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from datetime import datetime, timedelta

from ..core.deps import get_current_admin_user
from ..core.database import get_database
from ..models.user import UserInDB, UserResponse, UserUpdate
from ..models.routine import RoutineResponse

router = APIRouter()

@router.get("/users", response_model=dict)
async def get_all_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    fitness_level: Optional[str] = None,
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Get all users with pagination and filtering - admin only"""
    db = get_database()
    
    # Build query filter
    query = {}
    if search:
        query["$or"] = [
            {"username": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    if fitness_level:
        query["fitness_level"] = fitness_level
    
    # Get total count
    total_count = await db.users.count_documents(query)
    
    # Get paginated users
    skip = (page - 1) * limit
    cursor = db.users.find(query).sort("created_at", -1).skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    
    return {
        "users": [UserResponse(**user) for user in users],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total_count,
            "pages": (total_count + limit - 1) // limit
        }
    }

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_details(
    user_id: str,
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Get detailed user information - admin only"""
    db = get_database()
    
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(**user)

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Update user information - admin only"""
    db = get_database()
    
    # Check if user exists
    existing_user = await db.users.find_one({"_id": user_id})
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user
    update_data = user_update.dict(exclude_unset=True)
    if update_data:
        await db.users.update_one(
            {"_id": user_id},
            {"$set": update_data}
        )
    
    # Return updated user
    updated_user = await db.users.find_one({"_id": user_id})
    return UserResponse(**updated_user)

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Delete user - admin only"""
    db = get_database()
    
    # Check if user exists
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent self-deletion
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Delete user and associated data
    await db.users.delete_one({"_id": user_id})
    await db.routines.delete_many({"user_id": user_id})
    
    return {"message": "User deleted successfully"}

@router.get("/analytics", response_model=dict)
async def get_analytics(current_admin: UserInDB = Depends(get_current_admin_user)):
    """Get platform analytics - admin only"""
    db = get_database()
    
    # Date ranges
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # User analytics
    total_users = await db.users.count_documents({})
    new_users_week = await db.users.count_documents({"created_at": {"$gte": week_ago}})
    new_users_month = await db.users.count_documents({"created_at": {"$gte": month_ago}})
    
    # Routine analytics
    total_routines = await db.routines.count_documents({})
    completed_routines = await db.routines.count_documents({"completed_at": {"$ne": None}})
    routines_week = await db.routines.count_documents({"created_at": {"$gte": week_ago}})
    
    # Active users (completed routine in last 7 days)
    active_users = await db.routines.distinct("user_id", {
        "completed_at": {"$gte": week_ago, "$ne": None}
    })
    
    # Fitness level distribution
    fitness_distribution = []
    for level in ["beginner", "intermediate", "advanced"]:
        count = await db.users.count_documents({"fitness_level": level})
        fitness_distribution.append({"level": level, "count": count})
    
    # Average completion rate
    completion_pipeline = [
        {"$match": {"completed_at": {"$ne": None}}},
        {"$group": {
            "_id": None,
            "avg_completion": {"$avg": {"$divide": ["$completed_blocks", "$total_blocks"]}}
        }}
    ]
    completion_result = await db.routines.aggregate(completion_pipeline).to_list(1)
    avg_completion_rate = completion_result[0]["avg_completion"] if completion_result else 0
    
    return {
        "users": {
            "total": total_users,
            "new_this_week": new_users_week,
            "new_this_month": new_users_month,
            "active_this_week": len(active_users),
            "fitness_distribution": fitness_distribution
        },
        "routines": {
            "total_generated": total_routines,
            "total_completed": completed_routines,
            "completion_rate": round(avg_completion_rate * 100, 1) if avg_completion_rate else 0,
            "generated_this_week": routines_week
        },
        "engagement": {
            "daily_active_users": len(active_users),
            "retention_rate": round((len(active_users) / total_users * 100), 1) if total_users > 0 else 0
        }
    }

@router.get("/routines", response_model=dict)
async def get_all_routines(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: Optional[str] = None,
    completed_only: bool = False,
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Get all routines with filtering - admin only"""
    db = get_database()
    
    # Build query
    query = {}
    if user_id:
        query["user_id"] = user_id
    if completed_only:
        query["completed_at"] = {"$ne": None}
    
    # Get total count
    total_count = await db.routines.count_documents(query)
    
    # Get paginated routines
    skip = (page - 1) * limit
    cursor = db.routines.find(query).sort("created_at", -1).skip(skip).limit(limit)
    routines = await cursor.to_list(length=limit)
    
    return {
        "routines": [RoutineResponse(**routine) for routine in routines],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total_count,
            "pages": (total_count + limit - 1) // limit
        }
    }

@router.post("/broadcast")
async def broadcast_notification(
    message: dict,
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Broadcast notification to all users - admin only"""
    # In a real implementation, this would integrate with push notification service
    return {
        "message": "Broadcast scheduled",
        "recipients": "all_users",
        "content": message
    }