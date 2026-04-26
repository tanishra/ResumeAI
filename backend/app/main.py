import logging
import os
import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
from pythonjsonlogger import jsonlogger
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from backend.app.routers import resume
from backend.app.routers.resume import limiter

# Configure JSON logging
logger = logging.getLogger("backend")
logger.setLevel(logging.INFO)
logHandler = logging.StreamHandler(sys.stdout)
formatter = jsonlogger.JsonFormatter(
    fmt="%(asctime)s %(levelname)s %(name)s %(message)s"
)
logHandler.setFormatter(formatter)
if not logger.handlers:
    logger.addHandler(logHandler)

app = FastAPI(title="Resume Analyzer API", version="1.0.0")

# Add Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add ProxyHeadersMiddleware to properly handle forwarded IPs
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

# CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,https://resume-ai-five-snowy.vercel.app")
origins = [origin.strip() for origin in allowed_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(resume.router)

@app.get("/")
def health_check():
    logger.info("Root health check called")
    return {"status": "ok", "message": "Backend is running"}


@app.get("/health")
def health():
    return {"status": "ok"}
