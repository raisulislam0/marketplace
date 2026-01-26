from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from typing import List
from datetime import datetime
from bson import ObjectId
import os
import shutil
from app.models.task import Task, TaskCreate, TaskUpdate
from app.models.user import User
from app.utils.auth import get_current_user, require_role
from app.database import get_database
from app.config import settings

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("/", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    current_user: User = Depends(require_role(["problem_solver"]))
):
    """Problem solver: Create a task for assigned project"""
    db = get_database()
    
    # Verify project is assigned to current user
    if not ObjectId.is_valid(task.project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    
    project = await db.projects.find_one({"_id": ObjectId(task.project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project["assigned_solver_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not assigned to this project")
    
    task_dict = task.model_dump()
    task_dict["solver_id"] = current_user.id
    task_dict["status"] = "pending"
    task_dict["submission_file"] = None
    task_dict["submission_date"] = None
    task_dict["review_comment"] = None
    task_dict["created_at"] = datetime.utcnow()
    task_dict["updated_at"] = datetime.utcnow()
    
    result = await db.tasks.insert_one(task_dict)
    created_task = await db.tasks.find_one({"_id": result.inserted_id})
    created_task["id"] = str(created_task.pop("_id"))

    return Task(**created_task)


@router.get("/project/{project_id}", response_model=List[Task])
async def get_project_tasks(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get all tasks for a project"""
    db = get_database()
    
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    
    # Verify access
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if current_user.role == "buyer" and project["buyer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == "problem_solver" and project["assigned_solver_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    tasks = []
    async for task in db.tasks.find({"project_id": project_id}):
        task["id"] = str(task.pop("_id"))
        tasks.append(Task(**task))

    return tasks


@router.patch("/{task_id}", response_model=Task)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    current_user: User = Depends(require_role(["problem_solver"]))
):
    """Problem solver: Update task"""
    db = get_database()
    
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task["solver_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in task_update.model_dump(exclude_unset=True).items()}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.tasks.find_one_and_update(
        {"_id": ObjectId(task_id)},
        {"$set": update_data},
        return_document=True
    )

    result["id"] = str(result.pop("_id"))
    return Task(**result)


@router.post("/{task_id}/submit", response_model=Task)
async def submit_task(
    task_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["problem_solver"]))
):
    """Problem solver: Submit task with ZIP file"""
    db = get_database()

    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID")

    # Verify file is ZIP
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only ZIP files are allowed")

    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task["solver_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Create upload directory if not exists
    upload_dir = os.path.join(settings.upload_dir, task_id)
    os.makedirs(upload_dir, exist_ok=True)

    # Save file
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Update task
    result = await db.tasks.find_one_and_update(
        {"_id": ObjectId(task_id)},
        {"$set": {
            "status": "submitted",
            "submission_file": file_path,
            "submission_date": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }},
        return_document=True
    )

    result["id"] = str(result.pop("_id"))
    return Task(**result)


@router.post("/{task_id}/review", response_model=Task)
async def review_task(
    task_id: str,
    accept: bool,
    comment: str = None,
    current_user: User = Depends(require_role(["buyer"]))
):
    """Buyer: Accept or reject task submission"""
    db = get_database()

    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID")

    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Verify project ownership
    project = await db.projects.find_one({"_id": ObjectId(task["project_id"])})
    if not project or project["buyer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if task["status"] != "submitted":
        raise HTTPException(status_code=400, detail="Task is not submitted")

    new_status = "completed" if accept else "rejected"

    result = await db.tasks.find_one_and_update(
        {"_id": ObjectId(task_id)},
        {"$set": {
            "status": new_status,
            "review_comment": comment,
            "updated_at": datetime.utcnow()
        }},
        return_document=True
    )

    result["id"] = str(result.pop("_id"))
    return Task(**result)

