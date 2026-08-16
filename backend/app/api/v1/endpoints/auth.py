import logging
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.config import settings
from app.services.auth_service import AuthService
from app.schemas.user import (
    UserCreate,
    UserLogin,
    TokenResponse,
    UserResponse,
    StudentRegisterRequest,
    StudentRegistrationResponse,
    GoogleRegisterRequest
)
from app.core.dependencies import get_current_user_id
from app.repositories.user_repo import UserRepository

logger = logging.getLogger(__name__)
# Cookie is secure (HTTPS-only) unless running in DEBUG/local development mode
_COOKIE_SECURE: bool = not settings.DEBUG

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Admin pre-approved user creation"""
    service = AuthService(db)
    return await service.register(user_in)


@router.post("/register-student", response_model=StudentRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_student(req: StudentRegisterRequest, db: AsyncSession = Depends(get_db)):
    """Public student self-registration flow with automated custom LMS email and admin approval gate"""
    service = AuthService(db)
    user = await service.register_student(req)
    return StudentRegistrationResponse(
        id=user.id,
        full_name=user.full_name,
        personal_email=user.personal_email or user.email,
        custom_lms_email=user.custom_lms_email or user.email,
        approval_status=user.approval_status,
        message="Pendaftaran berhasil! Akun Anda telah dibuat dan sedang menunggu persetujuan Administrator."
    )


@router.post("/google-register")
async def google_register(req: GoogleRegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """Google OAuth2 student registration / login"""
    service = AuthService(db)
    user, access_token, refresh_token = await service.register_or_login_google(req)

    if access_token and refresh_token:
        # Set httpOnly cookie for refresh token
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=_COOKIE_SECURE,
            samesite="lax",
            max_age=7 * 24 * 60 * 60,
        )
        return {
            "status": "approved",
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user)
        }
    else:
        return {
            "status": "pending",
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "personal_email": user.personal_email or user.email,
                "custom_lms_email": user.custom_lms_email or user.email,
                "approval_status": user.approval_status
            },
            "message": "Pendaftaran Google berhasil. Akun Anda sedang menunggu persetujuan Administrator sebelum dapat mengakses materi."
        }


@router.post("/login", response_model=TokenResponse)
async def login(login_in: UserLogin, response: Response, db: AsyncSession = Depends(get_db)):
    try:
        service = AuthService(db)
        user, access_token, refresh_token = await service.authenticate(login_in)

        # Set httpOnly cookie for refresh token
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=_COOKIE_SECURE,
            samesite="lax",
            max_age=7 * 24 * 60 * 60,
        )

        user_data = UserResponse.model_validate(user)
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_data
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"❌ Error saat autentikasi login untuk '{login_in.email}': {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Terjadi kesalahan internal pada server saat memproses login. ({type(exc).__name__})"
        )


@router.post("/refresh")
async def refresh(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token provided")
    
    service = AuthService(db)
    new_access_token, new_refresh_token = await service.refresh_access_token(refresh_token)

    # Set rotated httpOnly cookie for new refresh token
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=_COOKIE_SECURE,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
    )
    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout(
    response: Response,
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(HTTPBearer(auto_error=False)),
    db: AsyncSession = Depends(get_db),
):
    # 1. Revoke refresh token in DB
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        repo = UserRepository(db)
        await repo.revoke_refresh_token(refresh_token)

    # 2. Blacklist the current access token JTI in Redis (proper logout)
    if credentials:
        from app.core.security import decode_token
        from app.core.cache import cache_set
        from datetime import datetime, timezone
        payload = decode_token(credentials.credentials)
        jti = payload.get("jti")
        exp = payload.get("exp")
        if jti and exp:
            # TTL = remaining seconds until token naturally expires
            remaining = max(0, int(exp - datetime.now(timezone.utc).timestamp()))
            if remaining > 0:
                await cache_set(f"jti_blacklist:{jti}", "1", ttl=remaining)

    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=_COOKIE_SECURE,
        samesite="lax",
    )
    return {"message": "Logout berhasil"}



@router.get("/me", response_model=UserResponse)
async def get_me(current_user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)
    user = await repo.get_by_id(current_user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")
    return UserResponse.model_validate(user)
