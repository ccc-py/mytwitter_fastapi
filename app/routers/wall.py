from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db
from typing import List
from sqlalchemy import desc

router = APIRouter()

@router.post("/wall-messages/", response_model=schemas.WallMessage)
async def create_wall_message(
    message: schemas.WallMessageCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Check if wall owner exists
    wall_owner = db.query(models.User).filter(models.User.id == message.wall_owner_id).first()
    if not wall_owner:
        raise HTTPException(
            status_code=404,
            detail="Wall owner not found"
        )
    
    # Create new wall message
    db_message = models.WallMessage(
        content=message.content,
        author_id=current_user.id,
        wall_owner_id=message.wall_owner_id
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/users/{user_id}/wall", response_model=List[schemas.WallMessage])
async def get_user_wall(
    user_id: int,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    # Check if user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    # Get wall messages
    messages = db.query(models.WallMessage)\
        .filter(models.WallMessage.wall_owner_id == user_id)\
        .order_by(desc(models.WallMessage.created_at))\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return messages

@router.delete("/wall-messages/{message_id}")
async def delete_wall_message(
    message_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Get the message
    message = db.query(models.WallMessage).filter(models.WallMessage.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found"
        )
    
    # Check if user is authorized to delete
    if message.author_id != current_user.id and message.wall_owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete this message"
        )
    
    # Delete the message
    db.delete(message)
    db.commit()
    
    return {"message": "Wall message deleted successfully"}
