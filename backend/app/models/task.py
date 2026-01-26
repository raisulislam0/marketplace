from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId


class TaskBase(BaseModel):
    title: str
    description: str
    deadline: Optional[datetime] = None
    metadata: Optional[dict] = None


class TaskCreate(TaskBase):
    project_id: str


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    metadata: Optional[dict] = None
    status: Optional[Literal["pending", "in_progress", "submitted", "completed", "rejected"]] = None


class Task(TaskBase):
    id: str = Field(alias="_id")
    project_id: str
    solver_id: str
    status: Literal["pending", "in_progress", "submitted", "completed", "rejected"] = "pending"
    submission_file: Optional[str] = None
    submission_date: Optional[datetime] = None
    review_comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

