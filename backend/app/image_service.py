import base64

import time
import aiohttp
from bson.binary import Binary

from bson.objectid import ObjectId
from .database import  db
# from .profile_service import create_brand_profile
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
import json
import base64
from openai import OpenAI
from .database import profiles_collection

# Initialize GridFS for file storage
fs = AsyncIOMotorGridFSBucket(db)




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

async def create_brand_profile(images, openai_key, stable_diffusion_key):
    """Create a brand profile using OpenAI API and generate an image"""
    client = OpenAI(api_key=openai_key)
    
    # Prepare images for GPT (convert to base64)
    image_contents = []
    for image_id in images:
        # Get image from GridFS
        image_data = await get_image_by_id(image_id)
        encoded_image = base64.b64encode(image_data).decode('utf-8')
        image_contents.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{encoded_image}"
            }
        })
    
    # Craft the system prompt
    system_prompt = """
    You are a design expert specialized in analyzing visual styles and creating brand profiles.
    Analyze the provided images and create a detailed JSON brand profile that captures the visual style.
    The profile should contain any information that helps any AI systems replicate similar illustrations in the future.
    
    Your analysis should include:
    - Overall style description
    - Color palette with hex codes
    - Texture
    - Brush strokes style
    - Composition
    - Line style
    - Shape style
    - Style name
    - Style description
    - Recommendations for maintaining style consistency
    
    Return ONLY valid JSON without markdown formatting.
    """
    
    # Create the messages payload for GPT
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": [
            {"type": "text", "text": "You are an art style analysis expert"},
            *image_contents
        ]}
    ]
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=1500
        )
        
        assistant_message = response.choices[0].message.content
        
        # Clean up any non-JSON content and parse
        try:
            # Try to extract just the JSON if there's any surrounding text
            json_start = assistant_message.find("{")
            json_end = assistant_message.rfind("}") + 1
            if json_start >= 0 and json_end > json_start:
                json_str = assistant_message[json_start:json_end]
                brand_profile = json.loads(json_str)
            else:
                brand_profile = json.loads(assistant_message)
            
            # Generate an image based on the brand profile and prompt
            # generated_image_id = await generate_image_from_profile(
            #     brand_profile, 
            #     prompt, 
            #     stable_diffusion_key
            # )
            
            # Save profile to MongoDB
            profile_data = {
                # "prompt": prompt,
                "uploaded_images": images,
                "json_profile": brand_profile,
                # "generated_image": generated_image_id
            }
            
            result = await profiles_collection.insert_one(profile_data)
            
            return {
                "id": str(result.inserted_id),
                "brandProfile": brand_profile,
                # "generatedImageId": generated_image_id
            }
        except json.JSONDecodeError:
            # If JSON parsing fails, return the raw text
            return {
                "brandProfile": {
                    "error": "Failed to parse JSON response",
                    "rawResponse": assistant_message
                }
            }
    except Exception as e:
        print(f"Error creating brand profile: {str(e)}")
        raise

async def save_uploaded_images(files, openai_key=None, stable_diffusion_key=None):
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
    brand_profile_data = None
    if openai_key and stable_diffusion_key and file_ids:
        
        brand_profile_data = await create_brand_profile(file_ids, openai_key, stable_diffusion_key)
    
    return file_ids, brand_profile_data
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