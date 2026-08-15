import re
import random
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repo import UserRepository
from app.models.user import User, RefreshToken, UserRole
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.schemas.user import UserCreate, UserLogin, StudentRegisterRequest, GoogleRegisterRequest


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = UserRepository(db)

    async def generate_custom_lms_email(self, full_name: str) -> str:
        """
        Generate unique professional student email format:
        e.g., budi.santoso842@student.lms.alfanet.id
        """
        # Clean full name to dot-separated lowercase ascii
        clean_name = re.sub(r'[^a-zA-Z0-9\s]', '', full_name).strip().lower()
        parts = [p for p in clean_name.split() if p]
        if not parts:
            base_handle = "student"
        elif len(parts) == 1:
            base_handle = parts[0]
        else:
            base_handle = f"{parts[0]}.{parts[-1]}"

        # Domain
        domain = "student.lms.alfanet.id"

        # Generate unique candidate with suffix
        for _ in range(10):
            rand_suffix = random.randint(100, 999)
            candidate = f"{base_handle}{rand_suffix}@{domain}"
            existing = await self.repo.get_by_email(candidate)
            if not existing:
                return candidate

        # Fallback timestamp suffix
        ts_suffix = int(datetime.utcnow().timestamp()) % 100000
        return f"{base_handle}{ts_suffix}@{domain}"

    async def register(self, user_in: UserCreate) -> User:
        """Direct admin-created user (pre-approved)"""
        existing = await self.repo.get_by_email(user_in.email)
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email sudah terdaftar")
        
        user = User(
            email=user_in.email.lower(),
            personal_email=user_in.email.lower(),
            full_name=user_in.full_name,
            hashed_password=get_password_hash(user_in.password),
            role=user_in.role,
            is_active=True,
            is_approved=True,
            approval_status="approved",
            registration_source="admin_create",
            approved_at=datetime.utcnow()
        )
        created = await self.repo.create(user)
        return created

    async def register_student(self, req: StudentRegisterRequest) -> User:
        """Public student registration flow (requires admin approval)"""
        clean_email = req.email.strip().lower()
        existing = await self.repo.get_by_email(clean_email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{clean_email}' sudah terdaftar dalam sistem LMS."
            )

        custom_lms_email = await self.generate_custom_lms_email(req.full_name)

        new_student = User(
            email=clean_email,
            personal_email=clean_email,
            custom_lms_email=custom_lms_email,
            full_name=req.full_name.strip(),
            hashed_password=get_password_hash(req.password),
            role=UserRole.user,
            is_active=False,
            is_approved=False,
            approval_status="pending",
            registration_source="manual",
            phone_number=req.phone_number,
            institution=req.institution,
        )
        created = await self.repo.create(new_student)
        return created

    async def register_or_login_google(self, req: GoogleRegisterRequest) -> tuple[User, str | None, str | None]:
        """Google OAuth2 student registration or login"""
        clean_email = req.email.strip().lower()
        user = await self.repo.get_by_email(clean_email)

        if user:
            # Check approval status
            if user.approval_status == "pending" or not user.is_approved:
                return user, None, None
            if user.approval_status == "rejected":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Pendaftaran akun Anda ditolak oleh administrator. Alasan: {user.rejection_reason or '-'}"
                )
            if not user.is_active:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akun dinonaktifkan.")

            access_token = create_access_token(user.id)
            refresh_token = create_refresh_token(user.id)
            rt_record = RefreshToken(
                user_id=user.id,
                token=refresh_token,
                expires_at=datetime.utcnow() + timedelta(days=7)
            )
            await self.repo.save_refresh_token(rt_record)
            return user, access_token, refresh_token

        # Create new student from Google
        custom_lms_email = await self.generate_custom_lms_email(req.full_name)
        random_pwd = get_password_hash(f"GoogleSSO_{random.randint(100000, 999999)}!")

        new_student = User(
            email=clean_email,
            personal_email=clean_email,
            custom_lms_email=custom_lms_email,
            full_name=req.full_name.strip(),
            hashed_password=random_pwd,
            role=UserRole.user,
            is_active=False,
            is_approved=False,
            approval_status="pending",
            registration_source="google",
            institution=req.institution,
        )
        created = await self.repo.create(new_student)
        return created, None, None

    async def authenticate(self, login_in: UserLogin) -> tuple[User, str, str]:
        """Login supporting personal email or custom LMS email"""
        user = await self.repo.get_by_email(login_in.email)
        if not user or not verify_password(login_in.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email atau kata sandi tidak valid.")

        if user.approval_status == "pending" or not user.is_approved:
            custom_hint = f" (Email LMS Resmi Anda: {user.custom_lms_email})" if user.custom_lms_email else ""
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Akun Anda sedang menunggu persetujuan Administrator{custom_hint}. Silakan tunggu verifikasi admin sebelum dapat login."
            )

        if user.approval_status == "rejected":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Pendaftaran akun Anda ditolak oleh administrator. Alasan: {user.rejection_reason or 'Tidak memenuhi syarat'}"
            )

        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akun dinonaktifkan.")

        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)

        # Store refresh token record
        rt_record = RefreshToken(
            user_id=user.id,
            token=refresh_token,
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        await self.repo.save_refresh_token(rt_record)
        return user, access_token, refresh_token

    async def refresh_access_token(self, refresh_token_str: str) -> str:
        token_record = await self.repo.get_refresh_token(refresh_token_str)
        if not token_record:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token tidak valid atau telah kadaluarsa")

        payload = decode_token(refresh_token_str)
        user_id = payload.get("sub")
        if not user_id or payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token payload tidak valid")

        return create_access_token(user_id)
