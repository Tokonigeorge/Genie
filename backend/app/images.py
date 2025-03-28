from typing import List
from fastapi import APIRouter, Response, UploadFile, File, HTTPException

from bson.objectid import ObjectId
from .image_service import get_all_images, save_uploaded_images, get_image_by_id
from .models import GenerateRequest

router = APIRouter()

@router.post("/upload-images/")
async def upload_images(files: List[UploadFile] = File(...)):
    """Upload multiple images and save to MongoDB GridFS"""
    uploaded_files = await save_uploaded_images(files)
    return {"uploaded_files": uploaded_files}

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