# import json
# import base64
# from openai import OpenAI
# import os

# from .database import profiles_collection
# from .image_service import get_image_by_id, generate_image_from_profile

# async def create_brand_profile(images, openai_key, stable_diffusion_key):
#     """Create a brand profile using OpenAI API and generate an image"""
#     client = OpenAI(api_key=openai_key)
    
#     # Prepare images for GPT (convert to base64)
#     image_contents = []
#     for image_id in images:
#         # Get image from GridFS
#         image_data = await get_image_by_id(image_id)
#         encoded_image = base64.b64encode(image_data).decode('utf-8')
#         image_contents.append({
#             "type": "image_url",
#             "image_url": {
#                 "url": f"data:image/jpeg;base64,{encoded_image}"
#             }
#         })
    
#     # Craft the system prompt
#     system_prompt = """
#     You are a design expert specialized in analyzing visual styles and creating brand profiles.
#     Analyze the provided images and create a detailed JSON brand profile that captures the visual style.
#     The profile should contain any information that helps any AI systems replicate similar illustrations in the future.
    
#     Your analysis should include:
#     - Overall style description
#     - Color palette with hex codes
#     - Texture
#     - Brush strokes style
#     - Composition
#     - Line style
#     - Shape style
#     - Style name
#     - Style description
#     - Recommendations for maintaining style consistency
    
#     Return ONLY valid JSON without markdown formatting.
#     """
    
#     # Create the messages payload for GPT
#     messages = [
#         {"role": "system", "content": system_prompt},
#         {"role": "user", "content": [
#             {"type": "text", "text": "You are an art style analysis expert"},
#             *image_contents
#         ]}
#     ]
    
#     try:
#         response = client.chat.completions.create(
#             model="gpt-4-turbo-vision",
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
            
#             # Generate an image based on the brand profile and prompt
#             # generated_image_id = await generate_image_from_profile(
#             #     brand_profile, 
#             #     prompt, 
#             #     stable_diffusion_key
#             # )
            
#             # Save profile to MongoDB
#             profile_data = {
#                 # "prompt": prompt,
#                 "uploaded_images": images,
#                 "json_profile": brand_profile,
#                 # "generated_image": generated_image_id
#             }
            
#             result = await profiles_collection.insert_one(profile_data)
            
#             return {
#                 "id": str(result.inserted_id),
#                 "brandProfile": brand_profile,
#                 # "generatedImageId": generated_image_id
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
#         print(f"Error creating brand profile: {str(e)}")
#         raise