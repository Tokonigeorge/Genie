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
import os
from openai import OpenAI
from .database import profiles_collection

import torch
import time
import io
from diffusers import StableDiffusionXLControlNetPipeline, ControlNetModel
from diffusers.utils import load_image
from PIL import Image
from pymongo import MongoClient
from bson import ObjectId
from google import genai
from google.genai import types
from google.genai.types import HttpOptions, Part
# Initialize GridFS for file storage
fs = AsyncIOMotorGridFSBucket(db)

os.environ["GOOGLE_GENAI_USE_VERTEX_AI"] = "True"


if torch.backends.mps.is_available():
    device = torch.device("mps")
    print("Using MPS (Metal) acceleration")
elif torch.cuda.is_available():
    device = torch.device("cuda")
    print("Using CUDA acceleration")
else:
    device = torch.device("cpu")
    print("Using CPU for inference - this will be slow")

# Use a smaller model for better CPU performance
model_id = "runwayml/stable-diffusion-v1-5"

# Load the ControlNet model
controlnet = ControlNetModel.from_pretrained(
    "lllyasviel/control_v11f1e_sd15_tile", torch_dtype=torch.float32
).to("cpu")

# Load Stable Diffusion model
pipe = StableDiffusionXLControlNetPipeline.from_pretrained(
    model_id,
    controlnet=controlnet,
    torch_dtype=torch.float32
).to("cpu")

# pipe.enable_xformers_memory_efficient_attention()

pipe = pipe.to(device)

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

async def generate_image_from_profile(brand_profile, prompt, profile_id=None):
    """Generate an image based on the brand profile using Stable Diffusion + ControlNet."""
    reference_images = []

    if profile_id:
        profile = await profiles_collection.find_one({"_id": ObjectId(profile_id)})
        if profile and "uploaded_images" in profile:
            # Get up to 2 reference images from the profile
            reference_image_ids = profile["uploaded_images"][:1]  # Adjust as needed
            for img_id in reference_image_ids:
                image_data = await get_image_by_id(img_id)
                if image_data:
                    reference_images.append(Image.open(io.BytesIO(image_data)))

    if not reference_images:
        print("No reference images found, style adherence may not be strong.")

    # Convert the brand profile to a structured style prompt
    brand_profile_str = json.dumps(brand_profile, indent=2)

    detailed_prompt = (
        f"{prompt}.\n\n"
        f"Use the following brand profile to match the style exactly:\n"
        f"{brand_profile_str}\n\n"
        f"Ensure the colors, composition, and textures adhere to the reference."
    )

    # If we have a reference image, apply ControlNet
    if reference_images:
        print("Using reference images for style adherence...")
        ref_image = reference_images[0].convert("RGB").resize((1024, 1024))  # Resize for model input
        output = pipe(
            prompt=detailed_prompt,
            image=ref_image,
            num_inference_steps=30,
            strength=0.9,  # Higher = more influence from reference
            guidance_scale=7.5
        ).images[0]
    else:
        print("Generating without reference image...")
        output = pipe(
            prompt=detailed_prompt,
            num_inference_steps=30,
            guidance_scale=7.5
        ).images[0]

    # Save output to GridFS
    output_bytes = io.BytesIO()
    output.save(output_bytes, format="PNG")
    output_bytes.seek(0)

    file_id = await fs.upload_from_stream(
        f"generated_{int(time.time())}.png",
        output_bytes.getvalue(),
        metadata={"content_type": "image/png", "generated": True}
    )

    print(f"Successfully saved generated image with ID {file_id}")
    return str(file_id)

async def create_brand_profile_gemini_flash(images, gemini_api_key):
    """Create a brand profile using Gemini 2.0 Flash model"""
    # Initialize Gemini client
    client = genai.Client(
        api_key=gemini_api_key,
        http_options=HttpOptions(api_version="v1")
    )
    
    # Create the prompt that will analyze the images
    system_prompt = """
    You are a design expert specialized in analyzing visual styles and creating brand profiles.
    Analyze the provided images and create a detailed JSON illustration profile that captures the visual style.
    The profile should contain any information that gives immediate context to any AI system to replicate similar illustrations in the future in a consistent style.
    Do not hallucinate or include any information that is not present in the images. If you're unsure about something, do not include it.
    Your analysis should include:
    - Overall style description and vibe
    - Color usage: dominant tones, gradients, palettes or patterns, add hex codes where neccesary.
    - Texture
    - Brush strokes style
    - Composition and placement of elements
    - Background elements and style
    - Character design elements and style
    - Visual tone and mood
    - General style and tags of the illustration
    - Fill style, if anythings is filled mention it.
    - Line style
    - Shape style
    - Pattern style and color
    - Style name
    - Style description
    - Recommendations for maintaining style consistency

    Return ONLY valid JSON without markdown formatting.
    """
    
    prompt_text = f"{system_prompt}\nAnalyze these images and provide a JSON illustration profile:"
    
    # Prepare the content array with the prompt text and images
    contents = [prompt_text]
    
    # Add each image to the contents
    for image_id in images:
        # Get image data from GridFS
        image_data = await get_image_by_id(image_id)
        
        # Add image data as a Part object
        contents.append(
            Part.from_bytes(data=image_data, mime_type="image/jpeg")
        )
    
    try:
        # Send the request to Gemini
        response = client.models.generate_content(
            model="gemini-2.0-flash-001",
            contents=contents
        )
        
        # Extract the response text
        assistant_message = response.text
        
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
            
            # Save profile to MongoDB
            profile_data = {
                "uploaded_images": images,
                "json_profile": brand_profile,
            }
            
            result = await profiles_collection.insert_one(profile_data)
            
            return {
                "id": str(result.inserted_id),
                "brandProfile": brand_profile,
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
        print(f"Error creating brand profile with Gemini Flash: {str(e)}")
        raise


async def save_uploaded_images(files, gemini_api_key=None):
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
    if gemini_api_key and file_ids:
        
        brand_profile_data = await create_brand_profile_gemini_flash(file_ids, gemini_api_key)
    
    return file_ids, brand_profile_data

# async def generate_image_from_profile(brand_profile, prompt, api_key, profile_id=None):
#     """Generate an image based on the brand profile and prompt using Google Gemini API."""
#     genai_client = genai.Client(api_key=api_key)  
#     try:
#         reference_images = []
#         if profile_id:
#             profile = await profiles_collection.find_one({"_id": ObjectId(profile_id)})
#             if profile and "uploaded_images" in profile:
#                 # Get up to 2 reference images from the profile
#                 reference_image_ids = profile["uploaded_images"][:1]
#                 for img_id in reference_image_ids:
#                     image_data = await get_image_by_id(img_id)
#                     reference_images.append(image_data)

#         # Convert the entire brand profile to a string for the prompt
#         brand_profile_str = json.dumps(brand_profile, indent=2)

#         # Create a streamlined prompt that includes the JSON profile
#         detailed_prompt = (
#               f"Use the reference images to **exactly** replicate the style, colors, and composition with this prompt: {prompt}. \n\n "
#                f"Do not deviate. Follow the provided brand profile strictly: {brand_profile_str}. "
#           f"Base the new image precisely on this profile and the reference images."

   

#         )
        
        
#         chats = genai_client.aio.chats.create(
#             model="gemini-2.0-flash-exp-image-generation",
#             config=types.GenerateContentConfig(
#                 response_modalities=['Text', 'Image']
#             ),
#         )
#         # content_parts = [detailed_prompt]
        
#         # Add reference images if available
#         # if reference_images:
#         #     for img_data in reference_images:
#         #         # Create a Gemini format image part from binary data
#         #         content_parts.append({
#         #             "inline_data": {
#         #                 "mime_type": "image/jpeg",  # Assuming JPEG for simplicity
#         #                 "data": base64.b64encode(img_data).decode('utf-8')
#         #             }
#         #         })
            
#         #     # Adjust the prompt to indicate reference images
#         # content_parts[0] = f"Create an image in the exact same style as the reference images. {detailed_prompt}"
        
#         # # Send message with all content parts
#         # response = await chats.send_message(content_parts)
#         # response = await chats.send_message(detailed_prompt)

#         if reference_images:
#             print(f'printing with reference images')
#             # With reference images - adjust prompt
#             modified_prompt = f"Create an image in the exact same style as the reference image precisely, use the following brand profile to match the style exactly: {brand_profile_str} : {prompt}"
            
#             # Create parts properly using the Genai types system
#             parts = [types.Part(text=modified_prompt)]
            
#             for img_data in reference_images:
#                 # Add each image part using proper Genai types format
#                 image_part = types.Part(
#                     inline_data=types.Blob(
#                         mime_type="image/jpeg",
#                         data=base64.b64encode(img_data).decode('utf-8')
#                     )
#                 )
#                 parts.append(image_part)
                
#             # Send as a single message with multiple parts
#             response = await chats.send_message(parts)
#         else:
#             print(f'printing without reference images')
#             # Without reference images - just send the text prompt
#             response = await chats.send_message(detailed_prompt)
      
#         if response.prompt_feedback and response.prompt_feedback.block_reason:
#             print(f"Prompt was blocked: {response.prompt_feedback.block_reason}")
#             return None
#         if not response.candidates:
#             print("No candidates were returned in the response.")
#             return None

#         for part in response.candidates[0].content.parts:
#             if hasattr(part, 'inline_data') and part.inline_data is not None:
#                 try:
#                     image_bytes = part.inline_data.data
#                     mime_type = part.inline_data.mime_type
                    
#                     # Determine file extension from mime type
#                     extension = "png"  # Default
#                     if mime_type:
#                         if "jpeg" in mime_type or "jpg" in mime_type:
#                             extension = "jpg"
#                         elif "png" in mime_type:
#                             extension = "png"
#                         elif "webp" in mime_type:
#                             extension = "webp"
                    
#                     # Save the image to GridFS
#                     filename = f"generated_{int(time.time())}.{extension}"
#                     file_id = await fs.upload_from_stream(
#                         filename,
#                         image_bytes,
#                         metadata={"content_type": mime_type, "generated": True}
#                     )
                    
#                     print(f"Successfully saved image to GridFS with ID {file_id}")
#                     return str(file_id)
#                 except Exception as e:
#                     print(f"Error saving image from inline_data: {str(e)}")
      
#         print("No image data found in the response.")
#         return None
#     except Exception as e:
#         print(f"Error generating image with Google Gemini: {str(e)}")
#         return None
