from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db
from typing import List

router = APIRouter()

@router.post("/friend-requests/", response_model=schemas.FriendResponse)
async def send_friend_request(
    request: schemas.FriendRequestCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if request.receiver_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot send a friend request to yourself"
        )
    
    # Check if user exists
    receiver = db.query(models.User).filter(models.User.id == request.receiver_id).first()
    if not receiver:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    # Check if they are already friends
    if receiver in current_user.friends:
        raise HTTPException(
            status_code=400,
            detail="You are already friends with this user"
        )
    
    # Check if a friend request already exists
    if receiver in current_user.sent_friend_requests:
        raise HTTPException(
            status_code=400,
            detail="Friend request already sent"
        )
    
    current_user.sent_friend_requests.append(receiver)
    db.commit()
    
    return {"message": f"Friend request sent to {receiver.username}"}

@router.get("/friend-requests/", response_model=List[schemas.UserPublic])
async def get_friend_requests(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return current_user.received_friend_requests

@router.post("/friend-requests/{user_id}/accept", response_model=schemas.FriendResponse)
async def accept_friend_request(
    user_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    sender = db.query(models.User).filter(models.User.id == user_id).first()
    if not sender:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    if sender not in current_user.received_friend_requests:
        raise HTTPException(
            status_code=400,
            detail="No friend request from this user"
        )
    
    # Remove from friend requests
    current_user.received_friend_requests.remove(sender)
    
    # Add as friend
    current_user.friends.append(sender)
    sender.friends.append(current_user)
    
    db.commit()
    
    return {"message": f"You are now friends with {sender.username}"}

@router.post("/friend-requests/{user_id}/reject", response_model=schemas.FriendResponse)
async def reject_friend_request(
    user_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    sender = db.query(models.User).filter(models.User.id == user_id).first()
    if not sender:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    if sender not in current_user.received_friend_requests:
        raise HTTPException(
            status_code=400,
            detail="No friend request from this user"
        )
    
    current_user.received_friend_requests.remove(sender)
    db.commit()
    
    return {"message": f"Friend request from {sender.username} rejected"}

@router.get("/friends/", response_model=List[schemas.UserPublic])
async def get_friends(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return current_user.friends

@router.delete("/friends/{user_id}", response_model=schemas.FriendResponse)
async def remove_friend(
    user_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    friend = db.query(models.User).filter(models.User.id == user_id).first()
    if not friend:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    if friend not in current_user.friends:
        raise HTTPException(
            status_code=400,
            detail="This user is not your friend"
        )
    
    current_user.friends.remove(friend)
    friend.friends.remove(current_user)
    db.commit()
    
    return {"message": f"Removed {friend.username} from friends"}
