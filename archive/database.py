from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

load_dotenv()
MONGODB_USERNAME = os.getenv("MONGODB_USERNAME")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")
MONGODB_CLUSTER = os.getenv("MONGODB_CLUSTER")
MONGODB_DATABASE = 'brand_profile_generator'
MONGODB_COLLECTION = 'profiles'

if not MONGODB_CLUSTER or not MONGODB_USERNAME or not MONGODB_PASSWORD:
    raise ValueError("MONGODB_CLUSTER, MONGODB_USERNAME, or MONGODB_PASSWORD not found in environment variables")

MONGODB_URL = f"mongodb+srv://{MONGODB_USERNAME}:{MONGODB_PASSWORD}@{MONGODB_CLUSTER}/?retryWrites=true&w=majority&appName=metadata&tls=true"


client = AsyncIOMotorClient(MONGODB_URL, server_api=ServerApi('1'))
db = client[MONGODB_DATABASE]

# Collections
profiles_collection = db[MONGODB_COLLECTION]