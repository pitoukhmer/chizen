import motor.motor_asyncio
import redis.asyncio as redis
from pymongo import MongoClient
import os
from typing import Optional

class Database:
    client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
    database = None

database = Database()

class RedisCache:
    client: Optional[redis.Redis] = None

redis_cache = RedisCache()

async def connect_to_mongo():
    """Create database connection"""
    database.client = motor.motor_asyncio.AsyncIOMotorClient(
        os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    )
    database.database = database.client.chizen_fitness
    
    # Test connection
    try:
        await database.client.admin.command('ping')
        print("✅ Connected to MongoDB")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")

async def close_mongo_connection():
    """Close database connection"""
    if database.client:
        database.client.close()
        print("✅ Disconnected from MongoDB")

async def connect_to_redis():
    """Create Redis connection for caching"""
    try:
        redis_cache.client = redis.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379"),
            encoding="utf-8",
            decode_responses=True
        )
        await redis_cache.client.ping()
        print("✅ Connected to Redis")
    except Exception as e:
        print(f"❌ Failed to connect to Redis: {e}")
        redis_cache.client = None

def get_database():
    return database.database

def get_redis():
    return redis_cache.client