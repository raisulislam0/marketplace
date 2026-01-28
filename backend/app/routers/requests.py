from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from app.models.request import Request, RequestCreate, RequestUpdate
from app.models.user import User
from app.utils.auth import get_current_user, require_role
from app.database import get_database

router = APIRouter(prefix="/requests", tags=["Requests"])


@router.post("/", response_model=Request, status_code=status.HTTP_201_CREATED)
async def create_request(
    request: RequestCreate,
    current_user: User = Depends(require_role(["problem_solver"]))
):
    """Problem solver: Request to work on a project"""
    db = get_database()
    
    # Verify project exists and is open
    if not ObjectId.is_valid(request.project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    
    project = await db.projects.find_one({"_id": ObjectId(request.project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project["status"] != "open":
        raise HTTPException(status_code=400, detail="Project is not open for requests")
    
    # Check if already requested
    existing_request = await db.requests.find_one({
        "project_id": request.project_id,
        "solver_id": current_user.id
    })
    if existing_request:
        raise HTTPException(status_code=400, detail="Already requested this project")
    
    request_dict = request.model_dump()
    request_dict["solver_id"] = current_user.id
    request_dict["status"] = "pending"
    request_dict["created_at"] = datetime.utcnow()
    request_dict["updated_at"] = datetime.utcnow()
    
    result = await db.requests.insert_one(request_dict)
    created_request = await db.requests.find_one({"_id": result.inserted_id})
    created_request["id"] = str(created_request.pop("_id"))

    return Request(**created_request)


@router.get("/project/{project_id}", response_model=List[Request])
async def get_project_requests(
    project_id: str,
    current_user: User = Depends(require_role(["buyer", "admin"]))
):
    """Buyer/Admin: Get all requests for a project"""
    db = get_database()
    
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    
    # Verify project ownership for buyers
    if current_user.role == "buyer":
        project = await db.projects.find_one({"_id": ObjectId(project_id)})
        if not project or project["buyer_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    requests = []
    async for req in db.requests.find({"project_id": project_id}):
        req["id"] = str(req.pop("_id"))

        # Populate solver details
        if req.get("solver_id"):
            solver = await db.users.find_one({"_id": ObjectId(req["solver_id"])})
            if solver:
                req["solver_email"] = solver.get("email")
                req["solver_name"] = solver.get("full_name")

        requests.append(Request(**req))

    return requests


@router.patch("/{request_id}", response_model=Request)
async def update_request_status(
    request_id: str,
    request_update: RequestUpdate,
    current_user: User = Depends(require_role(["buyer"]))
):
    """Buyer: Accept or reject a request"""
    db = get_database()
    
    if not ObjectId.is_valid(request_id):
        raise HTTPException(status_code=400, detail="Invalid request ID")
    
    req = await db.requests.find_one({"_id": ObjectId(request_id)})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Verify project ownership
    project = await db.projects.find_one({"_id": ObjectId(req["project_id"])})
    if not project or project["buyer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update request
    result = await db.requests.find_one_and_update(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": request_update.status, "updated_at": datetime.utcnow()}},
        return_document=True
    )
    
    # If accepted, assign solver to project and reject other requests
    if request_update.status == "accepted":
        await db.projects.update_one(
            {"_id": ObjectId(req["project_id"])},
            {"$set": {
                "assigned_solver_id": req["solver_id"],
                "status": "assigned",
                "updated_at": datetime.utcnow()
            }}
        )
        # Reject all other pending requests
        await db.requests.update_many(
            {
                "project_id": req["project_id"],
                "_id": {"$ne": ObjectId(request_id)},
                "status": "pending"
            },
            {"$set": {"status": "rejected", "updated_at": datetime.utcnow()}}
        )
    
    result["id"] = str(result.pop("_id"))
    return Request(**result)

