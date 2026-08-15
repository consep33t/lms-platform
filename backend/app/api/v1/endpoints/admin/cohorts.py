from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.cohort import Cohort, CohortMember
from pydantic import BaseModel

router = APIRouter()


class CohortCreate(BaseModel):
    name: str
    description: str | None = None


class CohortResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    member_count: int = 0


@router.get("", response_model=list[CohortResponse])
async def list_cohorts(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Cohort).where(Cohort.is_deleted == False).options(selectinload(Cohort.members))
    res = await db.execute(stmt)
    cohorts = res.scalars().all()
    return [
        CohortResponse(
            id=c.id,
            name=c.name,
            description=c.description,
            member_count=len(c.members)
        )
        for c in cohorts
    ]


@router.post("", response_model=CohortResponse, status_code=status.HTTP_201_CREATED)
async def create_cohort(
    data: CohortCreate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    cohort = Cohort(name=data.name, description=data.description)
    db.add(cohort)
    await db.commit()
    await db.refresh(cohort)
    return CohortResponse(id=cohort.id, name=cohort.name, description=cohort.description, member_count=0)
