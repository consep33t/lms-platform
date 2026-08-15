from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.services.module_service import ModuleService
from app.schemas.module import ModuleResponse, ModuleDetailResponse, ModuleUserStatusResponse
from app.schemas.token import TokenVerifyRequest, TokenVerifyResponse

router = APIRouter()


@router.get("", response_model=list[ModuleResponse])
async def list_modules(db: AsyncSession = Depends(get_db)):
    service = ModuleService(db)
    return await service.list_published_modules()


@router.get("/{module_id}", response_model=ModuleDetailResponse)
async def get_module(module_id: int, db: AsyncSession = Depends(get_db)):
    service = ModuleService(db)
    return await service.get_module_detail(module_id)


@router.get("/{module_id}/user-status", response_model=ModuleUserStatusResponse)
async def get_module_user_status(
    module_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = ModuleService(db)
    return await service.get_module_user_status(module_id, current_user_id)


@router.post("/verify-token", response_model=TokenVerifyResponse)
async def verify_token(
    payload: TokenVerifyRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = ModuleService(db)
    return await service.verify_and_unlock_token(payload.token, current_user_id, payload.module_id)


@router.post("/{module_id}/unlock", response_model=TokenVerifyResponse)
async def unlock_specific_module(
    module_id: int,
    payload: TokenVerifyRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = ModuleService(db)
    return await service.verify_and_unlock_token(payload.token, current_user_id, module_id)
