import os
import time
import uuid
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="AI Vision Mock API", version="1.0")

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change to specific frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str

class ImageAnalyzeRequest(BaseModel):
    model_config = {'protected_namespaces': ()}
    image_url: str
    model_type: str = "object_detection" # e.g., object_detection, face_recognition

class TextAnalyzeRequest(BaseModel):
    text: str

# In-memory database for mock AI jobs
fake_db = {"jobs": {}}

# --- HEALTH CHECK ENDPOINT ---
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for Docker container, Kubernetes, and monitoring tools"""
    return {
        "status": "healthy",
        "service": "AI Vision Mock API",
        "uptime_sec": time.time(),
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# --- 1. AUTHENTICATION ENDPOINTS (3) ---

@app.post("/api/auth/register", tags=["Auth"])
async def register(user: RegisterRequest):
    return {"message": "User registered successfully", "user_id": str(uuid.uuid4())}

@app.post("/api/auth/login", tags=["Auth"])
async def login(credentials: LoginRequest):
    if credentials.username == "admin" and credentials.password == "admin123":
        return {"access_token": "mock-jwt-token-777", "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/auth/me", tags=["Auth"])
async def get_profile(authorization: str = Header(None)):
    if authorization != "Bearer mock-jwt-token-777":
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"username": "admin", "email": "admin@visionapp.com", "role": "developer"}


# --- 2. AI / VISION ENDPOINTS (4) ---

@app.post("/api/vision/analyze-image", tags=["AI Vision"])
async def start_image_analysis(req: ImageAnalyzeRequest):
    """Simulates sending an image to an AI model for processing (Async)"""
    job_id = str(uuid.uuid4())
    # Mocking a job state
    fake_db["jobs"][job_id] = {
        "status": "processing",
        "start_time": time.time(),
        "model": req.model_type,
        "image_url": req.image_url
    }
    return {"message": "Image analysis started", "job_id": job_id}

@app.get("/api/vision/status/{job_id}", tags=["AI Vision"])
async def check_job_status(job_id: str):
    """Frontend checks this endpoint to see if AI has finished processing"""
    job = fake_db["jobs"].get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Simulate processing time (completes after 5 seconds for smooth UI feedback)
    elapsed = time.time() - job["start_time"]
    if elapsed > 5:
        job["status"] = "completed"
        
    return {
        "job_id": job_id,
        "status": job["status"],
        "progress_percent": min(100, int((elapsed / 5.0) * 100)) if job["status"] != "completed" else 100
    }

@app.get("/api/vision/result/{job_id}", tags=["AI Vision"])
async def get_vision_result(job_id: str):
    """Retrieves the AI bounding boxes or classification results"""
    job = fake_db["jobs"].get(job_id)
    if not job or job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job not ready or not found")
    
    # Mock AI Output Data
    return {
        "job_id": job_id,
        "model_type": job.get("model", "object_detection"),
        "image_url": job.get("image_url", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop"),
        "detections": [
            {"label": "person", "confidence": 0.98, "box": [50, 40, 180, 260]},
            {"label": "car", "confidence": 0.89, "box": [240, 120, 420, 280]},
            {"label": "laptop", "confidence": 0.94, "box": [120, 200, 210, 270]}
        ],
        "resolution": "1920x1080"
    }

@app.post("/api/vision/analyze-text", tags=["AI Vision"])
async def analyze_text(req: TextAnalyzeRequest):
    """A synchronous AI endpoint (e.g., NLP task associated with vision)"""
    return {
        "original_text": req.text,
        "sentiment": "positive",
        "keywords": ["ai", "devops", "interview"]
    }

# --- STATIC FILES FOR FRONTEND ---
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")