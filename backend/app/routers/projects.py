from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from app.models.project import Project, ProjectCreate, ProjectUpdate
from app.models.user import User
from app.utils.auth import get_current_user, require_role
from app.database import get_database

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(
    project: ProjectCreate,
    current_user: User = Depends(require_role(["buyer"]))
):
    """Buyer: Create a new project"""
    db = get_database()
    
    project_dict = project.model_dump()
    project_dict["buyer_id"] = current_user.id
    project_dict["status"] = "open"
    project_dict["assigned_solver_id"] = None
    project_dict["created_at"] = datetime.utcnow()
    project_dict["updated_at"] = datetime.utcnow()
    
    result = await db.projects.insert_one(project_dict)
    created_project = await db.projects.find_one({"_id": result.inserted_id})
    created_project["id"] = str(created_project.pop("_id"))

    return Project(**created_project)


@router.get("/", response_model=List[Project])
async def get_projects(current_user: User = Depends(get_current_user)):
    """Get projects based on user role"""
    db = get_database()
    projects = []
    
    if current_user.role == "admin":
        # Admin sees all projects
        cursor = db.projects.find()
    elif current_user.role == "buyer":
        # Buyer sees their own projects
        cursor = db.projects.find({"buyer_id": current_user.id})
    else:  # problem_solver
        # Problem solver sees open projects and their assigned projects
        cursor = db.projects.find({
            "$or": [
                {"status": "open"},
                {"assigned_solver_id": current_user.id}
            ]
        })
    
    async for project in cursor:
        project["id"] = str(project.pop("_id"))
        projects.append(Project(**project))

    return projects


@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific project"""
    db = get_database()
    
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project["id"] = str(project.pop("_id"))
    return Project(**project)


@router.patch("/{project_id}", response_model=Project)
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    current_user: User = Depends(require_role(["buyer"]))
):
    """Buyer: Update their project"""
    db = get_database()
    
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    
    # Verify ownership
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project["buyer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this project")
    
    update_data = {k: v for k, v in project_update.model_dump(exclude_unset=True).items()}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.projects.find_one_and_update(
        {"_id": ObjectId(project_id)},
        {"$set": update_data},
        return_document=True
    )

    result["id"] = str(result.pop("_id"))
    return Project(**result)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Admin or Buyer (creator): Delete a project"""
    db = get_database()
    
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check authorization: admin or buyer (creator)
    if current_user.role != "admin" and project["buyer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
    
    await db.projects.delete_one({"_id": ObjectId(project_id)})
    return None


@router.patch("/{project_id}/status", response_model=Project)
async def update_project_status(
    project_id: str,
    status_update: dict,
    current_user: User = Depends(get_current_user)
):
    """Admin or Buyer (creator): Change project status"""
    db = get_database()
    
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check authorization: admin or buyer (creator)
    if current_user.role != "admin" and project["buyer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this project")
    
    new_status = status_update.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Status is required")
    
    if new_status not in ["open", "assigned", "in_progress", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.projects.find_one_and_update(
        {"_id": ObjectId(project_id)},
        {"$set": {
            "status": new_status,
            "updated_at": datetime.utcnow()
        }},
        return_document=True
    )
    
    result["id"] = str(result.pop("_id"))
    return Project(**result)


@router.patch("/{project_id}/deadline", response_model=Project)
async def update_project_deadline(
    project_id: str,
    deadline_update: dict,
    current_user: User = Depends(get_current_user)
):
    """Admin or Buyer (creator): Postpone or change project deadline"""
    db = get_database()
    
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check authorization: admin or buyer (creator)
    if current_user.role != "admin" and project["buyer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this project")
    
    new_deadline = deadline_update.get("deadline")
    if not new_deadline:
        raise HTTPException(status_code=400, detail="Deadline is required")
    
    # Convert string to datetime if needed
    if isinstance(new_deadline, str):
        try:
            new_deadline = datetime.fromisoformat(new_deadline.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid deadline format")
    
    result = await db.projects.find_one_and_update(
        {"_id": ObjectId(project_id)},
        {"$set": {
            "deadline": new_deadline,
            "updated_at": datetime.utcnow()
        }},
        return_document=True
    )
    
    result["id"] = str(result.pop("_id"))
    return Project(**result)
