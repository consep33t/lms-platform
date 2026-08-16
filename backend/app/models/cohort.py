from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, Text, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Cohort(Base):
    __tablename__ = "cohorts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    meta_data: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    members: Mapped[list["CohortMember"]] = relationship("CohortMember", back_populates="cohort", cascade="all, delete-orphan")
    assignments: Mapped[list["ModuleAssignment"]] = relationship("ModuleAssignment", back_populates="cohort", cascade="all, delete-orphan")


class CohortMember(Base):
    __tablename__ = "cohort_members"
    __table_args__ = (
        UniqueConstraint("cohort_id", "user_id", name="uq_cohort_member_cohort_user"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    cohort_id: Mapped[int] = mapped_column(Integer, ForeignKey("cohorts.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    cohort: Mapped["Cohort"] = relationship("Cohort", back_populates="members")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])


class ModuleAssignment(Base):
    __tablename__ = "module_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    module_id: Mapped[int] = mapped_column(Integer, ForeignKey("modules.id", ondelete="CASCADE"), index=True, nullable=False)
    cohort_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("cohorts.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    assigned_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="NO ACTION"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    cohort: Mapped["Cohort | None"] = relationship("Cohort", back_populates="assignments")
    module: Mapped["Module"] = relationship("Module", foreign_keys=[module_id])
