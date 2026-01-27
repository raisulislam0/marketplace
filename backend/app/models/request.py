from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId


class RequestBase(BaseModel):
    project_id: str
    message: Optional[str] = None


class RequestCreate(RequestBase):
    pass


class Request(RequestBase):
    id: str
    solver_id: str
    status: Literal["pending", "accepted", "rejected"] = "pending"
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str}
    )


class RequestUpdate(BaseModel):
    status: Literal["pending", "accepted", "rejected"]

