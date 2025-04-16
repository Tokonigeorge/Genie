# app/services/auth.py
from app.repositories.auth import UserRepository
from app.schemas.auth import UserCreate
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User

class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)

    async def register_user(self, user_data: UserCreate):
        # Check if user exists
        existing_user = await self.user_repo.get_by_email(user_data.email)
        if existing_user:
            raise ValueError("User already exists")
        
        # Create user
        user = User(**user_data.model_dump())
        self.session.add(user)
        await self.session.commit()
        return user