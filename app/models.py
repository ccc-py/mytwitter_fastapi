from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Table, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

# Association table for friends
friends = Table(
    "friends",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("friend_id", Integer, ForeignKey("users.id"), primary_key=True)
)

# Association table for friend requests
friend_requests = Table(
    "friend_requests",
    Base.metadata,
    Column("sender_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("receiver_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("status", String, default="pending"),  # pending, accepted, rejected
    Column("created_at", DateTime, default=datetime.utcnow)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    tweets = relationship("Tweet", back_populates="author")
    wall_messages = relationship("WallMessage", 
                               foreign_keys="[WallMessage.wall_owner_id]",
                               back_populates="wall_owner")
    messages_written = relationship("WallMessage", 
                                  foreign_keys="[WallMessage.author_id]",
                                  back_populates="author")
    
    followers = relationship(
        "User",
        secondary="followers",
        primaryjoin="User.id==followers.c.followed_id",
        secondaryjoin="User.id==followers.c.follower_id",
        backref="following"
    )
    
    friends = relationship(
        "User",
        secondary=friends,
        primaryjoin="User.id==friends.c.user_id",
        secondaryjoin="User.id==friends.c.friend_id",
        backref="friended_by"
    )
    
    sent_friend_requests = relationship(
        "User",
        secondary=friend_requests,
        primaryjoin="User.id==friend_requests.c.sender_id",
        secondaryjoin="User.id==friend_requests.c.receiver_id",
        backref="received_friend_requests"
    )

class Tweet(Base):
    __tablename__ = "tweets"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    author_id = Column(Integer, ForeignKey("users.id"))
    
    author = relationship("User", back_populates="tweets")

class WallMessage(Base):
    __tablename__ = "wall_messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    author_id = Column(Integer, ForeignKey("users.id"))
    wall_owner_id = Column(Integer, ForeignKey("users.id"))
    
    author = relationship("User", foreign_keys=[author_id], back_populates="messages_written")
    wall_owner = relationship("User", foreign_keys=[wall_owner_id], back_populates="wall_messages")

# Association table for followers
followers = Table(
    "followers",
    Base.metadata,
    Column("follower_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("followed_id", Integer, ForeignKey("users.id"), primary_key=True)
)
