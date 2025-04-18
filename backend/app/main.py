from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    #change in prod and add to env
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
     expose_headers=["*"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

app
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Genie backend is running!"}