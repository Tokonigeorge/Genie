import base64

import time
import aiohttp
from bson.binary import Binary

from bson.objectid import ObjectId
from .database import profiles_collection, db
from motor.motor_asyncio import AsyncIOMotorGridFSBucket

# Initialize GridFS for file storage
fs = AsyncIOMotorGridFSBucket(db)

async def save_uploaded_images(files):
    """Save uploaded images to MongoDB GridFS and return their IDs"""
    file_ids = []
    for file in files:
        content = await file.read()
        file_id = await fs.upload_from_stream(
            file.filename,
            content,
            metadata={"content_type": file.content_type}
        )
        file_ids.append(str(file_id))
    return file_ids

async def get_image_by_id(image_id:str):
    """Retrieve image data from GridFS by ID"""
    try:
        # Convert string ID to ObjectId
        object_id = ObjectId(image_id)
        grid_out = await fs.open_download_stream(object_id)
        content = await grid_out.read()
        return content
    except Exception as e:
        # Add better error handling to see what's going wrong
        print(f"Error retrieving image: {str(e)}")
        raise

async def get_all_images():
    """Retrieve all image IDs from GridFS"""
    cursor = fs.find({})
    image_ids = []
    async for grid_out in cursor:
        image_ids.append(str(grid_out._id))
    return image_ids

async def generate_image_from_profile(brand_profile, prompt, api_key):
    """Generate an image based on the brand profile and prompt using Stable Diffusion API."""
    try:
        # Create a prompt that incorporates the brand profile info
        style_description = brand_profile.get("overallStyle", "")
        color_palette = ", ".join(brand_profile.get("colorPalette", {}).get("colors", []))
        illustration_style = brand_profile.get("illustrationCharacteristics", {}).get("lineStyle", "")
        
        # Craft a detailed prompt for the image generation
        detailed_prompt = f"{prompt}. Style: {style_description}. Using color palette: {color_palette}. Illustration style: {illustration_style}."
        
        # Stable Diffusion API setup
        api_host = 'https://api.stability.ai'
        api_endpoint = f"{api_host}/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        payload = {
            "text_prompts": [{"text": detailed_prompt}],
            "cfg_scale": 7,
            "height": 1024,
            "width": 1024,
            "samples": 1,
            "steps": 30,
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(api_endpoint, headers=headers, json=payload) as response:
                if response.status != 200:
                    error_text = await response.text()
                    print(f"Stable Diffusion API error: {error_text}")
                    return None
                
                response_data = await response.json()
                
                if "artifacts" in response_data and len(response_data["artifacts"]) > 0:
                    # Get the base64 image data
                    image_base64 = response_data["artifacts"][0]["base64"]
                    
                    # Decode the base64 data to binary
                    image_bytes = base64.b64decode(image_base64)
                    
                    # Save the image to GridFS
                    filename = f"generated_{int(time.time())}.png"
                    file_id = await fs.upload_from_stream(
                        filename,
                        image_bytes,
                        metadata={"content_type": "image/png", "generated": True}
                    )
                    
                    return str(file_id)
                else:
                    print("No artifacts were returned in the response")
                    return None
    except Exception as e:
        print(f"Error generating image with Stable Diffusion: {str(e)}")
        return None