from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class FitnessLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

class Language(str, Enum):
    english = "en"
    khmer = "km" 
    thai = "th"

class UserPreferences(BaseModel):
    duration: int = Field(default=15, ge=5, le=30)  # minutes
    focus_areas: List[str] = Field(default=["strength", "flexibility", "mindfulness"])
    language: Language = Language.english

class StreakData(BaseModel):
    current: int = 0
    longest: int = 0
    last_completed: Optional[datetime] = None

class UserBase(BaseModel):
    email: EmailStr
    username: str
    fitness_level: FitnessLevel = FitnessLevel.beginner
    preferences: UserPreferences = UserPreferences()

class UserCreate(UserBase):
    password: Optional[str] = None  # Optional for OAuth users
    
class UserUpdate(BaseModel):
    username: Optional[str] = None
    fitness_level: Optional[FitnessLevel] = None
    preferences: Optional[UserPreferences] = None

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    hashed_password: Optional[str] = None
    streak_data: StreakData = StreakData()
    total_xp: int = 0
    is_admin: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_active: Optional[datetime] = None
    oauth_provider: Optional[str] = None  # google, apple, etc.
    
    class Config:
        allow_population_by_field_name = True

class UserResponse(UserBase):
    id: str
    streak_data: StreakData
    total_xp: int
    is_admin: bool
    created_at: datetime
    last_active: Optional[datetime]