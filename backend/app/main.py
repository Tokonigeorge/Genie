from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import base64
import time

from dotenv import load_dotenv
import aiohttp

from .images import router as images_router
from .profiles import router as profiles_router
from .database import client



load_dotenv()


app = FastAPI()


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# genai_client = genai.Client(api_key=GOOGLE_API_KEY)

@app.get("/")
async def root():
    return {"message": "API is running"}


app.include_router(images_router, prefix="/api", tags=["images"])
app.include_router(profiles_router, prefix="/api", tags=["profiles"])

@app.on_event("startup")
async def startup_db_client():
    await client.admin.command('ping')
    print("Connected to MongoDB!")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    print("MongoDB connection closed")

# async def generate_image_from_profile(brand_profile, prompt):
#     """Generate an image based on the brand profile and prompt using Google Gemini API."""  
#     try:
#         # Create a prompt that incorporates the brand profile info
#         style_description = brand_profile.get("overallStyle", "")
#         color_palette = ", ".join(brand_profile.get("colorPalette", {}).get("colors", []))
#         illustration_style = brand_profile.get("illustrationCharacteristics", {}).get("lineStyle", "")
        
#         # Craft a detailed prompt for the image generation
#         detailed_prompt = f"{prompt}. Style: {style_description}. Using color palette: {color_palette}. Illustration style: {illustration_style}."
        

#         chats = genai_client.aio.chats.create(
#               model="gemini-2.0-flash-exp-image-generation",
#     config=types.GenerateContentConfig(
#        response_modalities=['Text', 'Image']
#     ),
#         )
#         response = await chats.send_message(detailed_prompt)
      
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
                    
#                     image_filename = f"generated_{int(time.time())}.{extension}"
#                     image_path = f"processor/uploads/generated/{image_filename}"
                    
#                     # Save binary data directly to file
#                     with open(image_path, "wb") as f:
#                         f.write(image_bytes)
                    
#                     print(f"Successfully saved image to {image_path}")
#                     return f"/uploads/generated/{image_filename}"
#                 except Exception as e:
#                     print(f"Error saving image from inline_data: {str(e)}")
      
#         print("No image data found in the response.")
#         return None
#     except Exception as e:
#         print(f"Error generating image with Google Gemini: {str(e)}")
#         return None

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
            "Authorization": f"Bearer {STABLE_DIFFUSION_API_KEY}"
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
                    
                    # Save the image to disk
                    image_filename = f"generated_{int(time.time())}.png"
                    image_path = f"processor/uploads/generated/{image_filename}"
                    
                    with open(image_path, "wb") as f:
                        f.write(image_bytes)
                    
                    print(f"Successfully saved image to {image_path}")
                    return f"/uploads/generated/{image_filename}"
                else:
                    print("No artifacts were returned in the response")
                    return None
    except Exception as e:
        print(f"Error generating image with Stable Diffusion: {str(e)}")
        return None
# @app.post("/generate-brand-profile/")
# async def generate_brand_profile(request: BrandProfileRequest):
#     if not OPENAI_API_KEY:
#         raise HTTPException(status_code=500, detail="OpenAI API key not configured")

#     if not request.images:
#         raise HTTPException(status_code=400, detail="No images provided")
    
#     # Prepare images for GPT (convert to base64)
#     image_contents = []
#     for image_filename in request.images:
#         file_path = f"processor/uploads/{image_filename}"
#         if not os.path.exists(file_path):
#             raise HTTPException(status_code=404, detail=f"Image {image_filename} not found")
        
#         with open(file_path, "rb") as img_file:
#             encoded_image = base64.b64encode(img_file.read()).decode('utf-8')
#             image_contents.append({
#                 "type": "image_url",
#                 "image_url": {
#                     "url": f"data:image/jpeg;base64,{encoded_image}"
#                 }
#             })
    
#     # Craft the system prompt
#     system_prompt = """
#     You are a design expert specialized in analyzing visual styles and creating brand profiles.
#     Analyze the provided images and create a detailed JSON brand profile that captures the visual style.
#     The profile should help AI systems replicate similar illustrations in the future.
    
#     Your analysis should include:
#     - Overall style description
#     - Color palette with hex codes
#     - Typography recommendations
#     - Illustration characteristics (line style, shapes, textures)
#     - Key visual elements
#     - Recommendations for maintaining style consistency
    
#     Return ONLY valid JSON without markdown formatting.
#     """
    
#     # Create the messages payload for GPT
#     messages = [
#         {"role": "system", "content": system_prompt},
#         {"role": "user", "content": [
#             {"type": "text", "text": f"Please analyze these images and create a brand profile."},
#             *image_contents
#         ]}
#     ]
    
    
#     try:
#         response = client.chat.completions.create(
#             model="gpt-4o-mini",  # Using mini version to reduce costs and improve rate limits
#             messages=messages,
#             max_tokens=1500
#         )
        
      
#         assistant_message = response.choices[0].message.content
        
#         # Clean up any non-JSON content and parse
#         try:
#             # Try to extract just the JSON if there's any surrounding text
#             json_start = assistant_message.find("{")
#             json_end = assistant_message.rfind("}") + 1
#             if json_start >= 0 and json_end > json_start:
#                 json_str = assistant_message[json_start:json_end]
#                 brand_profile = json.loads(json_str)
#             else:
#                 brand_profile = json.loads(assistant_message)

#             os.makedirs("processor/profiles", exist_ok=True)
#             profile_filename = f"profile_{int(time.time())}.json"
#             profile_path = f"processor/profiles/{profile_filename}"
            
#             with open(profile_path, "w") as f:
#                 json.dump(brand_profile, f, indent=2)
                
#             # Generate an image based on the brand profile and prompt
#             generated_image_path = await generate_image_from_profile(brand_profile, request.prompt)
            
#             return {
#                 "brandProfile": brand_profile,
#                 "brandProfilePath": profile_path,
#                 "generatedImagePath": generated_image_path
#             }
#         except json.JSONDecodeError:
#             # If JSON parsing fails, return the raw text
#             return {
#                 "brandProfile": {
#                     "error": "Failed to parse JSON response",
#                     "rawResponse": assistant_message
#                 }
#             }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)