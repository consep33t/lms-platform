from app.models.base_mixins import TimestampMixin, SoftDeleteMixin, ZeroDDLMixin
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ModuleSession(TimestampMixin, SoftDeleteMixin, ZeroDDLMixin, Base):
    __tablename__ = "module_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    module_id: Mapped[int] = mapped_column(Integer, ForeignKey("modules.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)

    # Relationships
    module: Mapped["Module"] = relationship("Module", back_populates="sessions")
    contents: Mapped[list["SessionContent"]] = relationship("SessionContent", back_populates="session", cascade="all, delete-orphan", order_by="SessionContent.order")
    questions: Mapped[list["Question"]] = relationship("Question", back_populates="session", cascade="all, delete-orphan", order_by="Question.order")
