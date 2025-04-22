import boto3
import uuid
from botocore.config import Config
from app.core.config import settings
from fastapi import UploadFile


class StorageService:
    def __init__(self):
        self.s3 = boto3.client(
            's3',
            endpoint_url=f"https://{settings.DO_SPACE_REGION}.digitaloceanspaces.com",
            config=Config(signature_version='s3v4'),
            aws_access_key_id=settings.DO_SPACE_KEY,
            aws_secret_access_key=settings.DO_SPACE_SECRET
        )
        self.bucket = settings.DO_SPACE_BUCKET

    async def upload_file(self, file: UploadFile, folder: str) -> str:
        """Upload file to DO Spaces and return public URL"""
        try:
            file_name = f"{folder}/{uuid.uuid4()}-{file.filename}"
            file_content = await file.read()  # Read the file content
            
            self.s3.put_object(
                Bucket=self.bucket,
                Key=file_name,
                Body=file_content,
                ACL='public-read'
            )
            
            return f"https://{self.bucket}.{settings.DO_SPACE_REGION}.digitaloceanspaces.com/{file_name}"
        except Exception as e:
            print(f"Upload error details: {str(e)}")  # Add detailed error logging
            raise ValueError(f"Failed to upload file: {str(e)}")
        finally:
            await file.seek(0)  # Reset file pointer for potential reuse