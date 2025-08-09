"""
Database initialization script for ChiZen Fitness
Creates indexes and default data for optimal performance
"""
import asyncio
import motor.motor_asyncio
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

async def init_database():
    """Initialize database with indexes and sample data"""
    
    # Connect to MongoDB
    client = motor.motor_asyncio.AsyncIOMotorClient(
        os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    )
    db = client.chizen_fitness
    
    print("🗄️ Initializing ChiZen Fitness Database...")
    
    try:
        # Test connection
        await client.admin.command('ping')
        print("✅ Connected to MongoDB")
        
        # Create indexes for performance
        print("📚 Creating database indexes...")
        
        # Users collection indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("created_at")
        await db.users.create_index("is_admin")
        await db.users.create_index("is_active")
        await db.users.create_index([
            ("streak_data.current", -1),
            ("total_xp", -1)
        ], name="leaderboard_index")
        
        # Routines collection indexes
        await db.routines.create_index([("user_id", 1), ("created_at", -1)])
        await db.routines.create_index("routine_id", unique=True)
        await db.routines.create_index("completed_at")
        await db.routines.create_index("created_at")
        
        # Newsletter collection indexes
        await db.newsletter_subscriptions.create_index("email", unique=True)
        await db.newsletter_subscriptions.create_index("subscribed_at")
        await db.newsletter_subscriptions.create_index("is_active")
        
        print("✅ Database indexes created")
        
        # Create admin user if doesn't exist
        admin_email = "admin@chizen.app"
        existing_admin = await db.users.find_one({"email": admin_email})
        
        if not existing_admin:
            admin_user = {
                "_id": "admin-user-001",
                "email": admin_email,
                "username": "ChiZen Admin",
                "fitness_level": "advanced",
                "preferences": {
                    "duration": 20,
                    "focus_areas": ["strength", "flexibility", "mindfulness"],
                    "language": "en"
                },
                "streak_data": {
                    "current": 0,
                    "longest": 0,
                    "last_completed": None
                },
                "total_xp": 0,
                "is_admin": True,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "oauth_provider": None
            }
            
            await db.users.insert_one(admin_user)
            print(f"✅ Admin user created: {admin_email}")
        else:
            print(f"📋 Admin user already exists: {admin_email}")
        
        # Create sample routine templates for fallback
        sample_routines = [
            {
                "_id": "template-morning-flow",
                "title": "Morning Energy Flow",
                "total_duration": 15,
                "focus_area": "Energy & Focus",
                "difficulty_level": 2,
                "blocks": [
                    {
                        "type": "mind",
                        "name": "Awakening Breath",
                        "duration_seconds": 180,
                        "instructions": [
                            "Sit comfortably with spine straight",
                            "Take 5 deep breaths to center yourself",
                            "Focus on the sensation of breathing"
                        ],
                        "difficulty": 1,
                        "audio_cue": "Good morning! Let's awaken your body and mind with gentle breathing.",
                        "benefits": ["Increases alertness", "Reduces morning fog"]
                    },
                    {
                        "type": "move",
                        "name": "Sunrise Salutation",
                        "duration_seconds": 480,
                        "instructions": [
                            "Stand with feet hip-width apart",
                            "Slowly raise arms overhead like the rising sun",
                            "Flow through gentle Tai Chi movements",
                            "Coordinate breath with movement"
                        ],
                        "difficulty": 2,
                        "audio_cue": "Move like the gentle morning breeze, flowing and continuous.",
                        "benefits": ["Improves flexibility", "Enhances coordination"]
                    },
                    {
                        "type": "core",
                        "name": "Foundation Building",
                        "duration_seconds": 240,
                        "instructions": [
                            "Wall plank for 30 seconds",
                            "Rest 15 seconds",
                            "Repeat 4 times with mindful breathing"
                        ],
                        "difficulty": 2,
                        "audio_cue": "Build strength from your center, breathe with intention.",
                        "benefits": ["Strengthens core", "Improves posture"]
                    }
                ],
                "completion_xp": 80,
                "daily_wisdom": "Each morning we are born again. What we do today is what matters most.",
                "is_template": True,
                "created_at": datetime.utcnow()
            },
            {
                "_id": "template-evening-calm",
                "title": "Evening Serenity",
                "total_duration": 12,
                "focus_area": "Relaxation & Sleep",
                "difficulty_level": 1,
                "blocks": [
                    {
                        "type": "mind",
                        "name": "Sunset Breathing",
                        "duration_seconds": 240,
                        "instructions": [
                            "Sit or lie down comfortably",
                            "Breathe in for 4 counts",
                            "Hold for 4 counts",
                            "Exhale for 6 counts"
                        ],
                        "difficulty": 1,
                        "audio_cue": "Let go of the day's tensions with each exhale.",
                        "benefits": ["Reduces stress", "Prepares for sleep"]
                    },
                    {
                        "type": "move",
                        "name": "Gentle Flow",
                        "duration_seconds": 360,
                        "instructions": [
                            "Slow, flowing movements",
                            "Focus on releasing tension",
                            "Move at half your normal speed"
                        ],
                        "difficulty": 1,
                        "audio_cue": "Move with the calmness of still water.",
                        "benefits": ["Releases tension", "Improves sleep quality"]
                    },
                    {
                        "type": "core",
                        "name": "Gentle Stretching",
                        "duration_seconds": 120,
                        "instructions": [
                            "Gentle spinal twists",
                            "Shoulder rolls",
                            "Neck stretches"
                        ],
                        "difficulty": 1,
                        "audio_cue": "Release the day's tensions and prepare for restful sleep.",
                        "benefits": ["Relieves muscle tension", "Promotes relaxation"]
                    }
                ],
                "completion_xp": 60,
                "daily_wisdom": "Peace comes from within. Do not seek it without.",
                "is_template": True,
                "created_at": datetime.utcnow()
            }
        ]
        
        # Insert sample routines if they don't exist
        for routine in sample_routines:
            existing = await db.routine_templates.find_one({"_id": routine["_id"]})
            if not existing:
                await db.routine_templates.insert_one(routine)
                print(f"✅ Created routine template: {routine['title']}")
        
        # Get database stats
        stats = await db.command("dbstats")
        collections = await db.list_collection_names()
        
        print("\n📊 Database Setup Complete!")
        print(f"   Database: {stats['db']}")
        print(f"   Collections: {len(collections)}")
        print(f"   Storage Size: {stats.get('storageSize', 0)} bytes")
        
        print("\n🎯 Quick Start:")
        print("   1. Start your backend: python backend/run.py")
        print("   2. Start your frontend: npm run dev")
        print("   3. Visit: http://localhost:3000")
        print("   4. Sign in with any email/password (demo mode)")
        
        return True
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False
    finally:
        client.close()

if __name__ == "__main__":
    success = asyncio.run(init_database())
    exit(0 if success else 1)