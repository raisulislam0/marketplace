"""
Seed script to create test projects and requests
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

async def seed_projects():
    # Connect to MongoDB
    mongodb_url = os.getenv("MONGODB_URL")
    database_name = os.getenv("DATABASE_NAME", "marketplace")
    
    client = AsyncIOMotorClient(mongodb_url)
    db = client[database_name]
    
    try:
        # Get a buyer user or create one
        buyer = await db.users.find_one({"role": "buyer"})
        if not buyer:
            print("No buyer found! Creating a test buyer...")
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            
            buyer_user = {
                "email": "buyer@test.com",
                "full_name": "Test Buyer",
                "role": "buyer",
                "hashed_password": pwd_context.hash("password123"),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "profile": None
            }
            buyer_result = await db.users.insert_one(buyer_user)
            buyer = await db.users.find_one({"_id": buyer_result.inserted_id})
            print(f"Created buyer: {buyer['email']}")
        
        buyer_id = str(buyer["_id"])
        
        # Create test projects
        projects = [
            {
                "title": "Website Redesign",
                "description": "We need to redesign our company website with a modern look and improved UX",
                "budget": 5000,
                "deadline": datetime.utcnow() + timedelta(days=30),
                "requirements": ["HTML", "CSS", "JavaScript", "Responsive Design"],
                "buyer_id": buyer_id,
                "assigned_solver_id": None,
                "status": "open",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "title": "API Development",
                "description": "Build a REST API for our mobile app backend with authentication and user management",
                "budget": 8000,
                "deadline": datetime.utcnow() + timedelta(days=45),
                "requirements": ["Python", "FastAPI", "MongoDB", "JWT", "Docker"],
                "buyer_id": buyer_id,
                "assigned_solver_id": None,
                "status": "open",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "title": "Database Optimization",
                "description": "Optimize database queries and improve overall performance of the application",
                "budget": 3000,
                "deadline": datetime.utcnow() + timedelta(days=20),
                "requirements": ["SQL", "Performance Tuning", "Index Design", "Query Optimization"],
                "buyer_id": buyer_id,
                "assigned_solver_id": None,
                "status": "open",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "title": "Mobile App Development",
                "description": "Develop a cross-platform mobile application using React Native",
                "budget": 12000,
                "deadline": datetime.utcnow() + timedelta(days=60),
                "requirements": ["React Native", "TypeScript", "Redux", "Firebase"],
                "buyer_id": buyer_id,
                "assigned_solver_id": None,
                "status": "open",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "title": "Testing & QA",
                "description": "Comprehensive testing including unit tests, integration tests, and end-to-end tests",
                "budget": 4000,
                "deadline": datetime.utcnow() + timedelta(days=25),
                "requirements": ["Jest", "Cypress", "Test Planning", "Bug Reporting"],
                "buyer_id": buyer_id,
                "assigned_solver_id": None,
                "status": "open",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        # Insert projects
        result = await db.projects.insert_many(projects)
        print(f"\n✅ Created {len(result.inserted_ids)} test projects:")
        
        for i, project_id in enumerate(result.inserted_ids, 1):
            print(f"   {i}. {projects[i-1]['title']} (ID: {project_id})")
        
        # Show project stats
        project_count = await db.projects.count_documents({})
        print(f"\n📊 Total projects in database: {project_count}")
        
    finally:
        client.close()
        print("\n✨ Database seeding complete!")

if __name__ == "__main__":
    print("=== Seed Test Projects ===\n")
    asyncio.run(seed_projects())
