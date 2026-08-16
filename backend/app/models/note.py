from app.models.base_mixins import TimestampMixin, SoftDeleteMixin, ZeroDDLMixin
from datetime import datetime
from sqlalchemy import String, DateTime, Text, Integer, ForeignKey, JSON, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.core.database import Base

class UserNote(TimestampMixin, ZeroDDLMixin, Base):
    __tablename__ = "user_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("module_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    note_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    note_content: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint('user_id', 'session_id', name='uq_user_note_session'),
        Index('ix_user_notes_user_session', 'user_id', 'session_id'),
    )
