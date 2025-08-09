from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .security import verify_token
from .database import get_database
from ..models.user import UserInDB
from typing import Optional
from datetime import datetime

security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> UserInDB:
    """Get current authenticated user with demo mode support"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authentication provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    # Handle demo mode tokens
    if token.startswith('demo-'):
        return await _handle_demo_user(token)
    
    # Handle real JWT tokens
    user_id = verify_token(token)
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    db = get_database()
    user_data = await db.users.find_one({"_id": user_id})
    
    if user_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return UserInDB(**user_data)

async def _handle_demo_user(token: str) -> UserInDB:
    """Handle demo mode authentication"""
    db = get_database()
    
    # Extract demo user info from token
    if token == 'demo-token' or token.startswith('demo-user-'):
        demo_email = "demo@chizen.com"
        demo_username = "demo_user"
        is_admin = False
    elif token == 'demo-google-token':
        demo_email = "demo@gmail.com"
        demo_username = "demo_google"
        is_admin = False
    elif 'admin' in token:
        demo_email = "admin@chizen.com"
        demo_username = "demo_admin"
        is_admin = True
    else:
        demo_email = "demo@chizen.com"
        demo_username = "demo_user"
        is_admin = False
    
    # Create or get demo user
    user_data = await db.users.find_one({"email": demo_email})
    
    if not user_data:
        # Create demo user
        from ..models.user import UserCreate
        demo_user_data = {
            "_id": f"demo-{hash(demo_email)}",
            "email": demo_email,
            "username": demo_username,
            "hashed_password": "",  # Demo users don't need passwords
            "fitness_level": "beginner",
            "preferences": {
                "duration": 15,
                "focus_areas": ["flexibility", "mindfulness"],
                "language": "en"
            },
            "streak_data": {
                "current": 3,
                "longest": 7,
                "last_completed": None
            },
            "total_xp": 150,
            "is_admin": is_admin,
            "created_at": datetime.utcnow(),
            "last_active": datetime.utcnow()
        }
        await db.users.insert_one(demo_user_data)
        user_data = demo_user_data
    
    return UserInDB(**user_data)

async def get_current_admin_user(
    current_user: UserInDB = Depends(get_current_user)
) -> UserInDB:
    """Get current user and verify admin privileges"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user