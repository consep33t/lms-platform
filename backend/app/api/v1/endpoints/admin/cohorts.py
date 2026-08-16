from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.module import Module
from app.models.cohort import Cohort, CohortMember, ModuleAssignment
from app.schemas.cohort import (
    CohortCreate,
    CohortUpdate,
    CohortResponse,
    CohortMemberAdd,
    CohortMemberItem,
    ModuleAssignmentCreate,
    ModuleAssignmentResponse,
)

router = APIRouter()


@router.get("", response_model=list[CohortResponse])
async def list_cohorts(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Cohort)
        .where(Cohort.is_deleted == False)
        .options(selectinload(Cohort.members), selectinload(Cohort.assignments))
        .order_by(Cohort.created_at.desc())
    )
    res = await db.execute(stmt)
    cohorts = res.scalars().all()
    return [
        CohortResponse(
            id=c.id,
            name=c.name,
            description=c.description,
            member_count=len(c.members),
            assignment_count=len(c.assignments),
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for c in cohorts
    ]


@router.get("/{cohort_id}", response_model=CohortResponse)
async def get_cohort(
    cohort_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Cohort)
        .where(Cohort.id == cohort_id, Cohort.is_deleted == False)
        .options(selectinload(Cohort.members), selectinload(Cohort.assignments))
    )
    res = await db.execute(stmt)
    cohort = res.scalar_one_or_none()
    if not cohort:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cohort tidak ditemukan")

    return CohortResponse(
        id=cohort.id,
        name=cohort.name,
        description=cohort.description,
        member_count=len(cohort.members),
        assignment_count=len(cohort.assignments),
        created_at=cohort.created_at,
        updated_at=cohort.updated_at,
    )


@router.post("", response_model=CohortResponse, status_code=status.HTTP_201_CREATED)
async def create_cohort(
    data: CohortCreate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    cohort = Cohort(name=data.name.strip(), description=data.description)
    db.add(cohort)
    await db.flush()
    return CohortResponse(
        id=cohort.id,
        name=cohort.name,
        description=cohort.description,
        member_count=0,
        assignment_count=0,
        created_at=cohort.created_at,
        updated_at=cohort.updated_at,
    )


@router.put("/{cohort_id}", response_model=CohortResponse)
async def update_cohort(
    cohort_id: int,
    data: CohortUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Cohort)
        .where(Cohort.id == cohort_id, Cohort.is_deleted == False)
        .options(selectinload(Cohort.members), selectinload(Cohort.assignments))
    )
    cohort = (await db.execute(stmt)).scalar_one_or_none()
    if not cohort:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cohort tidak ditemukan")

    if data.name is not None:
        cohort.name = data.name.strip()
    if data.description is not None:
        cohort.description = data.description

    await db.flush()
    return CohortResponse(
        id=cohort.id,
        name=cohort.name,
        description=cohort.description,
        member_count=len(cohort.members),
        assignment_count=len(cohort.assignments),
        created_at=cohort.created_at,
        updated_at=cohort.updated_at,
    )


@router.delete("/{cohort_id}")
async def delete_cohort(
    cohort_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Cohort).where(Cohort.id == cohort_id, Cohort.is_deleted == False)
    cohort = (await db.execute(stmt)).scalar_one_or_none()
    if not cohort:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cohort tidak ditemukan")

    cohort.is_deleted = True
    await db.flush()
    return {"message": "Cohort berhasil dihapus"}


# ─── Members Management ───────────────────────────────────────────────────────

@router.get("/{cohort_id}/members", response_model=list[CohortMemberItem])
async def list_cohort_members(
    cohort_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(CohortMember)
        .where(CohortMember.cohort_id == cohort_id)
        .options(selectinload(CohortMember.user))
        .order_by(CohortMember.joined_at.desc())
    )
    res = await db.execute(stmt)
    members = res.scalars().all()
    return [
        CohortMemberItem(
            id=m.id,
            user_id=m.user_id,
            full_name=m.user.full_name if m.user else f"User #{m.user_id}",
            email=m.user.email if m.user else "",
            phone_number=m.user.phone_number if m.user else None,
            institution=m.user.institution if m.user else None,
            joined_at=m.joined_at,
        )
        for m in members
        if m.user and not m.user.is_deleted
    ]


@router.post("/{cohort_id}/members", status_code=status.HTTP_200_OK)
async def add_cohort_members(
    cohort_id: int,
    data: CohortMemberAdd,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Cohort).where(Cohort.id == cohort_id, Cohort.is_deleted == False)
    cohort = (await db.execute(stmt)).scalar_one_or_none()
    if not cohort:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cohort tidak ditemukan")

    # Fetch existing members to avoid duplicate entries
    stmt_existing = select(CohortMember.user_id).where(CohortMember.cohort_id == cohort_id)
    existing_uids = set((await db.execute(stmt_existing)).scalars().all())

    added_count = 0
    for uid in data.user_ids:
        if uid not in existing_uids:
            # Check if user exists and is active
            stmt_u = select(User).where(User.id == uid, User.is_deleted == False)
            user_exists = (await db.execute(stmt_u)).scalar_one_or_none()
            if user_exists:
                db.add(CohortMember(cohort_id=cohort_id, user_id=uid))
                added_count += 1

    await db.flush()
    return {"message": f"{added_count} anggota berhasil ditambahkan ke cohort."}


@router.delete("/{cohort_id}/members/{user_id}")
async def remove_cohort_member(
    cohort_id: int,
    user_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CohortMember).where(
        CohortMember.cohort_id == cohort_id,
        CohortMember.user_id == user_id,
    )
    member = (await db.execute(stmt)).scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anggota tidak ditemukan di cohort ini")

    await db.delete(member)
    await db.flush()
    return {"message": "Anggota berhasil dihapus dari cohort"}


# ─── Module Assignments ───────────────────────────────────────────────────────

@router.get("/{cohort_id}/assignments", response_model=list[ModuleAssignmentResponse])
async def list_cohort_assignments(
    cohort_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(ModuleAssignment)
        .where(ModuleAssignment.cohort_id == cohort_id)
        .options(selectinload(ModuleAssignment.module))
        .order_by(ModuleAssignment.created_at.desc())
    )
    res = await db.execute(stmt)
    assignments = res.scalars().all()
    return [
        ModuleAssignmentResponse(
            id=a.id,
            module_id=a.module_id,
            module_title=a.module.title if a.module else f"Modul #{a.module_id}",
            cohort_id=a.cohort_id,
            due_date=a.due_date,
            assigned_by=a.assigned_by,
            created_at=a.created_at,
        )
        for a in assignments
        if a.module and not a.module.is_deleted
    ]


@router.post("/{cohort_id}/assignments", response_model=ModuleAssignmentResponse, status_code=status.HTTP_201_CREATED)
async def assign_module_to_cohort(
    cohort_id: int,
    data: ModuleAssignmentCreate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    # Verify cohort
    stmt_c = select(Cohort).where(Cohort.id == cohort_id, Cohort.is_deleted == False)
    cohort = (await db.execute(stmt_c)).scalar_one_or_none()
    if not cohort:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cohort tidak ditemukan")

    # Verify module
    stmt_m = select(Module).where(Module.id == data.module_id, Module.is_deleted == False)
    module = (await db.execute(stmt_m)).scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Modul tidak ditemukan")

    # Check duplicate assignment
    stmt_check = select(ModuleAssignment).where(
        ModuleAssignment.cohort_id == cohort_id,
        ModuleAssignment.module_id == data.module_id,
    )
    existing = (await db.execute(stmt_check)).scalar_one_or_none()
    if existing:
        # Update due date if exists
        existing.due_date = data.due_date
        await db.flush()
        return ModuleAssignmentResponse(
            id=existing.id,
            module_id=existing.module_id,
            module_title=module.title,
            cohort_id=existing.cohort_id,
            due_date=existing.due_date,
            assigned_by=existing.assigned_by,
            created_at=existing.created_at,
        )

    assignment = ModuleAssignment(
        module_id=data.module_id,
        cohort_id=cohort_id,
        due_date=data.due_date,
        assigned_by=admin.id,
    )
    db.add(assignment)
    await db.flush()

    return ModuleAssignmentResponse(
        id=assignment.id,
        module_id=assignment.module_id,
        module_title=module.title,
        cohort_id=assignment.cohort_id,
        due_date=assignment.due_date,
        assigned_by=assignment.assigned_by,
        created_at=assignment.created_at,
    )


@router.delete("/{cohort_id}/assignments/{assignment_id}")
async def remove_cohort_assignment(
    cohort_id: int,
    assignment_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ModuleAssignment).where(
        ModuleAssignment.id == assignment_id,
        ModuleAssignment.cohort_id == cohort_id,
    )
    assignment = (await db.execute(stmt)).scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Penugasan modul tidak ditemukan")

    await db.delete(assignment)
    await db.flush()
    return {"message": "Penugasan modul berhasil dibatalkan"}

