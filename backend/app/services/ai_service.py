from openai import AsyncOpenAI
import os
import json
import asyncio
from typing import Dict, List, Optional
from datetime import datetime
import uuid

class RoutineGenerator:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        self.client = AsyncOpenAI(api_key=api_key)
        
    async def generate_daily_routine(self, user_profile: Dict) -> Dict:
        """Generate a personalized daily routine using GPT-4o"""
        
        # Build the prompt based on user preferences
        prompt = self._build_routine_prompt(user_profile)
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are Master Lee, a wise Tai Chi instructor and wellness coach. Generate personalized wellness routines combining Tai Chi, breathwork, and bodyweight exercises. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            routine_data = json.loads(response.choices[0].message.content)
            
            # Add metadata
            routine_data["routine_id"] = str(uuid.uuid4())
            routine_data["generated_at"] = datetime.utcnow().isoformat()
            routine_data["user_preferences"] = user_profile
            
            return routine_data
            
        except Exception as e:
            print(f"Error generating routine: {e}")
            return self._get_fallback_routine(user_profile)
    
    def _build_routine_prompt(self, user_profile: Dict) -> str:
        """Build the AI prompt based on user preferences"""
        
        fitness_level = user_profile.get("fitness_level", "beginner")
        duration = user_profile.get("duration", 15)
        focus_areas = user_profile.get("focus_areas", ["flexibility", "mindfulness"])
        language = user_profile.get("language", "en")
        
        focus_text = ", ".join(focus_areas)
        
        prompt = f"""
        Create a personalized {duration}-minute wellness routine for a {fitness_level} practitioner.
        
        Focus areas: {focus_text}
        Language preference: {language}
        
        Structure the routine with these three modules:
        1. ChiZen Move (Tai Chi sequences) - 40% of time
        2. ChiZen Mind (Breathwork exercises) - 30% of time  
        3. ChiZen Core (Bodyweight strength/mobility) - 30% of time
        
        Return this exact JSON structure:
        {{
            "title": "Today's Mindful Movement",
            "total_duration": {duration},
            "focus_area": "primary focus based on preferences",
            "difficulty_level": 1-5,
            "blocks": [
                {{
                    "type": "move|mind|core",
                    "name": "Exercise name",
                    "duration_seconds": 180,
                    "instructions": ["Step 1", "Step 2", "Step 3"],
                    "difficulty": 1-5,
                    "audio_cue": "Master Lee guidance text",
                    "benefits": ["Benefit 1", "Benefit 2"]
                }}
            ],
            "completion_xp": 50-100,
            "daily_wisdom": "Inspirational quote from Master Lee"
        }}
        
        Make it appropriate for {fitness_level} level with {duration} minutes total duration.
        Ensure audio_cue contains natural, encouraging guidance from Master Lee.
        """
        
        return prompt
    
    def _get_fallback_routine(self, user_profile: Dict) -> Dict:
        """Fallback routine if AI generation fails"""
        
        duration = user_profile.get("duration", 15)
        
        return {
            "routine_id": str(uuid.uuid4()),
            "title": "Essential Wellness Flow",
            "total_duration": duration,
            "focus_area": "Balance and Mindfulness",
            "difficulty_level": 2,
            "blocks": [
                {
                    "type": "mind",
                    "name": "Centering Breath",
                    "duration_seconds": 180,
                    "instructions": [
                        "Sit comfortably with spine straight",
                        "Close your eyes and breathe naturally",
                        "Focus on your breath for 3 minutes"
                    ],
                    "difficulty": 1,
                    "audio_cue": "Welcome to your practice. Let's begin by finding your center through mindful breathing.",
                    "benefits": ["Reduces stress", "Improves focus"]
                },
                {
                    "type": "move",
                    "name": "Flowing Water",
                    "duration_seconds": 420,
                    "instructions": [
                        "Stand with feet shoulder-width apart",
                        "Raise arms slowly like flowing water",
                        "Move with smooth, continuous motion",
                        "Focus on breath and movement harmony"
                    ],
                    "difficulty": 2,
                    "audio_cue": "Move like water, smooth and continuous. Let your body flow with natural grace.",
                    "benefits": ["Improves flexibility", "Enhances coordination"]
                },
                {
                    "type": "core",
                    "name": "Gentle Strength",
                    "duration_seconds": 300,
                    "instructions": [
                        "Modified plank against wall",
                        "Hold for 30 seconds, rest 30 seconds",
                        "Repeat 5 times with mindful breathing"
                    ],
                    "difficulty": 2,
                    "audio_cue": "Build strength from your center. Breathe deeply and hold with intention.",
                    "benefits": ["Strengthens core", "Improves posture"]
                }
            ],
            "completion_xp": 75,
            "daily_wisdom": "The journey of a thousand miles begins with a single step. Today, you take that step.",
            "generated_at": datetime.utcnow().isoformat()
        }