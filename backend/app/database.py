from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = None
database = None


async def connect_to_mongo():
    global client, database
    client = AsyncIOMotorClient(settings.mongodb_url)
    database = client[settings.database_name]
    print(f"Connected to MongoDB database: {settings.database_name}")


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")


def get_database():
    return database

