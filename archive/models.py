from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from pydantic import BaseModel, Field, GetJsonSchemaHandler

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: any,
        _handler: any,
    ) -> core_schema.CoreSchema:
        return core_schema.chain_schema([
            core_schema.str_schema(),
            core_schema.no_info_plain_validator_function(cls.validate),
        ])

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)
    
    @classmethod
    def __get_pydantic_json_schema__(
        cls, 
        _schema_generator: GetJsonSchemaHandler,
        _field_schema: JsonSchemaValue,
    ) -> JsonSchemaValue:
        return {"type": "string"}   

class ProfileBase(BaseModel):
    id: PyObjectId = None
    prompt: str
    uploaded_images: List[str]
    json_profile: dict
    generated_image: Optional[str] = None
    created_at: datetime = datetime.now()
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str
        }

class GenerateRequest(BaseModel):
    prompt: str
    profile_id: str

class BrandProfileRequest(BaseModel):
    images: List[str]