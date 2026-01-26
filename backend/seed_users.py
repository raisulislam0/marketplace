"""
Seed script to create test users with different roles
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_test_users():
    # Connect to MongoDB
    mongodb_url = os.getenv("MONGODB_URL")
    database_name = os.getenv("DATABASE_NAME", "marketplace")
    
    client = AsyncIOMotorClient(mongodb_url)
    db = client[database_name]
    
    try:
        test_users = [
            {
                "email": "solver@test.com",
                "full_name": "Test Problem Solver",
                "role": "problem_solver",
                "password": "password123"
            },
            {
                "email": "buyer@test.com",
                "full_name": "Test Buyer",
                "role": "buyer",
                "password": "password123"
            },
            {
                "email": "admin@test.com",
                "full_name": "Test Admin",
                "role": "admin",
                "password": "password123"
            }
        ]
        
        created = 0
        for user_data in test_users:
            existing = await db.users.find_one({"email": user_data["email"]})
            if existing:
                print(f"User {user_data['email']} already exists, skipping...")
                continue
            
            hashed_password = pwd_context.hash(user_data["password"])
            user_dict = {
                "email": user_data["email"],
                "full_name": user_data["full_name"],
                "role": user_data["role"],
                "hashed_password": hashed_password,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "profile": None
            }
            
            result = await db.users.insert_one(user_dict)
            print(f"Created {user_data['role']}: {user_data['email']}")
            created += 1
        
        if created == 0:
            print("\nAll test users already exist!")
            print("\nYou can login with:")
            for user in test_users:
                print(f"  Email: {user['email']}, Password: {user['password']}, Role: {user['role']}")
        else:
            print(f"\nCreated {created} test user(s)!")
            print("\nYou can now login with:")
            for user in test_users:
                print(f"  Email: {user['email']}, Password: {user['password']}, Role: {user['role']}")
        
    finally:
        client.close()

if __name__ == "__main__":
    print("=== Create Test Users ===\n")
    asyncio.run(create_test_users())
