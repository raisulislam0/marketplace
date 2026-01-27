from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId


class MilestoneBase(BaseModel):
    title: str
    description: str
    deadline: Optional[datetime] = None
    estimated_hours: Optional[float] = None


class Milestone(MilestoneBase):
    id: str
    plan_id: str
    status: Literal["pending", "in_progress", "completed", "rejected"] = "pending"
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str}
    )


class PlanBase(BaseModel):
    request_id: str
    title: str
    description: str
    estimated_days: Optional[int] = None
    milestones: list[MilestoneBase] = []


class PlanCreate(PlanBase):
    pass


class PlanUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    estimated_days: Optional[int] = None
    status: Optional[Literal["pending", "approved", "rejected", "completed"]] = None


class Plan(PlanBase):
    id: str
    solver_id: str
    status: Literal["pending", "approved", "rejected", "completed"] = "pending"
    progress_percentage: float = 0.0
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str}
    )


class MilestoneUpdate(BaseModel):
    status: Optional[Literal["pending", "in_progress", "completed", "rejected"]] = None
    notes: Optional[str] = None
    completed_at: Optional[datetime] = None
