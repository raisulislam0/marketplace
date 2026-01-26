from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class UserRole(str):
    ADMIN = "admin"
    BUYER = "buyer"
    PROBLEM_SOLVER = "problem_solver"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Literal["admin", "buyer", "problem_solver"] = "problem_solver"


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[Literal["admin", "buyer", "problem_solver"]] = None


class UserInDB(UserBase):
    id: str = Field(alias="_id")
    hashed_password: str
    created_at: datetime
    updated_at: datetime
    profile: Optional[dict] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class User(UserBase):
    id: str
    created_at: datetime
    profile: Optional[dict] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class ProblemSolverProfile(BaseModel):
    bio: Optional[str] = None
    skills: list[str] = []
    experience_years: Optional[int] = None
    portfolio_url: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None

