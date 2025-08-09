from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from datetime import datetime
import os
import sendgrid
from sendgrid.helpers.mail import Mail

from ..core.database import get_database

router = APIRouter()

class NewsletterSubscription(BaseModel):
    email: EmailStr
    name: str = ""
    preferences: list = ["wellness_tips", "new_features"]

class NewsletterService:
    def __init__(self):
        self.api_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@chizen.app")
        self.sg = sendgrid.SendGridAPIClient(api_key=self.api_key) if self.api_key else None
    
    async def send_welcome_email(self, email: str, name: str = ""):
        """Send welcome email to new subscriber"""
        if not self.sg:
            print(f"SendGrid not configured - would send welcome email to {email}")
            return
        
        display_name = name if name else email.split("@")[0]
        
        message = Mail(
            from_email=self.from_email,
            to_emails=email,
            subject="Welcome to ChiZen Fitness! 🧘‍♀️",
            html_content=f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #16a34a, #059669); padding: 30px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 28px;">Welcome to ChiZen Fitness!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 18px;">Your mindful wellness journey begins now</p>
                </div>
                
                <div style="padding: 30px; background: #f9fafb;">
                    <h2 style="color: #16a34a;">Hi {display_name}! 👋</h2>
                    
                    <p>Thank you for joining the ChiZen community! You're now part of a growing movement of mindful wellness practitioners who are transforming their daily routines through AI-powered Tai Chi, breathwork, and bodyweight exercises.</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
                        <h3 style="margin-top: 0; color: #16a34a;">What's Next?</h3>
                        <ul style="color: #374151;">
                            <li>🧘‍♀️ <strong>Start your practice:</strong> Generate your first personalized routine</li>
                            <li>📊 <strong>Track progress:</strong> Build streaks and earn XP</li>
                            <li>🎯 <strong>Set goals:</strong> Choose focus areas that matter to you</li>
                            <li>🏆 <strong>Join challenges:</strong> Connect with the community</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://chizen.app/dashboard" style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Get Started Now</a>
                    </div>
                    
                    <p style="color: #6b7280; font-style: italic;">"The journey of a thousand miles begins with a single step. Today, you take that step." - Master Lee</p>
                </div>
                
                <div style="background: #374151; color: #d1d5db; padding: 20px; text-align: center; font-size: 14px;">
                    <p>You'll receive weekly wellness tips and updates about new features.</p>
                    <p><a href="#" style="color: #16a34a;">Manage preferences</a> | <a href="#" style="color: #16a34a;">Unsubscribe</a></p>
                </div>
            </div>
            """
        )
        
        try:
            response = self.sg.send(message)
            print(f"Welcome email sent to {email}, status: {response.status_code}")
        except Exception as e:
            print(f"Failed to send welcome email to {email}: {e}")

newsletter_service = NewsletterService()

@router.post("/subscribe")
async def subscribe_newsletter(subscription: NewsletterSubscription):
    """Subscribe to newsletter"""
    db = get_database()
    
    # Check if already subscribed
    existing = await db.newsletter_subscriptions.find_one({"email": subscription.email})
    if existing:
        if existing.get("is_active", True):
            return {
                "message": "Already subscribed",
                "email": subscription.email,
                "status": "existing"
            }
        else:
            # Reactivate subscription
            await db.newsletter_subscriptions.update_one(
                {"email": subscription.email},
                {
                    "$set": {
                        "is_active": True,
                        "resubscribed_at": datetime.utcnow(),
                        "preferences": subscription.preferences
                    }
                }
            )
            return {
                "message": "Subscription reactivated",
                "email": subscription.email,
                "status": "reactivated"
            }
    
    # Create new subscription
    subscription_doc = {
        "email": subscription.email,
        "name": subscription.name,
        "preferences": subscription.preferences,
        "subscribed_at": datetime.utcnow(),
        "is_active": True,
        "source": "website"
    }
    
    await db.newsletter_subscriptions.insert_one(subscription_doc)
    
    # Send welcome email
    await newsletter_service.send_welcome_email(subscription.email, subscription.name)
    
    return {
        "message": "Successfully subscribed to newsletter",
        "email": subscription.email,
        "status": "new"
    }

@router.post("/unsubscribe")
async def unsubscribe_newsletter(email_data: dict):
    """Unsubscribe from newsletter"""
    db = get_database()
    email = email_data.get("email")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address required"
        )
    
    result = await db.newsletter_subscriptions.update_one(
        {"email": email},
        {
            "$set": {
                "is_active": False,
                "unsubscribed_at": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found in subscription list"
        )
    
    return {"message": "Successfully unsubscribed from newsletter"}

@router.get("/subscribers/stats")
async def get_subscriber_stats():
    """Get newsletter subscription statistics"""
    db = get_database()
    
    total_subscribers = await db.newsletter_subscriptions.count_documents({"is_active": True})
    total_unsubscribed = await db.newsletter_subscriptions.count_documents({"is_active": False})
    
    # Recent subscriptions (last 30 days)
    thirty_days_ago = datetime.utcnow() - datetime.timedelta(days=30)
    recent_subscribers = await db.newsletter_subscriptions.count_documents({
        "subscribed_at": {"$gte": thirty_days_ago},
        "is_active": True
    })
    
    return {
        "active_subscribers": total_subscribers,
        "total_unsubscribed": total_unsubscribed,
        "recent_subscribers": recent_subscribers,
        "conversion_rate": round((total_subscribers / (total_subscribers + total_unsubscribed) * 100), 1) if (total_subscribers + total_unsubscribed) > 0 else 0
    }