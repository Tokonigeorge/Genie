# app/services/auth.py
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from sqlalchemy.future import select
from app.schemas.auth import UserCreate, UserLogin, OrganizationCreate, UserUpdate, UserResponse
from app.models import User, Organization, OrganizationMember, MemberRole, MemberStatus
from app.core.supabase import supabase_client
from sqlalchemy.orm import selectinload 

class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def register_user(self, user_data: UserCreate):
        existing_user = await self._get_user_by_email(user_data.email)
        if existing_user:
            raise ValueError("User with this email already exists")
        # 1. Check if email domain exists in any organization
        domain = user_data.email.split('@')[1]
        existing_org = await self._get_organization_by_domain(domain)

        # # 2. Create Supabase auth user
        # supabase_user = await self._create_supabase_user(user_data)
        if not user_data.supabase_user_id:
             raise ValueError("Supabase user ID is required for registration.")
        # 3. Create user in our database
        db_user = User(
            id=user_data.supabase_user_id,  # Use Supabase user ID
            email=user_data.email,
            full_name=user_data.full_name
        )
        self.session.add(db_user)
        await self.session.flush()

        if existing_org:
            member = OrganizationMember(
            user_id=db_user.id,
            organization_id=existing_org.id,
            role=MemberRole.member,
            status=MemberStatus.invited
            )
            self.session.add(member)

        await self.session.commit()
        # await self.session.refresh(db_user) # Refresh to load relationships if needed later
        return {
        "id": db_user.id,
        "email": db_user.email,
        "full_name": db_user.full_name,
        "has_existing_org": bool(existing_org),
        "domain": domain,
        "organization_status": member.status if existing_org else None # Send status back
        }
    

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
    async def _get_user_by_email(self, email: str) -> User:
        """Retrieve a user by email address"""
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    async def update_user(self, user_id: UUID, user_data: UserUpdate):
        """Update user information"""
        user = await self._get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        for field, value in user_data.dict(exclude_unset=True).items():
            setattr(user, field, value)
        
        await self.session.commit()
        return user
    # async def _get_user_membership(self, user_id: UUID) -> OrganizationMember:
    #     """Retrieve a user's organization membership"""
    #     result = await self.session.execute(
    #         select(OrganizationMember)
    #         .options(selectinload(OrganizationMember.organization))
    #         .where(OrganizationMember.user_id == user_id)
    #     )
    #     return result.scalar_one_or_none()


    # async def _create_supabase_user(self, user_data: UserCreate):
    #     try:
    #         response = await supabase_client.auth.sign_up({
    #             "email": user_data.email,
    #             "password": user_data.password
    #         })
    #         return response.user
    #     except Exception as e:
    #         raise ValueError(f"Failed to create Supabase user: {str(e)}")

    async def _authenticate_supabase(self, login_data: UserLogin):
        try:
            return await supabase_client.auth.sign_in_with_password({
                "email": login_data.email,
                "password": login_data.password
            })
        except Exception as e:
            raise ValueError(f"Invalid credentials: {str(e)}")

    async def initiate_password_reset(self, email: str):
        """Initiates the password reset process via Supabase"""
        try:
            await supabase_client.auth.reset_password_email(email)
        except Exception as e:
            # Log the error but return generic message for security
            print(f"Password reset error: {str(e)}")
            # We return success even if email doesn't exist (security best practice)

    async def complete_password_reset(self, token: str, new_password: str):
        """Completes the password reset process"""
        try:
            await supabase_client.auth.reset_password(token, new_password)
        except Exception as e:
            raise ValueError(f"Invalid or expired reset token: {str(e)}")
    async def handle_email_verification(self, token: str):
        """Handles post-verification business logic"""
        try:
            # Verify token with Supabase
            user = await supabase_client.auth.verify_email(token)
            
            # Get user from our database
            db_user = await self._get_user_by_email(user.email)
            if not db_user:
                raise ValueError("User not found in database")

            # Get organization membership
            member = await self._get_user_membership(db_user.id)
            if not member:
                raise ValueError("No organization membership found")

            # Update member status if needed
            if member.status == MemberStatus.invited:
                member.status = MemberStatus.active
                await self.session.commit()

            return {
                "is_new_org": member.role == MemberRole.admin,
                "organization_id": member.organization_id
            }

        except Exception as e:
            raise ValueError(f"Email verification failed: {str(e)}")
        
    async def get_onboarding_status(self, user_id: UUID):
        """Get user details and their organization membership status."""
        # Fetch user and their first membership with the organization loaded
        result = await self.session.execute(
            select(User)
            .options(selectinload(User.organization_memberships).selectinload(OrganizationMember.organization))
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()

        if not user:
            raise ValueError("User not found")
        # Check if domain exists in any organization
        domain = user.email.split('@')[1]
        existing_org = await self._get_organization_by_domain(domain)

        membership = user.organization_memberships[0] if user.organization_memberships else None
        organization = membership.organization if membership else None

        return {
            "user_id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "membership_status": membership.status if membership else None,
            "membership_role": membership.role if membership else None,
            "organization_id": organization.id if organization else None,
            "organization_name": organization.name if organization else None,
            "organization_domain": organization.domain if organization else None,
            "domain_exists": bool(existing_org),
            "domain": domain,
        }
    async def _get_organization_by_domain(self, domain: str) -> Organization:
        """Retrieve an organization by domain"""
        result = await self.session.execute(
            select(Organization).where(Organization.domain == domain)
        )
        return result.scalar_one_or_none()
    async def _get_user_membership(self, user_id: UUID) -> OrganizationMember:
        result = await self.session.execute(
            select(OrganizationMember)
            .where(OrganizationMember.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def _get_user_by_id(self, user_id: UUID) -> User:
        """Retrieve a user by ID"""
        result = await self.session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def create_organization(self, user_id: UUID, org_data: OrganizationCreate):
        """Create organization during onboarding"""
        user = await self._get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        # Check if user already has an organization
        existing_membership = await self._get_user_membership(user_id)
        if existing_membership:
            raise ValueError("User already belongs to an organization")

        # Create new organization
        new_org = Organization(
            name=org_data.name,
            domain=org_data.domain,
            workspace_url=org_data.workspace_url,
            logo_url=org_data.logo_url
        )
        self.session.add(new_org)
        
        # Create admin membership
        member = OrganizationMember(
            user=user,
            organization=new_org,
            role=MemberRole.admin,
            status=MemberStatus.active
        )
        self.session.add(member)
        
        await self.session.commit()
        # await self.session.refresh(new_org)  # Refresh to get the generated ID
        return {
            "id": new_org.id,
            "name": new_org.name,
            "domain": new_org.domain,
            "workspace_url": new_org.workspace_url,
            "logo_url": new_org.logo_url,
            "role": MemberRole.admin
        }