from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.services.module_service import ModuleService
from app.schemas.module import ModuleResponse
from app.schemas.token import TokenVerifyRequest, TokenVerifyResponse

router = APIRouter()


@router.get("", response_model=list[ModuleResponse])
async def list_modules(db: AsyncSession = Depends(get_db)):
    service = ModuleService(db)
    return await service.list_published_modules()


@router.get("/{module_id}", response_model=ModuleResponse)
async def get_module(module_id: int, db: AsyncSession = Depends(get_db)):
    service = ModuleService(db)
    return await service.get_module_detail(module_id)


@router.post("/verify-token", response_model=TokenVerifyResponse)
async def verify_token(
    payload: TokenVerifyRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    service = ModuleService(db)
    return await service.verify_and_unlock_token(payload.token, current_user_id)
