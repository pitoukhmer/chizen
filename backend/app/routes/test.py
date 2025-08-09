from fastapi import APIRouter
from ..services.ai_service import RoutineGenerator
from ..models.routine import RoutineResponse

router = APIRouter()

@router.get("/test-routine")
async def test_generate_routine():
    """Test routine generation with OpenAI - No auth required"""
    try:
        generator = RoutineGenerator()
        
        # Use default user profile for testing
        user_profile = {
            "fitness_level": "beginner",
            "duration": 15,
            "focus_areas": ["flexibility", "mindfulness"],
            "language": "en"
        }
        
        routine_data = await generator.generate_daily_routine(user_profile)
        return {
            "success": True,
            "routine": routine_data,
            "message": "Real OpenAI routine generated successfully!"
        }
    except Exception as e:
        return {
            "success": False,
            "routine": None,
            "message": f"OpenAI error: {str(e)}",
            "error": str(e)
        }

@router.post("/test-voice", response_model=dict)
async def test_voice_generation():
    """Test ElevenLabs voice generation - No auth required"""
    try:
        # Import voice service
        from ..services.voice_service import VoiceService
        
        voice_service = VoiceService()
        test_text = "Welcome to ChiZen Fitness. Let's begin your mindful practice."
        
        audio_url = await voice_service.generate_audio_cues([test_text])
        
        return {
            "success": True,
            "audio_url": audio_url[0] if audio_url else None,
            "message": "ElevenLabs voice generated successfully!"
        }
    except Exception as e:
        return {
            "success": False,
            "audio_url": None,
            "message": f"ElevenLabs unavailable. Error: {str(e)}",
            "error": str(e)
        }

@router.post("/test-email", response_model=dict)
async def test_email_sending(email: str = "test@example.com"):
    """Test SendGrid email sending - No auth required"""
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        import os
        
        sg = SendGridAPIClient(api_key=os.getenv('SENDGRID_API_KEY'))
        
        message = Mail(
            from_email=os.getenv('FROM_EMAIL', 'chizen@pitouphat.com'),
            to_emails=email,
            subject='ChiZen Fitness - Test Email',
            html_content='''
            <h2>🧘‍♀️ Welcome to ChiZen Fitness!</h2>
            <p>This is a test email to verify SendGrid integration.</p>
            <p>Your wellness journey is ready to begin!</p>
            <p>Best regards,<br>The ChiZen Team</p>
            '''
        )
        
        response = sg.send(message)
        
        return {
            "success": True,
            "status_code": response.status_code,
            "message": f"Email sent successfully to {email}!"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"SendGrid unavailable. Error: {str(e)}",
            "error": str(e)
        }