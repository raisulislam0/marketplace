from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.models.user import User, UserUpdate, ProblemSolverProfile
from app.utils.auth import get_current_user, require_role
from app.database import get_database

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[User])
async def get_all_users(current_user: User = Depends(require_role(["admin"]))):
    """Admin only: Get all users"""
    db = get_database()
    users = []
    async for user in db.users.find():
        user["id"] = str(user.pop("_id"))
        # Remove hashed_password before creating User object
        user.pop("hashed_password", None)
        try:
            users.append(User(**user))
        except Exception as e:
            # Log the error but continue processing other users
            print(f"Error processing user {user.get('email', 'unknown')}: {e}")
            continue
    return users


@router.patch("/{user_id}/role", response_model=User)
async def assign_role(
    user_id: str,
    role_update: UserUpdate,
    current_user: User = Depends(require_role(["admin"]))
):
    """Admin only: Assign role to a user"""
    db = get_database()
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    update_data = {"role": role_update.role, "updated_at": datetime.utcnow()}
    
    result = await db.users.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="User not found")

    result["id"] = str(result.pop("_id"))
    result.pop("hashed_password", None)
    return User(**result)


@router.get("/problem-solvers", response_model=List[User])
async def get_problem_solvers(current_user: User = Depends(get_current_user)):
    """Get all problem solvers"""
    db = get_database()
    solvers = []
    async for user in db.users.find({"role": "problem_solver"}):
        user["id"] = str(user.pop("_id"))
        user.pop("hashed_password", None)
        try:
            solvers.append(User(**user))
        except Exception as e:
            # Log the error but continue processing other users
            print(f"Error processing user {user.get('email', 'unknown')}: {e}")
            continue
    return solvers


@router.put("/profile", response_model=User)
async def update_profile(
    profile: ProblemSolverProfile,
    current_user: User = Depends(require_role(["problem_solver"]))
):
    """Problem solver: Update profile"""
    db = get_database()
    
    result = await db.users.find_one_and_update(
        {"email": current_user.email},
        {"$set": {"profile": profile.model_dump(), "updated_at": datetime.utcnow()}},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="User not found")

    result["id"] = str(result.pop("_id"))
    result.pop("hashed_password", None)
    return User(**result)


@router.get("/search/", response_model=List[User])
async def search_users(
    q: Optional[str] = Query(None, description="Search query for name or email"),
    role: Optional[str] = Query(None, description="Filter by role"),
    current_user: User = Depends(get_current_user)
):
    """Search users by name or email"""
    db = get_database()
    users = []

    # Build search query
    query = {}

    # Add role filter if provided
    if role:
        query["role"] = role

    # Add text search if query provided
    if q and q.strip():
        query["$or"] = [
            {"full_name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}}
        ]

    cursor = db.users.find(query)
    async for user in cursor:
        user["id"] = str(user.pop("_id"))
        user.pop("hashed_password", None)
        try:
            users.append(User(**user))
        except Exception as e:
            print(f"Error processing user {user.get('email', 'unknown')}: {e}")
            continue

    return users



