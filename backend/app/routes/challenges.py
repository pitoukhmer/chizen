from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel

from ..core.deps import get_current_user
from ..core.database import get_database
from ..models.user import UserInDB

router = APIRouter()

class ChallengeCreate(BaseModel):
    name: str
    description: str
    duration_days: int
    category: str
    difficulty: int
    xp_reward: int

class ChallengeJoin(BaseModel):
    challenge_id: str

class ChallengeProgress(BaseModel):
    challenge_id: str
    day: int
    completed: bool

# Predefined challenges
PREDEFINED_CHALLENGES = [
    {
        "id": "7-day-mindful-start",
        "name": "7-Day Mindful Start",
        "description": "Begin your wellness journey with 7 days of consistent practice",
        "duration_days": 7,
        "category": "beginner",
        "difficulty": 1,
        "xp_reward": 200,
        "icon": "🌱",
        "color": "green",
        "goals": [
            "Complete daily 15-minute routine",
            "Practice mindful breathing",
            "Build a consistent habit"
        ],
        "benefits": ["Stress reduction", "Better sleep", "Increased focus"],
        "active": True
    },
    {
        "id": "14-day-balance-builder",
        "name": "14-Day Balance Builder", 
        "description": "Strengthen your body and mind with 2 weeks of Tai Chi movements",
        "duration_days": 14,
        "category": "intermediate",
        "difficulty": 2,
        "xp_reward": 500,
        "icon": "⚖️",
        "color": "blue",
        "goals": [
            "Master 5 Tai Chi movements",
            "Improve balance and coordination",
            "Complete longer 20-minute routines"
        ],
        "benefits": ["Better balance", "Core strength", "Mental clarity"],
        "active": True
    },
    {
        "id": "30-day-wellness-warrior",
        "name": "30-Day Wellness Warrior",
        "description": "Transform your life with a month-long commitment to holistic wellness",
        "duration_days": 30,
        "category": "advanced",
        "difficulty": 3,
        "xp_reward": 1500,
        "icon": "🏆",
        "color": "purple",
        "goals": [
            "Complete 30 days of practice",
            "Achieve multiple difficulty levels",
            "Master mind-body connection"
        ],
        "benefits": ["Life transformation", "Peak performance", "Inner mastery"],
        "active": True
    },
    {
        "id": "weekend-warrior",
        "name": "Weekend Warrior",
        "description": "Perfect for busy schedules - practice only on weekends",
        "duration_days": 8,
        "category": "flexible",
        "difficulty": 1,
        "xp_reward": 150,
        "icon": "🗓️",
        "color": "orange",
        "goals": [
            "Practice every Saturday and Sunday",
            "Maintain consistency over 4 weeks",
            "Build sustainable habits"
        ],
        "benefits": ["Work-life balance", "Stress relief", "Weekend mindfulness"],
        "active": True
    }
]

@router.get("/", response_model=dict)
async def get_available_challenges(current_user: UserInDB = Depends(get_current_user)):
    """Get all available challenges"""
    
    db = get_database()
    user_id = getattr(current_user, 'id', None) or getattr(current_user, '_id', 'demo-user')
    
    # Get user's active challenges
    user_challenges_cursor = db.user_challenges.find({"user_id": user_id, "active": True})
    user_challenges = await user_challenges_cursor.to_list(length=100)
    user_challenge_ids = [uc["challenge_id"] for uc in user_challenges]
    
    # Add status to each challenge
    challenges_with_status = []
    for challenge in PREDEFINED_CHALLENGES:
        if not challenge["active"]:
            continue
            
        challenge_copy = challenge.copy()
        
        if challenge["id"] in user_challenge_ids:
            # Get progress for joined challenge
            user_challenge = next(uc for uc in user_challenges if uc["challenge_id"] == challenge["id"])
            completed_days = len(user_challenge.get("progress", []))
            
            challenge_copy["status"] = "joined"
            challenge_copy["progress"] = {
                "completed_days": completed_days,
                "total_days": challenge["duration_days"],
                "percentage": (completed_days / challenge["duration_days"]) * 100,
                "current_streak": user_challenge.get("current_streak", 0),
                "joined_date": user_challenge.get("joined_date"),
                "is_completed": completed_days >= challenge["duration_days"]
            }
        else:
            challenge_copy["status"] = "available"
            challenge_copy["participants_count"] = await db.user_challenges.count_documents({
                "challenge_id": challenge["id"],
                "active": True
            })
            
        challenges_with_status.append(challenge_copy)
    
    return {
        "success": True,
        "challenges": challenges_with_status,
        "total": len(challenges_with_status)
    }

@router.post("/join", response_model=dict)
async def join_challenge(
    join_request: ChallengeJoin,
    current_user: UserInDB = Depends(get_current_user)
):
    """Join a challenge"""
    
    db = get_database()
    user_id = getattr(current_user, 'id', None) or getattr(current_user, '_id', 'demo-user')
    
    # Check if challenge exists
    challenge = next((c for c in PREDEFINED_CHALLENGES if c["id"] == join_request.challenge_id), None)
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    
    # Check if user already joined
    existing = await db.user_challenges.find_one({
        "user_id": user_id,
        "challenge_id": join_request.challenge_id,
        "active": True
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already joined this challenge"
        )
    
    # Create user challenge record
    user_challenge = {
        "user_id": user_id,
        "challenge_id": join_request.challenge_id,
        "challenge_name": challenge["name"],
        "joined_date": datetime.utcnow(),
        "progress": [],
        "current_streak": 0,
        "active": True,
        "completed": False
    }
    
    await db.user_challenges.insert_one(user_challenge)
    
    return {
        "success": True,
        "message": f"Successfully joined {challenge['name']}!",
        "challenge": challenge
    }

@router.post("/progress", response_model=dict)
async def update_challenge_progress(
    progress: ChallengeProgress,
    current_user: UserInDB = Depends(get_current_user)
):
    """Update progress for a challenge"""
    
    db = get_database()
    user_id = getattr(current_user, 'id', None) or getattr(current_user, '_id', 'demo-user')
    
    # Find user's challenge
    user_challenge = await db.user_challenges.find_one({
        "user_id": user_id,
        "challenge_id": progress.challenge_id,
        "active": True
    })
    
    if not user_challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found or not joined"
        )
    
    # Update progress
    progress_list = user_challenge.get("progress", [])
    
    # Find or create day entry
    day_entry = next((p for p in progress_list if p["day"] == progress.day), None)
    if day_entry:
        day_entry["completed"] = progress.completed
        day_entry["updated_at"] = datetime.utcnow()
    else:
        progress_list.append({
            "day": progress.day,
            "completed": progress.completed,
            "completed_at": datetime.utcnow() if progress.completed else None,
            "updated_at": datetime.utcnow()
        })
    
    # Calculate streak
    current_streak = 0
    if progress.completed:
        # Count consecutive completed days from the end
        sorted_progress = sorted([p for p in progress_list if p["completed"]], key=lambda x: x["day"], reverse=True)
        
        for i, p in enumerate(sorted_progress):
            if i == 0 or p["day"] == sorted_progress[i-1]["day"] - 1:
                current_streak += 1
            else:
                break
    
    # Check if challenge completed
    challenge_info = next((c for c in PREDEFINED_CHALLENGES if c["id"] == progress.challenge_id), None)
    completed_days = len([p for p in progress_list if p["completed"]])
    is_completed = completed_days >= challenge_info["duration_days"] if challenge_info else False
    
    # Update database
    update_data = {
        "progress": progress_list,
        "current_streak": current_streak,
        "completed": is_completed,
        "updated_at": datetime.utcnow()
    }
    
    if is_completed and not user_challenge.get("completed"):
        update_data["completed_at"] = datetime.utcnow()
        
        # Award XP for completion
        xp_reward = challenge_info["xp_reward"] if challenge_info else 100
        await db.users.update_one(
            {"_id" if "_id" in str(user_id) else "id": user_id},
            {"$inc": {"total_xp": xp_reward}}
        )
        
        message = f"🎉 Challenge completed! +{xp_reward} XP earned!"
    else:
        message = "Progress updated successfully!"
    
    await db.user_challenges.update_one(
        {"_id": user_challenge["_id"]},
        {"$set": update_data}
    )
    
    return {
        "success": True,
        "message": message,
        "progress": {
            "completed_days": completed_days,
            "total_days": challenge_info["duration_days"] if challenge_info else 0,
            "current_streak": current_streak,
            "is_completed": is_completed
        }
    }

@router.get("/my-challenges", response_model=dict)
async def get_my_challenges(current_user: UserInDB = Depends(get_current_user)):
    """Get user's active challenges"""
    
    db = get_database()
    user_id = getattr(current_user, 'id', None) or getattr(current_user, '_id', 'demo-user')
    
    user_challenges_cursor = db.user_challenges.find({
        "user_id": user_id,
        "active": True
    }).sort("joined_date", -1)
    
    user_challenges = await user_challenges_cursor.to_list(length=100)
    
    # Enhance with challenge info
    enhanced_challenges = []
    for uc in user_challenges:
        challenge_info = next((c for c in PREDEFINED_CHALLENGES if c["id"] == uc["challenge_id"]), None)
        if challenge_info:
            completed_days = len([p for p in uc.get("progress", []) if p["completed"]])
            
            enhanced_challenges.append({
                **challenge_info,
                "user_progress": {
                    "completed_days": completed_days,
                    "total_days": challenge_info["duration_days"],
                    "percentage": (completed_days / challenge_info["duration_days"]) * 100,
                    "current_streak": uc.get("current_streak", 0),
                    "joined_date": uc["joined_date"],
                    "is_completed": uc.get("completed", False),
                    "progress_details": uc.get("progress", [])
                }
            })
    
    return {
        "success": True,
        "challenges": enhanced_challenges,
        "total": len(enhanced_challenges)
    }

@router.get("/leaderboard/{challenge_id}", response_model=dict)
async def get_challenge_leaderboard(
    challenge_id: str,
    limit: int = 50,
    current_user: UserInDB = Depends(get_current_user)
):
    """Get leaderboard for a specific challenge"""
    
    db = get_database()
    
    # Get all participants for this challenge
    participants_cursor = db.user_challenges.find({
        "challenge_id": challenge_id,
        "active": True
    })
    
    participants = await participants_cursor.to_list(length=1000)
    
    # Calculate rankings
    leaderboard = []
    for participant in participants:
        # Get user info
        user_data = await db.users.find_one({"_id": participant["user_id"]})
        if not user_data:
            continue
            
        completed_days = len([p for p in participant.get("progress", []) if p["completed"]])
        
        leaderboard.append({
            "user_id": participant["user_id"],
            "username": user_data.get("username", "Anonymous"),
            "completed_days": completed_days,
            "current_streak": participant.get("current_streak", 0),
            "completion_percentage": (completed_days / 30) * 100,  # Assuming 30 days max
            "joined_date": participant["joined_date"],
            "is_completed": participant.get("completed", False)
        })
    
    # Sort by completed days, then by streak, then by join date
    leaderboard.sort(key=lambda x: (
        -x["completed_days"],
        -x["current_streak"], 
        x["joined_date"]
    ))
    
    # Add rankings
    for i, entry in enumerate(leaderboard[:limit]):
        entry["rank"] = i + 1
    
    return {
        "success": True,
        "leaderboard": leaderboard[:limit],
        "total_participants": len(participants),
        "challenge_id": challenge_id
    }