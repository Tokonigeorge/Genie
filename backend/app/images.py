from typing import List
from fastapi import APIRouter, Response, UploadFile, File, HTTPException
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId
from .image_service import get_all_images, save_uploaded_images, get_image_by_id
from .models import GenerateRequest

router = APIRouter()



load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
STABLE_DIFFUSION_API_KEY = os.getenv("STABLE_DIFFUSION_API_KEY")

@router.post("/upload-images/")
async def upload_images(files: List[UploadFile] = File(...)):
    """Upload multiple images and save to MongoDB GridFS"""
    file_ids, brand_profile_data = await save_uploaded_images(files, OPENAI_API_KEY, STABLE_DIFFUSION_API_KEY)
    response = {"uploaded_files": file_ids}
    if brand_profile_data:
        response["brandProfile"] = brand_profile_data.get("brandProfile")
        response["generatedImageId"] = brand_profile_data.get("generatedImageId")
    
    return response

@router.get("/image/{image_id}")
async def get_image(image_id: str):
    """Get an image by its ID from MongoDB GridFS"""
    try:
        image_data = await get_image_by_id(image_id)
        return Response(content=image_data, media_type="image/jpeg")
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Image not found: {str(e)}")

@router.get("/images/")
async def get_images():
    """Get all available images"""
    try:
        image_ids = await get_all_images()
        return {"images": image_ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve images: {str(e)}")