from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks, File, UploadFile, Form, Body, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import os
import json
import time
import uuid
import logging
import traceback
from jose import JWTError, jwt
import asyncio
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import random

# Configure logging with more verbose output for debugging
logging.basicConfig(
    level=logging.INFO if os.getenv("DEBUG", "false").lower() != "true" else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("api.log"),
    ]
)
logger = logging.getLogger("osint-api")

# Create rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app
app = FastAPI(title="OSINT Dashboard API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "development_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # Shorter lifetime for access tokens
REFRESH_TOKEN_EXPIRE_DAYS = 7     # Longer lifetime for refresh tokens

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Mock database (replace with actual DB in production)
mock_users = {
    "admin": {
        "id": "1",
        "username": "admin",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # "password"
        "role": "Administrator",
    }
}

mock_investigations = []
mock_profiles = []
mock_tasks = {}
mock_refresh_tokens = {}  # Store for refresh tokens

# Models
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class RefreshToken(BaseModel):
    refresh_token: str

class TokenData(BaseModel):
    username: Optional[str] = None
    exp: Optional[datetime] = None

class User(BaseModel):
    id: str
    username: str
    role: str

class UserInDB(User):
    hashed_password: str

class Investigation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    created: datetime = Field(default_factory=datetime.now)
    updated: datetime = Field(default_factory=datetime.now)
    profiles: int = 0
    confidence: int = 0
    inputs: Dict[str, Any] = {}

class Profile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    investigation_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    social_media: List[Dict[str, str]] = []
    confidence: int = 0
    created: datetime = Field(default_factory=datetime.now)
    updated: datetime = Field(default_factory=datetime.now)
    data: Dict[str, Any] = {}

class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    status: str = "pending"
    progress: int = 0
    result: Optional[Dict[str, Any]] = None
    created: datetime = Field(default_factory=datetime.now)
    updated: datetime = Field(default_factory=datetime.now)

class ErrorResponse(BaseModel):
    detail: str
    status_code: int
    path: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    trace_id: Optional[str] = None

# Authentication helpers
def verify_password(plain_password, hashed_password):
    # In production, use a proper password verification
    return plain_password == "password"  # For demo purposes only

def get_user(username: str):
    if username in mock_users:
        user_dict = mock_users[username]
        return UserInDB(**user_dict)
    return None

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(username: str):
    """Create a longer-lived refresh token"""
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    token_data = {
        "sub": username,
        "exp": expire,
        "type": "refresh"
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    # Store token in mock database (would be in Redis or DB in production)
    token_id = str(uuid.uuid4())
    mock_refresh_tokens[token_id] = {
        "token": token,
        "username": username,
        "expires": expire
    }
    
    return token

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

# Pagination helper
def paginate_results(items: list, page: int = 1, page_size: int = 10):
    """Helper function to paginate results"""
    start = (page - 1) * page_size
    end = start + page_size
    total_items = len(items)
    total_pages = (total_items + page_size - 1) // page_size  # Ceiling division
    
    # Return paginated items and metadata
    return {
        "items": items[start:end],
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler with detailed logging"""
    trace_id = str(uuid.uuid4())
    error_detail = str(exc)
    status_code = 500
    
    if isinstance(exc, HTTPException):
        status_code = exc.status_code
    
    # Log the error with stack trace for debugging
    logger.error(
        f"Exception occurred: {error_detail} | Trace ID: {trace_id}",
        exc_info=True
    )
    
    if os.getenv("DEBUG", "false").lower() == "true":
        # In debug mode, include the stack trace in the response
        error_detail = {
            "message": error_detail,
            "traceback": traceback.format_exc()
        }
    
    return JSONResponse(
        status_code=status_code,
        content=ErrorResponse(
            detail=error_detail,
            status_code=status_code,
            path=str(request.url),
            trace_id=trace_id
        ).dict()
    )

# Health check endpoint (no rate limiting)
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Metrics endpoint (no rate limiting)
@app.get("/api/metrics")
async def metrics():
    """Metrics endpoint for monitoring"""
    return {
        "api_requests": {
            "total": 1000,  # In a real app, this would be tracked
            "success": 950,
            "error": 50
        },
        "active_users": 10,
        "active_investigations": len(mock_investigations),
        "system": {
            "memory_usage": "256MB",  # Would use a library like psutil in production
            "cpu_usage": "5%"
        },
        "timestamp": datetime.now().isoformat()
    }

# Auth routes - rate limited more strictly
@app.post("/api/auth/login", response_model=Token)
@limiter.limit("10/minute")
async def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    logger.info(f"Login attempt for user: {form_data.username}")
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        logger.warning(f"Failed login attempt for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(user.username)
    
    # In a real app, set the refresh token as an HTTP-only cookie
    # For this example, we'll return it in the response
    
    logger.info(f"Successful login for user: {form_data.username}")
    response = JSONResponse(content={
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role
        }
    })
    
    # Set refresh token as HTTP-only cookie
    response.set_cookie(
        key="refresh_token", 
        value=refresh_token, 
        httponly=True,
        secure=True,  # Requires HTTPS
        samesite="strict",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60  # in seconds
    )
    
    return response

@app.post("/api/auth/refresh", response_model=Token)
@limiter.limit("30/minute")
async def refresh_access_token(request: Request):
    """Generate a new access token using a refresh token"""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is missing",
        )
    
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Check token type and expiration
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )
            
        username = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        
        # Create new access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": username}, expires_delta=access_token_expires
        )
        
        user = get_user(username)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role
            }
        }
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

@app.get("/api/auth/me", response_model=User)
@limiter.limit("100/minute")
async def read_users_me(request: Request, current_user: User = Depends(get_current_user)):
    return current_user

# Investigation routes (rate limited to prevent abuse)
@app.post("/api/investigations", response_model=Investigation)
@limiter.limit("60/minute")
async def create_investigation(request: Request, investigation: Investigation, current_user: User = Depends(get_current_user)):
    logger.info(f"Creating new investigation: {investigation.title}")
    mock_investigations.append(investigation.dict())
    return investigation

@app.get("/api/investigations")
@limiter.limit("100/minute")
async def get_investigations(
    request: Request,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Page size"),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Fetching investigations. Page: {page}, Page size: {page_size}")
    
    # Apply filters
    filtered_investigations = mock_investigations
    
    if status:
        filtered_investigations = [i for i in filtered_investigations if i["status"] == status]
    
    if priority:
        filtered_investigations = [i for i in filtered_investigations if i["priority"] == priority]
    
    if search:
        filtered_investigations = [
            i for i in filtered_investigations 
            if search.lower() in i["title"].lower() or 
               (i.get("description") and search.lower() in i["description"].lower())
        ]
    
    # Sort by most recently updated
    sorted_investigations = sorted(
        filtered_investigations, 
        key=lambda x: x["updated"], 
        reverse=True
    )
    
    # Paginate results
    result = paginate_results(sorted_investigations, page, page_size)
    
    return result

@app.get("/api/investigations/{investigation_id}", response_model=Investigation)
@limiter.limit("100/minute")
async def get_investigation(request: Request, investigation_id: str, current_user: User = Depends(get_current_user)):
    logger.info(f"Fetching investigation ID: {investigation_id}")
    for inv in mock_investigations:
        if inv["id"] == investigation_id:
            return inv
    
    logger.warning(f"Investigation not found: {investigation_id}")
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Investigation with id {investigation_id} not found"
    )

@app.put("/api/investigations/{investigation_id}", response_model=Investigation)
@limiter.limit("60/minute")
async def update_investigation(
    request: Request,
    investigation_id: str, 
    investigation_update: Investigation, 
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Updating investigation ID: {investigation_id}")
    for i, inv in enumerate(mock_investigations):
        if inv["id"] == investigation_id:
            # Ensure id and created date don't change
            investigation_update.id = investigation_id
            investigation_update.created = inv["created"]
            investigation_update.updated = datetime.now()
            
            # Update the investigation
            mock_investigations[i] = investigation_update.dict()
            return investigation_update
    
    logger.warning(f"Cannot update: Investigation not found: {investigation_id}")
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Investigation with id {investigation_id} not found"
    )

@app.delete("/api/investigations/{investigation_id}")
@limiter.limit("30/minute")
async def delete_investigation(request: Request, investigation_id: str, current_user: User = Depends(get_current_user)):
    logger.info(f"Deleting investigation ID: {investigation_id}")
    for i, inv in enumerate(mock_investigations):
        if inv["id"] == investigation_id:
            del mock_investigations[i]
            return {"message": "Investigation deleted successfully"}
    
    logger.warning(f"Cannot delete: Investigation not found: {investigation_id}")
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Investigation with id {investigation_id} not found"
    )

# Profile routes
@app.post("/api/profiles", response_model=Profile)
@limiter.limit("60/minute")
async def create_profile(request: Request, profile: Profile, current_user: User = Depends(get_current_user)):
    logger.info(f"Creating new profile for investigation: {profile.investigation_id}")
    # Ensure the investigation exists
    investigation_exists = False
    for inv in mock_investigations:
        if inv["id"] == profile.investigation_id:
            investigation_exists = True
            # Increment profile count in the investigation
            inv["profiles"] += 1
            break
    
    if not investigation_exists:
        logger.warning(f"Cannot create profile: Investigation not found: {profile.investigation_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Investigation with id {profile.investigation_id} not found"
        )
    
    mock_profiles.append(profile.dict())
    return profile

@app.get("/api/profiles/{profile_id}", response_model=Profile)
@limiter.limit("100/minute")
async def get_profile(request: Request, profile_id: str, current_user: User = Depends(get_current_user)):
    logger.info(f"Fetching profile ID: {profile_id}")
    for profile in mock_profiles:
        if profile["id"] == profile_id:
            return profile
    
    logger.warning(f"Profile not found: {profile_id}")
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Profile with id {profile_id} not found"
    )

@app.get("/api/profiles/search")
@limiter.limit("60/minute")
async def search_profiles(
    request: Request,
    name: Optional[str] = None,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Page size"),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Searching profiles. Name: {name}, Email: {email}, Phone: {phone}")
    filtered_profiles = mock_profiles
    
    if name:
        filtered_profiles = [p for p in filtered_profiles if p.get("name") and name.lower() in p["name"].lower()]
    
    if email:
        filtered_profiles = [p for p in filtered_profiles if p.get("email") and email.lower() in p["email"].lower()]
    
    if phone:
        filtered_profiles = [p for p in filtered_profiles if p.get("phone") and phone in p["phone"]]
    
    return paginate_results(filtered_profiles, page, page_size)

# Task routes
@app.post("/api/tasks/{task_type}", response_model=Task)
@limiter.limit("30/minute")
async def create_task(
    request: Request,
    task_type: str,
    background_tasks: BackgroundTasks,
    payload: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Creating new task of type: {task_type}")
    # Create a new task
    task = Task(id=str(uuid.uuid4()), type=task_type)
    mock_tasks[task.id] = task.dict()
    
    # Execute the task in the background
    background_tasks.add_task(process_task, task.id, task_type, payload)
    
    return task

@app.get("/api/tasks/{task_id}", response_model=Task)
@limiter.limit("120/minute")
async def get_task_status(request: Request, task_id: str, current_user: User = Depends(get_current_user)):
    logger.info(f"Fetching task status for ID: {task_id}")
    if task_id in mock_tasks:
        return mock_tasks[task_id]
    
    logger.warning(f"Task not found: {task_id}")
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Task with id {task_id} not found"
    )

@app.post("/api/tasks/{task_id}/cancel")
@limiter.limit("30/minute")
async def cancel_task(request: Request, task_id: str, current_user: User = Depends(get_current_user)):
    logger.info(f"Cancelling task ID: {task_id}")
    if task_id in mock_tasks:
        if mock_tasks[task_id]["status"] == "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel completed task"
            )
        
        mock_tasks[task_id]["status"] = "cancelled"
        return {"message": "Task cancelled successfully"}
    
    logger.warning(f"Cannot cancel: Task not found: {task_id}")
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Task with id {task_id} not found"
    )

# Tool routes 
@app.post("/api/tools/email-scan")
@limiter.limit("20/minute")
async def run_email_scan(
    request: Request,
    payload: Dict[str, str],
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Starting email scan for: {payload.get('email', 'unknown')}")
    if "email" not in payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    # Create a new task
    task = Task(id=str(uuid.uuid4()), type="email_scan")
    mock_tasks[task.id] = task.dict()
    
    # Start processing in the background
    background_tasks.add_task(process_email_scan, task.id, payload["email"])
    
    return {"task_id": task.id}

@app.post("/api/tools/phone-scan")
@limiter.limit("20/minute")
async def run_phone_scan(
    request: Request,
    payload: Dict[str, str],
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Starting phone scan for: {payload.get('phone', 'unknown')}")
    if "phone" not in payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number is required"
        )
    
    # Create a new task
    task = Task(id=str(uuid.uuid4()), type="phone_scan")
    mock_tasks[task.id] = task.dict()
    
    # Start processing in the background
    background_tasks.add_task(process_phone_scan, task.id, payload["phone"])
    
    return {"task_id": task.id}

@app.post("/api/tools/social-scan")
@limiter.limit("20/minute")
async def run_social_scan(
    request: Request,
    payload: Dict[str, str],
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Starting social media scan for: {payload.get('username', 'unknown')}")
    if "username" not in payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is required"
        )
    
    # Create a new task
    task = Task(id=str(uuid.uuid4()), type="social_scan")
    mock_tasks[task.id] = task.dict()
    
    # Start processing in the background
    background_tasks.add_task(process_social_scan, task.id, payload["username"])
    
    return {"task_id": task.id}

@app.post("/api/tools/image-scan")
@limiter.limit("15/minute")
async def run_image_scan(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Starting image scan for file: {file.filename}")
    # Check file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Create a new task
    task_id = str(uuid.uuid4())
    mock_tasks[task_id] = Task(id=task_id, type="image_scan").dict()
    
    # In a real app, save the file and process it
    # For demo purposes, we'll just simulate progress updates
    
    return {"task_id": task_id}

# Background task processors
async def process_task(task_id: str, task_type: str, payload: Dict[str, Any]):
    """General task processor"""
    # Simulate processing time
    mock_tasks[task_id]["status"] = "processing"
    
    for i in range(10):
        mock_tasks[task_id]["progress"] = (i + 1) * 10
        await asyncio.sleep(0.5)  # Simulate work
    
    mock_tasks[task_id]["status"] = "completed"
    mock_tasks[task_id]["result"] = {"message": f"Task {task_type} completed successfully"}

async def process_email_scan(task_id: str, email: str):
    """Process email scan task"""
    try:
        # Simulate processing time
        mock_tasks[task_id]["status"] = "processing"
        
        for i in range(5):
            mock_tasks[task_id]["progress"] = (i + 1) * 20
            await asyncio.sleep(0.5)  # Simulate work
        
        # Simulate results
        mock_tasks[task_id]["status"] = "completed"
        mock_tasks[task_id]["result"] = {
            "email": email,
            "found_accounts": ["LinkedIn", "Twitter"],
            "data_breaches": 2,
            "domains": ["example.com", "gmail.com"]
        }
    except Exception as e:
        logger.error(f"Error in email scan task: {str(e)}", exc_info=True)
        mock_tasks[task_id]["status"] = "failed"
        mock_tasks[task_id]["result"] = {"error": str(e)}

async def process_phone_scan(task_id: str, phone: str):
    """Process phone scan task"""
    try:
        # Simulate processing time
        mock_tasks[task_id]["status"] = "processing"
        
        for i in range(5):
            mock_tasks[task_id]["progress"] = (i + 1) * 20
            await asyncio.sleep(0.5)  # Simulate work
        
        # Simulate results
        mock_tasks[task_id]["status"] = "completed"
        mock_tasks[task_id]["result"] = {
            "phone": phone,
            "country": "United States",
            "carrier": "Verizon",
            "type": "mobile",
            "validity": True
        }
    except Exception as e:
        logger.error(f"Error in phone scan task: {str(e)}", exc_info=True)
        mock_tasks[task_id]["status"] = "failed"
        mock_tasks[task_id]["result"] = {"error": str(e)}

async def process_social_scan(task_id: str, username: str):
    """Process social media scan task"""
    try:
        # Simulate processing time
        mock_tasks[task_id]["status"] = "processing"
        
        for i in range(5):
            mock_tasks[task_id]["progress"] = (i + 1) * 20
            await asyncio.sleep(0.5)  # Simulate work
        
        # Simulate results
        mock_tasks[task_id]["status"] = "completed"
        mock_tasks[task_id]["result"] = {
            "username": username,
            "found_on": [
                {"platform": "Twitter", "url": f"https://twitter.com/{username}"},
                {"platform": "Instagram", "url": f"https://instagram.com/{username}"},
                {"platform": "GitHub", "url": f"https://github.com/{username}"}
            ],
            "not_found_on": ["Facebook", "LinkedIn", "TikTok"]
        }
    except Exception as e:
        logger.error(f"Error in social scan task: {str(e)}", exc_info=True)
        mock_tasks[task_id]["status"] = "failed"
        mock_tasks[task_id]["result"] = {"error": str(e)}

# Add graph relationship endpoint
@app.get("/api/graph")
@limiter.limit("60/minute")
async def get_graph_data(
    request: Request,
    investigation_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500, description="Max number of nodes"),
    current_user: User = Depends(get_current_user)
):
    """
    Get relationship graph data for visualization
    In a real app, this would query Neo4j for entity relationships
    """
    logger.info(f"Fetching graph data. Investigation ID: {investigation_id}, Limit: {limit}")
    
    # This is a mock implementation
    # In a real app, you would use a Cypher query to Neo4j like:
    # MATCH (n:Person)-[r:KNOWS]->(m) WHERE n.investigation_id = $investigation_id RETURN n, r, m LIMIT $limit
    
    # Create mock graph data
    nodes = []
    links = []
    
    # Use actual profiles if available
    profiles_to_use = [p for p in mock_profiles if investigation_id is None or p["investigation_id"] == investigation_id]
    
    if not profiles_to_use:
        # Generate some mock profiles if none exist
        for i in range(min(10, limit)):
            profile_id = str(uuid.uuid4())
            nodes.append({
                "id": profile_id,
                "name": f"Person {i+1}",
                "type": "person",
                "properties": {
                    "confidence": random.randint(30, 95)
                }
            })
    else:
        # Use existing profiles
        for profile in profiles_to_use[:limit]:
            nodes.append({
                "id": profile["id"],
                "name": profile.get("name", "Unknown"),
                "type": "person",
                "properties": {
                    "confidence": profile.get("confidence", 50),
                    "email": profile.get("email"),
                    "phone": profile.get("phone")
                }
            })
    
    # Generate some mock organizations
    org_types = ["company", "social_media", "website", "organization"]
    for i in range(min(5, limit // 2)):
        org_id = str(uuid.uuid4())
        nodes.append({
            "id": org_id,
            "name": f"{random.choice(['Acme', 'Global', 'Tech', 'Web', 'Social'])} {random.choice(['Inc', 'Ltd', 'Corp', 'Network', 'Platform'])}",
            "type": random.choice(org_types),
            "properties": {
                "founded": random.randint(1990, 2022)
            }
        })
    
    # Generate links between nodes
    relationship_types = ["WORKS_AT", "MEMBER_OF", "KNOWS", "CONTACTED", "VISITED"]
    
    # Connect people to organizations
    person_nodes = [n for n in nodes if n["type"] == "person"]
    org_nodes = [n for n in nodes if n["type"] != "person"]
    
    for person in person_nodes:
        # Connect to 1-3 organizations
        for _ in range(random.randint(1, min(3, len(org_nodes)))):
            org = random.choice(org_nodes)
            links.append({
                "source": person["id"],
                "target": org["id"],
                "type": random.choice(relationship_types),
                "properties": {
                    "strength": random.randint(1, 10),
                    "since": f"202{random.randint(0, 3)}"
                }
            })
    
    # Connect people to people
    for i in range(len(person_nodes)):
        for j in range(i+1, len(person_nodes)):
            # 40% chance of connection between people
            if random.random() < 0.4:
                links.append({
                    "source": person_nodes[i]["id"],
                    "target": person_nodes[j]["id"],
                    "type": "KNOWS",
                    "properties": {
                        "strength": random.randint(1, 10)
                    }
                })
    
    return {
        "nodes": nodes,
        "links": links
    }

# Run with: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)