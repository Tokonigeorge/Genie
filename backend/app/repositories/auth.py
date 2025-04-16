from sqlalchemy.ext.asyncio import AsyncSession
from typing import TypeVar
from sqlalchemy import select
from app.models import User
from .base import BaseRepository

ModelType = TypeVar("ModelType")


class UserRepository(BaseRepository[User]):
    async def get_by_email(self, email: str) -> User | None:
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()