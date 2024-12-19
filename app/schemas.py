from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class TweetBase(BaseModel):
    content: str

class TweetCreate(TweetBase):
    pass

class Tweet(TweetBase):
    id: int
    created_at: datetime
    author_id: int
    author: User

    class Config:
        from_attributes = True
