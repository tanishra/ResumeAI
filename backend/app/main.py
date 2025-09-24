from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routers import resume

app = FastAPI(title="Resume Analyzer API", version="1.0.0")

# Allow only localhost (since no production domain yet)
origins = ["http://localhost:3000"]

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
    return {"status": "ok", "message": "Backend is running"}
