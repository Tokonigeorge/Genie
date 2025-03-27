
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import os
from typing import List
from pydantic import BaseModel

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("backend/uploads", exist_ok=True)

# Mount the uploads directory
app.mount("/uploads", StaticFiles(directory="backend/uploads"), name="uploads")

class GenerateRequest(BaseModel):
    prompt: str

@app.post("/upload-images/")
async def upload_images(files: List[UploadFile] = File(...)):
    uploaded_files = []
    for file in files:
        file_path = f"backend/uploads/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        uploaded_files.append(file.filename)
    return {"uploaded_files": uploaded_files}

@app.post("/generate/")
async def generate_image(request: GenerateRequest):
    # TODO: Implement actual image generation logic
    return {
        "message": "Image generation requested",
        "prompt": request.prompt
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
