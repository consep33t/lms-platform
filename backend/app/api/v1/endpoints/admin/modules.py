from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.module import Module
from app.schemas.module import ModuleCreate, ModuleUpdate, ModuleResponse

router = APIRouter()


@router.get("", response_model=list[ModuleResponse])
async def admin_list_modules(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Module).where(Module.is_deleted == False).order_by(Module.order)
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.post("", response_model=ModuleResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_module(
    req: ModuleCreate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    module = Module(
        title=req.title,
        description=req.description,
        status=req.status,
        thumbnail_media_id=req.thumbnail_media_id,
        passing_score=req.passing_score,
        order=req.order,
        created_by=admin.id
    )
    db.add(module)
    await db.flush()
    return module


@router.put("/{module_id}", response_model=ModuleResponse)
async def admin_update_module(
    module_id: int,
    req: ModuleUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Module).where(Module.id == module_id, Module.is_deleted == False)
    res = await db.execute(stmt)
    module = res.scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Modul tidak ditemukan")

    for field, val in req.model_dump(exclude_unset=True).items():
        setattr(module, field, val)

    return module


@router.delete("/{module_id}")
async def admin_delete_module(
    module_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Module).where(Module.id == module_id)
    res = await db.execute(stmt)
    module = res.scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Modul tidak ditemukan")
    module.is_deleted = True
    return {"message": "Modul berhasil dihapus"}
