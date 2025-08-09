import aiohttp
import asyncio
import os
from typing import List, Dict
import uuid
import tempfile

class VoiceService:
    def __init__(self):
        self.api_key = os.getenv("ELEVEN_LABS_KEY")
        self.voice_id = os.getenv("MASTER_LEE_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Default voice
        self.base_url = "https://api.elevenlabs.io/v1"
        
    async def generate_audio_cues(self, instructions: List[str]) -> List[str]:
        """Generate audio files for exercise instructions"""
        if not self.api_key:
            # Return empty URLs if no API key (for development)
            return [""] * len(instructions)
            
        audio_urls = []
        
        async with aiohttp.ClientSession() as session:
            for instruction in instructions:
                try:
                    audio_url = await self._generate_single_audio(session, instruction)
                    audio_urls.append(audio_url)
                except Exception as e:
                    print(f"Error generating audio for instruction '{instruction}': {e}")
                    audio_urls.append("")  # Empty URL on error
                    
        return audio_urls
    
    async def _generate_single_audio(self, session: aiohttp.ClientSession, text: str) -> str:
        """Generate a single audio file and return URL"""
        
        # Generate audio via ElevenLabs API
        async with session.post(
            f"{self.base_url}/text-to-speech/{self.voice_id}",
            headers={
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.api_key
            },
            json={
                "text": text,
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {
                    "stability": 0.75,
                    "similarity_boost": 0.75,
                    "style": 0.0,
                    "use_speaker_boost": True
                }
            }
        ) as response:
            if response.status == 200:
                audio_data = await response.read()
                
                # In a real implementation, you would upload to cloud storage
                # For now, we'll return a placeholder URL
                audio_id = str(uuid.uuid4())
                return f"https://storage.chizen.app/audio/{audio_id}.mp3"
            else:
                error_text = await response.text()
                raise Exception(f"ElevenLabs API error: {response.status} - {error_text}")
    
    async def generate_routine_audio(self, routine_data: Dict) -> Dict:
        """Generate all audio for a complete routine"""
        if not self.api_key:
            return routine_data
            
        # Extract all audio cues from routine blocks
        audio_tasks = []
        block_indices = []
        
        for i, block in enumerate(routine_data.get("blocks", [])):
            audio_cue = block.get("audio_cue")
            if audio_cue:
                audio_tasks.append(audio_cue)
                block_indices.append(i)
        
        # Generate all audio files concurrently
        if audio_tasks:
            audio_urls = await self.generate_audio_cues(audio_tasks)
            
            # Update routine data with audio URLs
            for idx, block_idx in enumerate(block_indices):
                if idx < len(audio_urls):
                    routine_data["blocks"][block_idx]["audio_url"] = audio_urls[idx]
        
        return routine_data
    
    def get_preset_audio_library(self) -> Dict[str, str]:
        """Get pre-generated audio files for common phrases"""
        # In a real implementation, these would be pre-generated and stored
        return {
            "welcome": "https://storage.chizen.app/audio/preset/welcome.mp3",
            "breathe_in": "https://storage.chizen.app/audio/preset/breathe_in.mp3",
            "breathe_out": "https://storage.chizen.app/audio/preset/breathe_out.mp3",
            "hold_position": "https://storage.chizen.app/audio/preset/hold_position.mp3",
            "well_done": "https://storage.chizen.app/audio/preset/well_done.mp3",
            "routine_complete": "https://storage.chizen.app/audio/preset/routine_complete.mp3"
        }