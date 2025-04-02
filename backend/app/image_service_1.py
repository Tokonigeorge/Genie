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
from google import genai
from google.genai import types
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

async def create_brand_profile(images, openai_key):
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
        # - If the characters are wearing accessories, mention the accessory style and color.
    # - If the characters are wearing shoes, mention the shoe style and color.
    # - If the characters are wearing hats, mention the hat style and color.
    # - If the characters are wearing glasses, mention the glasses style and color.
    # - If the characters are wearing masks, mention the mask style and color.
    # - If the characters are wearing jewelry, mention the jewelry style and color.
    # Craft the system prompt
    system_prompt = """
    You are a design expert specialized in analyzing visual styles and creating brand profiles.
    Analyze the provided images and create a detailed JSON brand profile that captures the visual style.
    The profile should contain any information that gives immediate context to any AI system to replicate similar illustrations in the future in a consistent style.
    Do not hallucinate or include any information that is not present in the images. If you're unsure about something, do not include it.
    Your analysis should include:
    - Overall style description and vibe
    - Color usage: dominant tones. gradients, palletes or patterns
    - Texture
    - Brush strokes style
    - Composition and placement of elements
    - Background elements and style.
    - Character design elements and style
    - Visual tone and mood.
    - General style and tags of the illustration
    - Line style
    - Shape style
    - Pattern style and color
    - Style name
    - Style description
    - Recommendations for maintaining style consistency -> if the characters are wearing patterned clothes, mention the pattern style and color. If the characters are wearing solid clothes, mention the solid color....
 
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
        
        brand_profile_data = await create_brand_profile(file_ids, openai_key)
    
    return file_ids, brand_profile_data

async def generate_image_from_profile(brand_profile, prompt, api_key, profile_id=None):
    """Generate an image based on the brand profile and prompt using Google Gemini API."""
    genai_client = genai.Client(api_key=api_key)  
    try:
        reference_images = []
        if profile_id:
            profile = await profiles_collection.find_one({"_id": ObjectId(profile_id)})
            if profile and "uploaded_images" in profile:
                # Get up to 2 reference images from the profile
                reference_image_ids = profile["uploaded_images"][:1]
                for img_id in reference_image_ids:
                    image_data = await get_image_by_id(img_id)
                    reference_images.append(image_data)

        # Convert the entire brand profile to a string for the prompt
        brand_profile_str = json.dumps(brand_profile, indent=2)

        # Create a streamlined prompt that includes the JSON profile
        detailed_prompt = (
            f"{prompt}.\n\n"
            f"Use the following brand profile to match the style exactly:\n"
            f"{brand_profile_str}\n\n"
            f"Create an image that follows this style profile precisely."
        )
        
        
        chats = genai_client.aio.chats.create(
            model="gemini-2.0-flash-exp-image-generation",
            config=types.GenerateContentConfig(
                response_modalities=['Text', 'Image']
            ),
        )
        # content_parts = [detailed_prompt]
        
        # Add reference images if available
        # if reference_images:
        #     for img_data in reference_images:
        #         # Create a Gemini format image part from binary data
        #         content_parts.append({
        #             "inline_data": {
        #                 "mime_type": "image/jpeg",  # Assuming JPEG for simplicity
        #                 "data": base64.b64encode(img_data).decode('utf-8')
        #             }
        #         })
            
        #     # Adjust the prompt to indicate reference images
        # content_parts[0] = f"Create an image in the exact same style as the reference images. {detailed_prompt}"
        
        # # Send message with all content parts
        # response = await chats.send_message(content_parts)
        # response = await chats.send_message(detailed_prompt)

        if reference_images:
            print(f'printing with reference images')
            # With reference images - adjust prompt
            modified_prompt = f"Create an image in the exact same style as the reference image precisely, use the following brand profile to match the style exactly: {brand_profile_str} : {prompt}"
            
            # Create parts properly using the Genai types system
            parts = [types.Part(text=modified_prompt)]
            
            for img_data in reference_images:
                # Add each image part using proper Genai types format
                image_part = types.Part(
                    inline_data=types.Blob(
                        mime_type="image/jpeg",
                        data=base64.b64encode(img_data).decode('utf-8')
                    )
                )
                parts.append(image_part)
                
            # Send as a single message with multiple parts
            response = await chats.send_message(parts)
        else:
            print(f'printing without reference images')
            # Without reference images - just send the text prompt
            response = await chats.send_message(detailed_prompt)
      
        if response.prompt_feedback and response.prompt_feedback.block_reason:
            print(f"Prompt was blocked: {response.prompt_feedback.block_reason}")
            return None
        if not response.candidates:
            print("No candidates were returned in the response.")
            return None

        for part in response.candidates[0].content.parts:
            if hasattr(part, 'inline_data') and part.inline_data is not None:
                try:
                    image_bytes = part.inline_data.data
                    mime_type = part.inline_data.mime_type
                    
                    # Determine file extension from mime type
                    extension = "png"  # Default
                    if mime_type:
                        if "jpeg" in mime_type or "jpg" in mime_type:
                            extension = "jpg"
                        elif "png" in mime_type:
                            extension = "png"
                        elif "webp" in mime_type:
                            extension = "webp"
                    
                    # Save the image to GridFS
                    filename = f"generated_{int(time.time())}.{extension}"
                    file_id = await fs.upload_from_stream(
                        filename,
                        image_bytes,
                        metadata={"content_type": mime_type, "generated": True}
                    )
                    
                    print(f"Successfully saved image to GridFS with ID {file_id}")
                    return str(file_id)
                except Exception as e:
                    print(f"Error saving image from inline_data: {str(e)}")
      
        print("No image data found in the response.")
        return None
    except Exception as e:
        print(f"Error generating image with Google Gemini: {str(e)}")
        return None

# async def generate_image_from_profile(brand_profile, prompt, api_key, profile_id=None):
#     """Generate an image based on the brand profile and prompt using Stable Diffusion API."""
#     try:
#         reference_images = []
#         if profile_id:
#             profile = await profiles_collection.find_one({"_id": ObjectId(profile_id)})
#             if profile and "uploaded_images" in profile:
#                 # Get up to 2 reference images from the profile
#                 reference_image_ids = profile["uploaded_images"][:2]
#                 for img_id in reference_image_ids:
                   
#                         image_data = await get_image_by_id(img_id)
#                         # Convert to base64 for the API
#                         # encoded_image = base64.b64encode(image_data).decode('utf-8')
#                         reference_images.append(image_data)
    
#         # Create a prompt that incorporates the brand profile info
#         style_name = brand_profile.get("style_name", "")
#         style_description = brand_profile.get("overall_style_description", "")
#         overall_style_description = brand_profile.get("overall_style_description", "")
#         color_palette = brand_profile.get("color_palette", {})
#         primary_colors = ""
#         if "primary_colors" in color_palette:
#             # Try both "hex_code" and "color" fields for compatibility
#             primary_colors = ", ".join([color.get("hex_code", color.get("color", "")) 
#                                       for color in color_palette.get("primary_colors", [])])
        
#         accent_colors = ""
#         if "accent_colors" in color_palette:
#             accent_colors = ", ".join([color.get("hex_code", color.get("color", "")) 
#                                       for color in color_palette.get("accent_colors", [])])
#         texture = brand_profile.get("texture", "")
#         brush_strokes = brand_profile.get("brush_strokes_style", "")
#         composition = brand_profile.get("composition", "")
#         line_style = brand_profile.get("line_style", "")
#         shape_style = brand_profile.get("shape_style", "")
#         pattern_info = ""
#         pattern_data = brand_profile.get("pattern_style_and_color", [])
#         if pattern_data:
#             patterns = []
#             for pattern in pattern_data:
#                 pattern_name = pattern.get("pattern", "")
#                 pattern_colors = ", ".join([f"{c.get('color', '')} ({c.get('description', '')})" 
#                                          for c in pattern.get("colors", [])])
#                 patterns.append(f"{pattern_name}: {pattern_colors}")
#             pattern_info = "; ".join(patterns)
#         recommendations = " ".join(brand_profile.get("recommendations_for_maintaining_style_consistency", []))
        
#         # Craft a detailed prompt for the image generation
#         detailed_prompt = (
#     f"{prompt}. with the following information: "
#     f"Style name: {style_name}. "
#     f"Style: {style_description}. "
#     f"Overall style: {overall_style_description}. "
#     f"Color palette: Primary colors - {primary_colors}, Accent colors - {accent_colors}. "
#     f"Texture: {texture}. "
#     f"Brush strokes: {brush_strokes}. "
#     f"Composition: {composition}. "
#     f"Line style: {line_style}. "
#     f"Shape style: {shape_style}. "
#     f"Pattern details: {pattern_info}. "
#     f"Ensure consistency by following these guidelines: {recommendations}."
# )

#         api_host = 'https://api.stability.ai'

      
#         api_endpoint = f"{api_host}/v2beta/stable-image/generate/sd3"

        
#         headers = {
#             "Authorization": f"Bearer {api_key}",
#                "Accept": "application/json",
#         }

#         form_data = aiohttp.FormData()
        
#         # Add prompt in the correct format
#         form_data.add_field("prompt", detailed_prompt)  # JSON encoded

#         # Add other parameters
#         form_data.add_field("cfg_scale", "7")  # Only if supported
#         # form_data.add_field("seed", "0")  # Set a seed if needed
#         form_data.add_field("output_format", "png") 

#         if reference_images:
#             form_data.add_field("mode", "image-to-image")
#             form_data.add_field("strength", "0.8")  # Influence of the reference image
#             # form_data.add_field("style_reference_strength", "0.5")
#             form_data.add_field(
#         "image",
#         reference_images[0],  # Only send one reference image
#         filename="reference.png",
#         content_type="image/png"
#     )

#         async with aiohttp.ClientSession() as session:
#             async with session.post(api_endpoint, headers=headers, data=form_data) as response:
#                 if response.status != 200:
#                     error_text = await response.text()
#                     print(f"Stable Diffusion API error: {error_text}")
#                     return None
                
#                 response_data = await response.json()


#                 image_data = response_data.get("image")  # Adjust key based on actual response
#                 if image_data:
#                     image_bytes = base64.b64decode(image_data)
                    
#                     # Save the image to GridFS
#                     filename = f"generated_{int(time.time())}.png"
#                     file_id = await fs.upload_from_stream(
#                         filename,
#                         image_bytes,
#                         metadata={"content_type": "image/png", "generated": True}
#                     )
                    
#                     return str(file_id)
#                 else:
#                     print("No image data was returned in the response")
#                     return None

#     except Exception as e:
#         print(f"Error generating image with Stable Diffusion: {str(e)}")
#         return None