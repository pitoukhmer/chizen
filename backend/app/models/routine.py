from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class RoutineType(str, Enum):
    move = "move"      # Tai Chi sequences
    mind = "mind"      # Breathwork exercises  
    core = "core"      # Mobility and strength

class ExerciseBlock(BaseModel):
    type: RoutineType
    name: str
    duration_seconds: int
    instructions: List[str]
    difficulty: int = Field(ge=1, le=5)
    audio_cue: Optional[str] = None
    audio_url: Optional[str] = None
    image_url: Optional[str] = None

class RoutineBase(BaseModel):
    routine_id: str
    blocks: List[ExerciseBlock]
    total_duration: int  # minutes
    focus_area: str
    difficulty_level: int = Field(ge=1, le=5)

class RoutineCreate(RoutineBase):
    user_id: str

class RoutineInDB(RoutineBase):
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    feedback_rating: Optional[int] = Field(None, ge=1, le=5)
    feedback_comment: Optional[str] = None
    xp_earned: int = 0
    
    class Config:
        allow_population_by_field_name = True

class RoutineComplete(BaseModel):
    routine_id: str
    completed_blocks: int
    total_blocks: int
    feedback_rating: Optional[int] = Field(None, ge=1, le=5)
    feedback_comment: Optional[str] = None

class RoutineResponse(RoutineBase):
    id: str
    created_at: datetime
    completed_at: Optional[datetime]
    xp_earned: int