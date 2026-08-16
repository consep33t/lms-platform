import io
import csv
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
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
        question_type=data.question_type,
        meta_data=data.meta_data,
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


@router.post("/session/{session_id}/import-csv")
async def import_questions_from_csv(
    session_id: int,
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Import soal kuis secara massal dari file CSV."""
    session = await db.get(ModuleSession, session_id)
    if not session or session.is_deleted:
        raise HTTPException(status_code=404, detail="Sesi tidak ditemukan")

    # Read uploaded file content
    contents = await file.read()
    try:
        text_content = contents.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            text_content = contents.decode("utf-8")
        except UnicodeDecodeError:
            text_content = contents.decode("latin-1")

    # Find highest order in existing questions
    stmt_order = select(func.max(Question.order)).where(Question.session_id == session_id, Question.is_deleted == False)
    max_order = (await db.execute(stmt_order)).scalar() or 0

    reader = csv.reader(io.StringIO(text_content))
    header = None
    imported_count = 0

    for row in reader:
        if not row or not any(field.strip() for field in row):
            continue

        # If header not captured yet
        if header is None:
            first_val = row[0].strip().lower()
            if "question" in first_val or "soal" in first_val:
                header = [h.strip().lower() for h in row]
                continue
            else:
                header = ["question_text", "points", "option_a", "option_b", "option_c", "option_d", "correct_option", "explanation"]

        # Parse data row
        if len(row) < 6:
            continue

        q_text = row[0].strip()
        if not q_text:
            continue

        try:
            points = int(row[1].strip())
        except (ValueError, IndexError):
            points = 10

        opt_a = row[2].strip() if len(row) > 2 else ""
        opt_b = row[3].strip() if len(row) > 3 else ""
        opt_c = row[4].strip() if len(row) > 4 else ""
        opt_d = row[5].strip() if len(row) > 5 else ""
        correct_raw = row[6].strip().upper() if len(row) > 6 else "A"
        explanation = row[7].strip() if len(row) > 7 else None

        # Determine which option is correct (A/B/C/D or 1/2/3/4)
        correct_idx = 0
        if correct_raw in ["B", "2"]:
            correct_idx = 1
        elif correct_raw in ["C", "3"]:
            correct_idx = 2
        elif correct_raw in ["D", "4"]:
            correct_idx = 3

        max_order += 1
        question = Question(
            session_id=session_id,
            question_text=q_text,
            points=points,
            order=max_order,
            explanation=explanation,
            is_reusable=False,
            question_type="multiple_choice",
            meta_data={}
        )
        db.add(question)
        await db.flush()

        options_texts = [opt_a, opt_b, opt_c, opt_d]
        for idx, text in enumerate(options_texts):
            if text:
                opt = QuestionOption(
                    question_id=question.id,
                    option_text=text,
                    is_correct=(idx == correct_idx),
                    order=idx
                )
                db.add(opt)

        imported_count += 1

    await db.commit()

    return {
        "status": "success",
        "imported_count": imported_count,
        "message": f"Berhasil mengimpor {imported_count} butir soal kuis."
    }

