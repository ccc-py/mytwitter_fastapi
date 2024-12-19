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

class UserPublic(BaseModel):
    id: int
    username: str
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

class FriendRequest(BaseModel):
    sender_id: int
    receiver_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class FriendRequestCreate(BaseModel):
    receiver_id: int

class FriendResponse(BaseModel):
    message: str

class WallMessageBase(BaseModel):
    content: str

class WallMessageCreate(WallMessageBase):
    wall_owner_id: int

class WallMessage(WallMessageBase):
    id: int
    created_at: datetime
    author_id: int
    wall_owner_id: int
    author: UserPublic
    wall_owner: UserPublic

    class Config:
        from_attributes = True
