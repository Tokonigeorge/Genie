# app/services/auth.py
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.auth import UserCreate, UserLogin
from app.models import User, Organization, OrganizationMember, MemberRole, MemberStatus
from app.core.supabase import supabase_client

class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def register_user(self, user_data: UserCreate):
        # 1. Check if email domain exists in any organization
        domain = user_data.email.split('@')[1]
        existing_org = await self._get_organization_by_domain(domain)

        # 2. Create Supabase auth user
        supabase_user = await self._create_supabase_user(user_data)

        # 3. Create user in our database
        db_user = User(
            id=supabase_user.id,  # Use Supabase user ID
            email=user_data.email,
            full_name=user_data.full_name
        )
        self.session.add(db_user)

        if existing_org:
            # Create pending membership
            member = OrganizationMember(
                user=db_user,
                organization=existing_org,
                role=MemberRole.member,
                status=MemberStatus.invited
            )
            self.session.add(member)
        else:
            # Create new organization and add user as admin
            new_org = Organization(
                name=f"{domain.split('.')[0].title()} Organization",  # Temporary name
                domain=domain
            )
            self.session.add(new_org)
            
            member = OrganizationMember(
                user=db_user,
                organization=new_org,
                role=MemberRole.admin,
                status=MemberStatus.active
            )
            self.session.add(member)

        await self.session.commit()
        return db_user

    async def login_user(self, login_data: UserLogin):
        # 1. Authenticate with Supabase
        auth_response = await self._authenticate_supabase(login_data)
        
        # 2. Get user from our database
        user = await self._get_user_by_email(login_data.email)
        if not user:
            raise ValueError("User not found in database")

        # 3. Get organization status
        member = await self._get_user_membership(user.id)
        
        return {
            "user": user,
            "organization_status": member.status if member else None,
            "session": auth_response.session
        }

    async def _get_organization_by_domain(self, domain: str):
        result = await self.session.execute(
            select(Organization).where(Organization.domain == domain)
        )
        return result.scalar_one_or_none()

    async def _create_supabase_user(self, user_data: UserCreate):
        try:
            response = await supabase_client.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password
            })
            return response.user
        except Exception as e:
            raise ValueError(f"Failed to create Supabase user: {str(e)}")

    async def _authenticate_supabase(self, login_data: UserLogin):
        try:
            return await supabase_client.auth.sign_in_with_password({
                "email": login_data.email,
                "password": login_data.password
            })
        except Exception as e:
            raise ValueError(f"Invalid credentials: {str(e)}")