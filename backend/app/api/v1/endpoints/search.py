from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.core.database import get_db
from app.models.module import Module, ModuleStatus
from app.models.session import ModuleSession
from app.schemas.search import SearchResultItem, GlobalSearchResponse

router = APIRouter()


@router.get("", response_model=GlobalSearchResponse)
async def global_search(
    q: str = Query(..., min_length=1, description="Kata kunci pencarian"),
    limit: int = 15,
    db: AsyncSession = Depends(get_db),
):
    """Pencarian global instan di seluruh katalog modul dan sesi materi."""
    clean_q = q.strip()
    pattern = f"%{clean_q}%"

    results: list[SearchResultItem] = []

    # 1. Search Modules
    stmt_mod = (
        select(Module)
        .where(
            Module.is_deleted == False,
            Module.status == ModuleStatus.published,
            or_(
                Module.title.ilike(pattern),
                Module.description.ilike(pattern)
            )
        )
        .limit(limit)
    )
    modules = (await db.execute(stmt_mod)).scalars().all()
    for m in modules:
        results.append(SearchResultItem(
            id=m.id,
            type="module",
            title=m.title,
            description=m.description[:120] + "..." if m.description and len(m.description) > 120 else m.description,
            url=f"/modules/{m.id}",
            badge="Modul Kursus"
        ))

    # 2. Search Sessions
    stmt_sess = (
        select(ModuleSession)
        .join(Module, ModuleSession.module_id == Module.id)
        .where(
            ModuleSession.is_deleted == False,
            Module.is_deleted == False,
            Module.status == ModuleStatus.published,
            or_(
                ModuleSession.title.ilike(pattern),
                ModuleSession.description.ilike(pattern)
            )
        )
        .limit(limit)
    )
    sessions = (await db.execute(stmt_sess)).scalars().all()
    for s in sessions:
        results.append(SearchResultItem(
            id=s.id,
            type="session",
            title=s.title,
            description=s.description[:120] + "..." if s.description and len(s.description) > 120 else s.description,
            url=f"/sessions/{s.id}",
            badge=f"Sesi Pembelajaran #{s.order}"
        ))

    return GlobalSearchResponse(
        query=clean_q,
        total_results=len(results),
        results=results
    )
