from fastapi import FastAPI
from app.api.v1 import auth

app = FastAPI()
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Genie backend is running!"}