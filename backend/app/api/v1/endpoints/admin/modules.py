from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.module import Module
from app.models.session import ModuleSession
from app.models.content import SessionContent, ContentType
from app.models.question import Question, QuestionOption
from app.schemas.module import ModuleCreate, ModuleUpdate, ModuleResponse
from app.schemas.session import SessionCreate, SessionUpdate, SessionResponse, SessionContentResponse, SessionContentCreate
from app.schemas.question import QuestionCreate, QuestionAdminResponse

router = APIRouter()

# --- MODULES CRUD ---

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


# --- SESSIONS CRUD ---

@router.get("/{module_id}/sessions", response_model=list[SessionResponse])
async def admin_list_module_sessions(
    module_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ModuleSession).where(
        ModuleSession.module_id == module_id,
        ModuleSession.is_deleted == False
    ).order_by(ModuleSession.order)
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.post("/{module_id}/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_session(
    module_id: int,
    req: SessionCreate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt_m = select(Module).where(Module.id == module_id, Module.is_deleted == False)
    module = (await db.execute(stmt_m)).scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=404, detail="Modul tidak ditemukan")

    session = ModuleSession(
        module_id=module_id,
        title=req.title,
        description=req.description,
        order=req.order,
        duration_minutes=req.duration_minutes
    )
    db.add(session)
    await db.flush()
    return session


@router.put("/sessions/{session_id}", response_model=SessionResponse)
async def admin_update_session(
    session_id: int,
    req: SessionUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ModuleSession).where(ModuleSession.id == session_id, ModuleSession.is_deleted == False)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Sesi tidak ditemukan")

    for field, val in req.model_dump(exclude_unset=True).items():
        setattr(session, field, val)

    return session


@router.delete("/sessions/{session_id}")
async def admin_delete_session(
    session_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ModuleSession).where(ModuleSession.id == session_id)
    session = (await db.execute(stmt)).scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Sesi tidak ditemukan")
    session.is_deleted = True
    return {"message": "Sesi berhasil dihapus"}


# --- SESSION CONTENTS (SLIDES) CRUD ---

@router.post("/sessions/{session_id}/contents", response_model=SessionContentResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_session_content(
    session_id: int,
    payload: SessionContentCreate | None = None,
    content_type: ContentType | None = None,
    text_body: str | None = None,
    media_file_id: int | None = None,
    order: int | None = None,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ModuleSession).where(ModuleSession.id == session_id, ModuleSession.is_deleted == False)
    session = (await db.execute(stmt)).scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Sesi tidak ditemukan")

    final_type = payload.content_type if payload else (content_type or ContentType.text)
    final_text = payload.text_body if (payload and payload.text_body is not None) else text_body
    final_media = payload.media_file_id if (payload and payload.media_file_id is not None) else media_file_id
    final_order = payload.order if (payload and payload.order is not None) else (order or 1)

    content = SessionContent(
        session_id=session_id,
        content_type=final_type,
        text_body=final_text,
        media_file_id=final_media,
        order=final_order
    )
    db.add(content)
    await db.flush()
    return content


@router.delete("/contents/{content_id}")
async def admin_delete_session_content(
    content_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SessionContent).where(SessionContent.id == content_id)
    content = (await db.execute(stmt)).scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Konten tidak ditemukan")
    content.is_deleted = True
    return {"message": "Konten slide berhasil dihapus"}


# --- QUESTIONS & QUIZ CRUD ---

@router.post("/sessions/{session_id}/questions", response_model=QuestionAdminResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_question(
    session_id: int,
    req: QuestionCreate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ModuleSession).where(ModuleSession.id == session_id, ModuleSession.is_deleted == False)
    session = (await db.execute(stmt)).scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Sesi tidak ditemukan")

    question = Question(
        session_id=session_id,
        question_text=req.question_text,
        explanation=req.explanation,
        points=req.points,
        order=req.order,
        is_reusable=req.is_reusable
    )
    db.add(question)
    await db.flush()

    # Add options
    for opt in req.options:
        db.add(QuestionOption(
            question_id=question.id,
            option_text=opt.option_text,
            is_correct=opt.is_correct,
            order=opt.order
        ))

    await db.flush()
    stmt_reload = select(Question).options(selectinload(Question.options)).where(Question.id == question.id)
    return (await db.execute(stmt_reload)).scalar_one()


@router.delete("/questions/{question_id}")
async def admin_delete_question(
    question_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Question).where(Question.id == question_id)
    question = (await db.execute(stmt)).scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Soal tidak ditemukan")
    question.is_deleted = True
    return {"message": "Soal kuis berhasil dihapus"}
