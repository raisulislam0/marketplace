from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId


class ProjectBase(BaseModel):
    title: str
    description: str
    budget: Optional[float] = None
    deadline: Optional[datetime] = None
    requirements: list[str] = []


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    budget: Optional[float] = None
    deadline: Optional[datetime] = None
    requirements: Optional[list[str]] = None
    status: Optional[Literal["open", "assigned", "in_progress", "completed", "cancelled"]] = None


class Project(ProjectBase):
    id: str
    buyer_id: str
    assigned_solver_id: Optional[str] = None
    status: Literal["open", "assigned", "in_progress", "completed", "cancelled"] = "open"
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str}
    )

