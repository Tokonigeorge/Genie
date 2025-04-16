import cv2
import numpy as np
from sklearn.cluster import KMeans
import base64
from io import BytesIO
from PIL import Image
from typing import List

from PIL import Image
import numpy as np
import io

# def load_image(image_data):
#     """Load image from binary data using PIL as a fallback."""
#     try:
#         # Try OpenCV first
#         nparr = np.frombuffer(image_data, np.uint8)
#         img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
#         img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
#         return img
#     except Exception:
#         # Fallback to PIL
#         image = Image.open(io.BytesIO(image_data)).convert("RGB")
#         return np.array(image)

# async def extract_dominant_colors(image_data, k=5):
#     """Extract dominant colors from an image using K-Means clustering."""
#     img = load_image(image_data)  # Use the new helper function
    
#     pixels = img.reshape((-1, 3))
#     kmeans = KMeans(n_clusters=k, n_init=10, random_state=42)
#     kmeans.fit(pixels)
    
#     colors = kmeans.cluster_centers_.astype(int)
#     hex_colors = ['#{:02x}{:02x}{:02x}'.format(*color) for color in colors]
    
#     return hex_colors


async def extract_dominant_colors(image_data: bytes, k: int = 5) -> List[str]:
    """Extract dominant colors from an image using K-Means clustering."""
    # Convert binary image data to an OpenCV image
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Convert image to RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Reshape the image to a 2D array of pixels
    pixels = img.reshape((-1, 3))
    
    # Apply K-Means clustering
    kmeans = KMeans(n_clusters=k, n_init=10, random_state=42)
    kmeans.fit(pixels)
    
    # Extract dominant colors
    colors = kmeans.cluster_centers_.astype(int)
    
    # Convert RGB to HEX
    hex_colors = ['#{:02x}{:02x}{:02x}'.format(*color) for color in colors]
    
    return hex_colors