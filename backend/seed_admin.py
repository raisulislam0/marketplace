"""
Seed script to create an admin user
Run this after setting up the database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    # Connect to MongoDB
    mongodb_url = os.getenv("MONGODB_URL")
    database_name = os.getenv("DATABASE_NAME", "marketplace")
    
    client = AsyncIOMotorClient(mongodb_url)
    db = client[database_name]
    
    # Admin user details
    admin_email = input("Enter admin email: ")
    admin_password = input("Enter admin password: ")
    admin_name = input("Enter admin full name: ")
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": admin_email})
    if existing_user:
        print(f"User with email {admin_email} already exists!")
        
        # Ask if they want to update to admin
        update = input("Update this user to admin role? (y/n): ")
        if update.lower() == 'y':
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"role": "admin", "updated_at": datetime.utcnow()}}
            )
            print(f"✅ User {admin_email} updated to admin role!")
        return
    
    # Create admin user
    hashed_password = pwd_context.hash(admin_password)
    
    admin_user = {
        "email": admin_email,
        "full_name": admin_name,
        "role": "admin",
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "profile": None
    }
    
    result = await db.users.insert_one(admin_user)
    print(f"✅ Admin user created successfully!")
    print(f"Email: {admin_email}")
    print(f"ID: {result.inserted_id}")
    
    client.close()

if __name__ == "__main__":
    print("=== Create Admin User ===")
    asyncio.run(create_admin())

