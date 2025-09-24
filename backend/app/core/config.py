from fastapi.middleware.cors import CORSMiddleware

# Allowed origins (local dev only)
ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Next.js dev server
]
