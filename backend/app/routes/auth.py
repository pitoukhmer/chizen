from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
import uuid

from ..core.database import get_database
from ..core.security import (
    authenticate_user, 
    create_access_token, 
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from ..models.user import UserCreate, UserInDB, UserResponse
from ..core.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=dict)
async def register(user: UserCreate):
    """Register a new user"""
    db = get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password) if user.password else None
    
    user_data = UserInDB(
        **user.dict(),
        id=user_id,
        hashed_password=hashed_password
    )
    
    # Insert user into database
    await db.users.insert_one(user_data.dict(by_alias=True))
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(user_id, expires_delta=access_token_expires)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**user_data.dict())
    }

@router.post("/login", response_model=dict)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login user with email and password"""
    db = get_database()
    
    # Find user by email (username field contains email)
    user_data = await db.users.find_one({"email": form_data.username})
    
    if not authenticate_user(form_data.username, form_data.password, user_data):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(user_data["_id"], expires_delta=access_token_expires)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**user_data)
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(**current_user.dict())

@router.post("/oauth/google", response_model=dict)
async def google_oauth(google_data: dict):
    """Handle Google OAuth login/registration"""
    db = get_database()
    
    # Extract Google user data
    email = google_data.get("email")
    name = google_data.get("name")
    google_id = google_data.get("sub")
    
    if not email or not google_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google OAuth data"
        )
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email})
    
    if existing_user:
        user_id = existing_user["_id"]
    else:
        # Create new user from Google data
        user_id = str(uuid.uuid4())
        user_data = UserInDB(
            id=user_id,
            email=email,
            username=name or email.split("@")[0],
            oauth_provider="google"
        )
        await db.users.insert_one(user_data.dict(by_alias=True))
        existing_user = user_data.dict()
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(user_id, expires_delta=access_token_expires)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**existing_user)
    }