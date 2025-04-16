from typing import List
from fastapi import APIRouter, Response, UploadFile, File, HTTPException
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId
from .image_service import generate_image_from_profile, get_all_images, save_uploaded_images, get_image_by_id
from .models import GenerateRequest
from .database import profiles_collection


router = APIRouter()




load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
STABLE_DIFFUSION_API_KEY = os.getenv("STABLE_DIFFUSION_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")


@router.post("/upload-images/")
async def upload_images(files: List[UploadFile] = File(...)):
    """Upload multiple images and save to MongoDB GridFS"""
    file_ids, brand_profile_data = await save_uploaded_images(files, GOOGLE_API_KEY)
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
    """Get all available images and brand profiles"""
    try:
        image_ids = await get_all_images()

        profiles_cursor = profiles_collection.find({})
        profiles_list = await profiles_cursor.to_list(length=None)
        
        # Format profiles to match frontend expectations
        formatted_profiles = []
        for profile in profiles_list:
            formatted_profiles.append({
                "id": str(profile["_id"]),
                "prompt": profile.get("prompt", ""),
                "uploadedImages": profile.get("uploaded_images", []),
                "brandProfile": profile.get("json_profile", {}),
                "generatedImageId": profile.get("generated_image", "")
            })
        
        return {
            "images": image_ids,
            "profiles": formatted_profiles
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve images: {str(e)}")
    
@router.post("/generate-image/")
async def generate_image(request: GenerateRequest):
    """Generate an image based on a brand profile and prompt using Stable Diffusion"""
    try:
        # if not STABLE_DIFFUSION_API_KEY:
        #     raise HTTPException(status_code=500, detail="Stable Diffusion API key not configured")
        if not GOOGLE_API_KEY:
            raise HTTPException(status_code=500, detail="Google API key not configured")
        
        # Get the brand profile from database
        profile = await profiles_collection.find_one({"_id": ObjectId(request.profile_id)})
        if not profile:
            raise HTTPException(status_code=404, detail="Brand profile not found")
        
        brand_profile = profile.get("json_profile")
        
        # Generate the image
        generated_image_id = await generate_image_from_profile(
            brand_profile,
            request.prompt,
            GOOGLE_API_KEY,
            request.profile_id
        )
        
        if not generated_image_id:
            raise HTTPException(status_code=500, detail="Failed to generate image")
            
        # Update the profile with the generated image and prompt
        await profiles_collection.update_one(
            {"_id": ObjectId(request.profile_id)},
            {"$set": {"generated_image": generated_image_id, "prompt": request.prompt}}
        )
        
        return {"generatedImageId": generated_image_id, "prompt": request.prompt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating image: {str(e)}")