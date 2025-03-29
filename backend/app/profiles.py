from fastapi import APIRouter, HTTPException, Depends
import os

from .models import BrandProfileRequest
# from .profile_service import create_brand_profile

router = APIRouter()

# Get API keys from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
STABLE_DIFFUSION_API_KEY = os.getenv("STABLE_DIFFUSION_API_KEY")

@router.post("/generate-brand-profile/")
async def generate_brand_profile(request: BrandProfileRequest):
    """Generate a brand profile based on uploaded images and a prompt"""
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")

    if not STABLE_DIFFUSION_API_KEY:
        raise HTTPException(status_code=500, detail="Stable Diffusion API key not configured")

    if not request.images:
        raise HTTPException(status_code=400, detail="No images provided")
    
    try:
        # result = await create_brand_profile(
        #     request.images, 
        #     request.prompt, 
        #     OPENAI_API_KEY, 
        #     STABLE_DIFFUSION_API_KEY
        # )
        result = ''
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating brand profile: {str(e)}")