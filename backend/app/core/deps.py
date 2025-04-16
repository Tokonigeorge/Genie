# app/core/deps.py
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from .database import AsyncSessionLocal

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except:
            await session.rollback()
            raise
        finally:
            await session.close()