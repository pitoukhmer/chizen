from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timedelta
import redis.asyncio as redis
import json

from ..core.deps import get_current_user
from ..core.database import get_database, get_redis
from ..models.user import UserInDB
from ..models.routine import RoutineInDB, RoutineComplete, RoutineResponse
from ..services.ai_service import RoutineGenerator

router = APIRouter()

@router.get("/today", response_model=dict)
async def get_daily_routine(current_user: UserInDB = Depends(get_current_user)):
    """Get today's personalized routine"""
    db = get_database()
    today = datetime.utcnow().date().isoformat()
    
    # Check if user already has a routine for today
    existing_routine = await db.routines.find_one({
        "user_id": current_user.id,
        "created_at": {
            "$gte": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0),
            "$lt": datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)
        }
    })
    
    if existing_routine:
        return {
            "routine": RoutineResponse(**existing_routine),
            "is_completed": existing_routine.get("completed_at") is not None,
            "source": "existing"
        }
    
    # Check Redis cache first
    redis_client = get_redis()
    if redis_client:
        cached_routine = await redis_client.get(f"routine:{current_user.id}:{today}")
        if cached_routine:
            routine_data = json.loads(cached_routine)
            return {
                "routine": routine_data,
                "is_completed": False,
                "source": "cached"
            }
    
    # Generate new routine
    generator = RoutineGenerator()
    
    # Handle preferences as dict (demo mode) or model (real user)
    prefs = current_user.preferences
    if isinstance(prefs, dict):
        user_profile = {
            "fitness_level": current_user.fitness_level,
            "duration": prefs.get("duration", 15),
            "focus_areas": prefs.get("focus_areas", ["flexibility", "mindfulness"]),
            "language": prefs.get("language", "en")
        }
    else:
        user_profile = {
            "fitness_level": current_user.fitness_level,
            "duration": prefs.duration,
            "focus_areas": prefs.focus_areas,
            "language": prefs.language
        }
    
    routine_data = await generator.generate_daily_routine(user_profile)
    
    # Save to database
    routine_doc = RoutineInDB(
        **routine_data,
        user_id=current_user.id
    )
    
    await db.routines.insert_one(routine_doc.dict(by_alias=True))
    
    # Cache for 1 hour
    if redis_client:
        await redis_client.setex(
            f"routine:{current_user.id}:{today}",
            3600,
            json.dumps(routine_data, default=str)
        )
    
    return {
        "routine": RoutineResponse(**routine_data),
        "is_completed": False,
        "source": "generated"
    }

@router.post("/generate", response_model=dict)
async def generate_new_routine(current_user: UserInDB = Depends(get_current_user)):
    """Force generate a new routine using AI"""
    try:
        generator = RoutineGenerator()
        
        # Handle preferences as dict (demo mode) or model (real user)
        prefs = current_user.preferences
        if isinstance(prefs, dict):
            user_profile = {
                "fitness_level": current_user.fitness_level,
                "duration": prefs.get("duration", 15),
                "focus_areas": prefs.get("focus_areas", ["flexibility", "mindfulness"]),
                "language": prefs.get("language", "en")
            }
        else:
            user_profile = {
                "fitness_level": current_user.fitness_level,
                "duration": prefs.duration,
                "focus_areas": prefs.focus_areas,
                "language": prefs.language
            }
        
        # Generate routine using OpenAI
        routine_data = await generator.generate_daily_routine(user_profile)
        
        return {
            "success": True,
            "routine": routine_data,
            "message": "New AI routine generated successfully using OpenAI!"
        }
        
    except Exception as e:
        # Return fallback on any error
        return {
            "success": False,
            "routine": {
                "title": "Demo Wellness Flow",
                "total_duration": 15,
                "focus_area": "Balance & Mindfulness",
                "difficulty_level": 2,
                "blocks": [
                    {
                        "type": "mind",
                        "name": "Centering Breath",
                        "duration_seconds": 300,
                        "instructions": ["Sit comfortably", "Breathe deeply", "Focus on your breath"],
                        "difficulty": 1,
                        "audio_cue": "Welcome to your practice. Let's begin by finding your center.",
                        "benefits": ["Reduces stress", "Improves focus"]
                    },
                    {
                        "type": "move",
                        "name": "Gentle Flow",
                        "duration_seconds": 600,
                        "instructions": ["Move slowly", "Focus on balance", "Breathe with movement"],
                        "difficulty": 2,
                        "audio_cue": "Move like water, smooth and continuous.",
                        "benefits": ["Improves flexibility", "Enhances coordination"]
                    }
                ],
                "completion_xp": 75,
                "daily_wisdom": "Every step forward is progress, no matter how small."
            },
            "message": f"Using demo routine (OpenAI error: {str(e)})"
        }

@router.post("/complete", response_model=dict)
async def complete_routine(
    completion_data: RoutineComplete,
    current_user: UserInDB = Depends(get_current_user)
):
    """Mark routine as completed and update user progress"""
    db = get_database()
    
    # Find the routine
    routine = await db.routines.find_one({"routine_id": completion_data.routine_id})
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found"
        )
    
    # Calculate XP based on completion
    completion_rate = completion_data.completed_blocks / completion_data.total_blocks
    base_xp = routine.get("completion_xp", 50)
    earned_xp = int(base_xp * completion_rate)
    
    # Update routine completion
    await db.routines.update_one(
        {"routine_id": completion_data.routine_id},
        {
            "$set": {
                "completed_at": datetime.utcnow(),
                "feedback_rating": completion_data.feedback_rating,
                "feedback_comment": completion_data.feedback_comment,
                "xp_earned": earned_xp
            }
        }
    )
    
    # Update user progress
    await update_user_progress(db, current_user.id, earned_xp, completion_rate >= 0.8)
    
    return {
        "message": "Routine completed successfully",
        "xp_earned": earned_xp,
        "completion_rate": completion_rate
    }

async def update_user_progress(db, user_id: str, xp_earned: int, is_complete: bool):
    """Update user's progress, streaks, and XP"""
    
    # Get current user data
    user = await db.users.find_one({"_id": user_id})
    if not user:
        return
    
    # Update total XP
    new_total_xp = user.get("total_xp", 0) + xp_earned
    
    # Update streak data
    streak_data = user.get("streak_data", {"current": 0, "longest": 0, "last_completed": None})
    today = datetime.utcnow().date()
    
    if is_complete:
        last_completed = streak_data.get("last_completed")
        if last_completed:
            last_date = last_completed.date() if isinstance(last_completed, datetime) else datetime.fromisoformat(last_completed).date()
            
            if today == last_date:
                # Already completed today, no streak change
                pass
            elif today == last_date + timedelta(days=1):
                # Consecutive day, increment streak
                streak_data["current"] += 1
                streak_data["last_completed"] = datetime.utcnow()
            else:
                # Streak broken, reset
                streak_data["current"] = 1
                streak_data["last_completed"] = datetime.utcnow()
        else:
            # First completion
            streak_data["current"] = 1
            streak_data["last_completed"] = datetime.utcnow()
        
        # Update longest streak
        if streak_data["current"] > streak_data.get("longest", 0):
            streak_data["longest"] = streak_data["current"]
    
    # Update user document
    await db.users.update_one(
        {"_id": user_id},
        {
            "$set": {
                "total_xp": new_total_xp,
                "streak_data": streak_data,
                "last_active": datetime.utcnow()
            }
        }
    )

@router.get("/history", response_model=list)
async def get_routine_history(
    limit: int = 10,
    current_user: UserInDB = Depends(get_current_user)
):
    """Get user's routine history"""
    db = get_database()
    
    cursor = db.routines.find({"user_id": current_user.id}).sort("created_at", -1).limit(limit)
    routines = await cursor.to_list(length=limit)
    
    return [RoutineResponse(**routine) for routine in routines]