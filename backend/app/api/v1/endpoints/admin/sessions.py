from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.session import ModuleSession
from app.models.module import Module
from app.schemas.session import SessionCreate, SessionUpdate, SessionResponse

router = APIRouter()


@router.get("/module/{module_id}", response_model=list[SessionResponse])
async def list_module_sessions(
    module_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ModuleSession).where(
        ModuleSession.module_id == module_id,
        ModuleSession.is_deleted == False
    ).order_by(ModuleSession.order.asc())
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    data: SessionCreate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    # Verify module exists
    module = await db.get(Module, data.module_id)
    if not module or module.is_deleted:
        raise HTTPException(status_code=404, detail="Modul tidak ditemukan")

    session = ModuleSession(
        module_id=data.module_id,
        title=data.title,
        description=data.description,
        order=data.order,
        duration_minutes=data.duration_minutes,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session_detail(
    session_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    session = await db.get(ModuleSession, session_id)
    if not session or session.is_deleted:
        raise HTTPException(status_code=404, detail="Sesi tidak ditemukan")
    return session


@router.put("/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: int,
    data: SessionUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    session = await db.get(ModuleSession, session_id)
    if not session or session.is_deleted:
        raise HTTPException(status_code=404, detail="Sesi tidak ditemukan")

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(session, key, value)

    await db.commit()
    await db.refresh(session)
    return session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    session = await db.get(ModuleSession, session_id)
    if not session or session.is_deleted:
        raise HTTPException(status_code=404, detail="Sesi tidak ditemukan")

    session.is_deleted = True
    await db.commit()
    return None
