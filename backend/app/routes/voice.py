from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from ..core.deps import get_current_user
from ..models.user import UserInDB
from ..services.voice_service import VoiceService

router = APIRouter()

class VoiceGenerationRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    stability: Optional[float] = 0.5
    similarity_boost: Optional[float] = 0.7

class VoiceGenerationResponse(BaseModel):
    audio_url: str
    voice_id: str
    text: str

@router.post("/generate", response_model=dict)
async def generate_voice(
    request: VoiceGenerationRequest,
    current_user: UserInDB = Depends(get_current_user)
):
    """Generate voice audio using ElevenLabs"""
    try:
        voice_service = VoiceService()
        
        # Generate audio for the provided text
        audio_urls = await voice_service.generate_audio_cues([request.text])
        
        if not audio_urls or not audio_urls[0]:
            raise HTTPException(
                status_code=500, 
                detail="Failed to generate voice audio"
            )
        
        return {
            "success": True,
            "audio_url": audio_urls[0],
            "voice_id": request.voice_id or "master-lee",
            "text": request.text,
            "message": "Voice generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Voice generation failed: {str(e)}"
        )

@router.post("/batch-generate", response_model=dict)
async def generate_batch_voice(
    texts: List[str],
    current_user: UserInDB = Depends(get_current_user)
):
    """Generate multiple voice audio files"""
    try:
        voice_service = VoiceService()
        
        # Generate audio for all texts
        audio_urls = await voice_service.generate_audio_cues(texts)
        
        return {
            "success": True,
            "audio_urls": audio_urls,
            "count": len(audio_urls),
            "message": f"Generated {len(audio_urls)} voice files successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Batch voice generation failed: {str(e)}"
        )

@router.get("/voices", response_model=dict)
async def get_available_voices(current_user: UserInDB = Depends(get_current_user)):
    """Get list of available voices"""
    return {
        "success": True,
        "voices": [
            {
                "id": "master-lee",
                "name": "Master Lee",
                "description": "Calm and wise Tai Chi instructor voice",
                "language": "en"
            }
        ],
        "message": "Available voices retrieved successfully"
    }