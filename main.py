from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi import Request
from app.database import engine
from app.models import Base
from app.routers import users, tweets, auth, friends, wall

app = FastAPI(title="Twitter Clone API")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(tweets.router, prefix="/api")
app.include_router(friends.router, prefix="/api")
app.include_router(wall.router, prefix="/api")

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/login.html", response_class=HTMLResponse)
async def login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/register.html", response_class=HTMLResponse)
async def register(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.get("/users/{username}", response_class=HTMLResponse)
async def user_profile(request: Request, username: str):
    return templates.TemplateResponse("profile.html", {"request": request, "username": username})

@app.get("/users/profile/{username}", response_class=HTMLResponse)
async def user_profile(request: Request, username: str):
    return templates.TemplateResponse("profile.html", {"request": request, "username": username})
