from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from app.models.plan import Plan, PlanCreate, PlanUpdate, Milestone, MilestoneUpdate
from app.models.user import User
from app.utils.auth import get_current_user, require_role
from app.database import get_database

router = APIRouter(prefix="/plans", tags=["Plans"])


@router.post("/", response_model=Plan, status_code=status.HTTP_201_CREATED)
async def create_plan(
    plan: PlanCreate,
    current_user: User = Depends(require_role(["problem_solver"]))
):
    """Solver: Create a plan/proposal for a request"""
    db = get_database()
    
    # Verify request exists
    if not ObjectId.is_valid(plan.request_id):
        raise HTTPException(status_code=400, detail="Invalid request ID")
    
    request_obj = await db.requests.find_one({"_id": ObjectId(plan.request_id)})
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Verify the solver owns this request
    if request_obj.get("solver_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Create plan document
    plan_dict = plan.model_dump()
    plan_dict["solver_id"] = current_user.id
    plan_dict["status"] = "pending"
    plan_dict["progress_percentage"] = 0.0
    plan_dict["created_at"] = datetime.utcnow()
    plan_dict["updated_at"] = datetime.utcnow()
    
    result = await db.plans.insert_one(plan_dict)
    created_plan = await db.plans.find_one({"_id": result.inserted_id})
    created_plan["id"] = str(created_plan.pop("_id"))
    
    return Plan(**created_plan)


@router.get("/request/{request_id}", response_model=List[Plan])
async def get_plans_for_request(
    request_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get all plans for a specific request"""
    db = get_database()
    
    if not ObjectId.is_valid(request_id):
        raise HTTPException(status_code=400, detail="Invalid request ID")
    
    # Verify access to request
    request_obj = await db.requests.find_one({"_id": ObjectId(request_id)})
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Only request solver, project buyer, or admin can view
    project_obj = await db.projects.find_one({"_id": ObjectId(request_obj["project_id"])})
    if not project_obj:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if (current_user.role != "admin" and 
        current_user.id != request_obj["solver_id"] and 
        current_user.id != project_obj["buyer_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    plans = []
    async for plan in db.plans.find({"request_id": request_id}):
        plan["id"] = str(plan.pop("_id"))
        plans.append(Plan(**plan))
    
    return plans


@router.patch("/{plan_id}/approve", response_model=Plan)
async def approve_plan(
    plan_id: str,
    current_user: User = Depends(require_role(["buyer"]))
):
    """Buyer: Approve a plan proposal"""
    db = get_database()
    
    if not ObjectId.is_valid(plan_id):
        raise HTTPException(status_code=400, detail="Invalid plan ID")
    
    plan = await db.plans.find_one({"_id": ObjectId(plan_id)})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    request_obj = await db.requests.find_one({"_id": ObjectId(plan["request_id"])})
    project_obj = await db.projects.find_one({"_id": ObjectId(request_obj["project_id"])})
    
    # Verify buyer ownership
    if project_obj["buyer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update plan
    result = await db.plans.find_one_and_update(
        {"_id": ObjectId(plan_id)},
        {"$set": {
            "status": "approved",
            "approved_at": datetime.utcnow(),
            "approved_by": current_user.id,
            "updated_at": datetime.utcnow()
        }},
        return_document=True
    )
    
    # Update request status to accepted
    await db.requests.update_one(
        {"_id": ObjectId(plan["request_id"])},
        {"$set": {"status": "accepted", "updated_at": datetime.utcnow()}}
    )
    
    # Assign solver to project
    await db.projects.update_one(
        {"_id": ObjectId(request_obj["project_id"])},
        {"$set": {
            "assigned_solver_id": request_obj["solver_id"],
            "status": "assigned",
            "updated_at": datetime.utcnow()
        }}
    )
    
    result["id"] = str(result.pop("_id"))
    return Plan(**result)


@router.patch("/{plan_id}/reject", response_model=Plan)
async def reject_plan(
    plan_id: str,
    reason_data: dict,
    current_user: User = Depends(require_role(["buyer"]))
):
    """Buyer: Reject a plan proposal"""
    db = get_database()
    
    if not ObjectId.is_valid(plan_id):
        raise HTTPException(status_code=400, detail="Invalid plan ID")
    
    plan = await db.plans.find_one({"_id": ObjectId(plan_id)})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    request_obj = await db.requests.find_one({"_id": ObjectId(plan["request_id"])})
    project_obj = await db.projects.find_one({"_id": ObjectId(request_obj["project_id"])})
    
    # Verify buyer ownership
    if project_obj["buyer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    reason = reason_data.get("reason", "No reason provided")
    
    result = await db.plans.find_one_and_update(
        {"_id": ObjectId(plan_id)},
        {"$set": {
            "status": "rejected",
            "rejection_reason": reason,
            "updated_at": datetime.utcnow()
        }},
        return_document=True
    )
    
    result["id"] = str(result.pop("_id"))
    return Plan(**result)


@router.patch("/milestone/{milestone_id}", response_model=Milestone)
async def update_milestone(
    milestone_id: str,
    update: MilestoneUpdate,
    current_user: User = Depends(require_role(["problem_solver", "buyer"]))
):
    """Solver: Update milestone status; Buyer: Review progress"""
    db = get_database()
    
    if not ObjectId.is_valid(milestone_id):
        raise HTTPException(status_code=400, detail="Invalid milestone ID")
    
    milestone = await db.milestones.find_one({"_id": ObjectId(milestone_id)})
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    # Verify access
    plan = await db.plans.find_one({"_id": ObjectId(milestone["plan_id"])})
    request_obj = await db.requests.find_one({"_id": ObjectId(plan["request_id"])})
    project = await db.projects.find_one({"_id": ObjectId(request_obj["project_id"])})
    
    # Only solver or buyer can update
    if (current_user.role == "problem_solver" and current_user.id != plan["solver_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    if (current_user.role == "buyer" and current_user.id != project["buyer_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.milestones.find_one_and_update(
        {"_id": ObjectId(milestone_id)},
        {"$set": update_data},
        return_document=True
    )
    
    # Recalculate plan progress
    await recalculate_plan_progress(plan["_id"])
    
    result["id"] = str(result.pop("_id"))
    return Milestone(**result)


async def recalculate_plan_progress(plan_id):
    """Calculate progress percentage based on completed milestones"""
    db = get_database()
    
    milestones = []
    async for milestone in db.milestones.find({"plan_id": str(plan_id)}):
        milestones.append(milestone)
    
    if not milestones:
        progress = 0.0
    else:
        completed = sum(1 for m in milestones if m.get("status") == "completed")
        progress = (completed / len(milestones)) * 100
    
    await db.plans.update_one(
        {"_id": plan_id},
        {"$set": {
            "progress_percentage": progress,
            "updated_at": datetime.utcnow()
        }}
    )
