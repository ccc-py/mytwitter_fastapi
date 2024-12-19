from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db
from typing import List

router = APIRouter()

@router.post("/tweets/", response_model=schemas.Tweet)
def create_tweet(
    tweet: schemas.TweetCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_tweet = models.Tweet(content=tweet.content, author_id=current_user.id)
    db.add(db_tweet)
    db.commit()
    db.refresh(db_tweet)
    return db_tweet

@router.get("/tweets/", response_model=List[schemas.Tweet])
def read_tweets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tweets = db.query(models.Tweet).offset(skip).limit(limit).all()
    return tweets

@router.get("/tweets/{tweet_id}", response_model=schemas.Tweet)
def read_tweet(tweet_id: int, db: Session = Depends(get_db)):
    tweet = db.query(models.Tweet).filter(models.Tweet.id == tweet_id).first()
    if tweet is None:
        raise HTTPException(status_code=404, detail="Tweet not found")
    return tweet

@router.get("/tweets/user/{user_id}", response_model=List[schemas.Tweet])
def read_user_tweets(user_id: int, db: Session = Depends(get_db)):
    tweets = db.query(models.Tweet).filter(models.Tweet.author_id == user_id).order_by(models.Tweet.created_at.desc()).all()
    return tweets

@router.delete("/tweets/{tweet_id}")
def delete_tweet(
    tweet_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    tweet = db.query(models.Tweet).filter(models.Tweet.id == tweet_id).first()
    if tweet is None:
        raise HTTPException(status_code=404, detail="Tweet not found")
    if tweet.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this tweet")
    
    db.delete(tweet)
    db.commit()
    return {"message": "Tweet deleted successfully"}
