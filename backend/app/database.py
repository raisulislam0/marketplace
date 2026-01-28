from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import certifi

client = None
database = None


async def connect_to_mongo():
    global client, database
    # Configure MongoDB connection with SSL/TLS settings for production environments
    client = AsyncIOMotorClient(
        settings.mongodb_url,
        tlsCAFile=certifi.where(),  # Use certifi's CA bundle for SSL verification
        serverSelectionTimeoutMS=5000,  # 5 second timeout
        connectTimeoutMS=10000,  # 10 second connection timeout
        socketTimeoutMS=20000,  # 20 second socket timeout
    )
    database = client[settings.database_name]
    print(f"Connected to MongoDB database: {settings.database_name}")


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")


def get_database():
    return database

