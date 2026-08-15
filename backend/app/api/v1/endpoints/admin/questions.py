from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.question import Question, QuestionOption
from app.models.session import ModuleSession
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionAdminResponse

router = APIRouter()


@router.get("/session/{session_id}", response_model=list[QuestionAdminResponse])
async def list_session_questions(
    session_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Question)
        .where(Question.session_id == session_id, Question.is_deleted == False)
        .options(selectinload(Question.options))
        .order_by(Question.order.asc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("", response_model=QuestionAdminResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    data: QuestionCreate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    session = await db.get(ModuleSession, data.session_id)
    if not session or session.is_deleted:
        raise HTTPException(status_code=404, detail="Sesi tidak ditemukan")

    question = Question(
        session_id=data.session_id,
        question_text=data.question_text,
        explanation=data.explanation,
        points=data.points,
        order=data.order,
        is_reusable=data.is_reusable,
    )
    db.add(question)
    await db.flush()

    for opt_data in data.options:
        option = QuestionOption(
            question_id=question.id,
            option_text=opt_data.option_text,
            is_correct=opt_data.is_correct,
            order=opt_data.order,
        )
        db.add(option)

    await db.commit()

    # Reload with options
    stmt = select(Question).where(Question.id == question.id).options(selectinload(Question.options))
    res = await db.execute(stmt)
    return res.scalar_one()


@router.get("/{question_id}", response_model=QuestionAdminResponse)
async def get_question(
    question_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Question).where(Question.id == question_id, Question.is_deleted == False).options(selectinload(Question.options))
    res = await db.execute(stmt)
    question = res.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Soal tidak ditemukan")
    return question


@router.put("/{question_id}", response_model=QuestionAdminResponse)
async def update_question(
    question_id: int,
    data: QuestionUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Question).where(Question.id == question_id, Question.is_deleted == False).options(selectinload(Question.options))
    res = await db.execute(stmt)
    question = res.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Soal tidak ditemukan")

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(question, key, value)

    await db.commit()
    await db.refresh(question)
    return question


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    question = await db.get(Question, question_id)
    if not question or question.is_deleted:
        raise HTTPException(status_code=404, detail="Soal tidak ditemukan")

    question.is_deleted = True
    await db.commit()
    return None
