from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from .core.database import connect_to_mongo, close_mongo_connection
from .routes import auth, routines, admin, newsletter, test, voice, progress, challenges

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title="ChiZen Fitness API",
    description="AI-powered wellness application backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://chizen-fitness.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(routines.router, prefix="/api/routine", tags=["routines"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(newsletter.router, prefix="/api/newsletter", tags=["newsletter"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(challenges.router, prefix="/api/challenges", tags=["challenges"])
app.include_router(test.router, prefix="/api/test", tags=["testing"])

@app.get("/")
async def root():
    return {"message": "ChiZen Fitness API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "chizen-api"}