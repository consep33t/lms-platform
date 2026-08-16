from app.models.base_mixins import TimestampMixin, SoftDeleteMixin, ZeroDDLMixin
from datetime import datetime
import enum
from sqlalchemy import String, Integer, Boolean, DateTime, Text, Float, Enum, ForeignKey, JSON, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ContentType(str, enum.Enum):
    text = "text"
    image = "image"
    video = "video"
    document = "document"
    embed = "embed"


class SessionContent(TimestampMixin, SoftDeleteMixin, ZeroDDLMixin, Base):
    __tablename__ = "session_contents"
    __table_args__ = (
        Index("ix_session_contents_session_order", "session_id", "order"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("module_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    content_type: Mapped[ContentType] = mapped_column(Enum(ContentType), nullable=False)
    text_body: Mapped[str | None] = mapped_column(Text, nullable=True)
    media_file_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("media_files.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    session: Mapped["ModuleSession"] = relationship("ModuleSession", back_populates="contents")
    media: Mapped["MediaFile"] = relationship("MediaFile", foreign_keys=[media_file_id])


class ContentWatchProgress(TimestampMixin, Base):
    __tablename__ = "content_watch_progress"
    __table_args__ = (
        UniqueConstraint("session_progress_id", "session_content_id", name="uq_cwp_progress_content"),
        Index("ix_cwp_progress_content", "session_progress_id", "session_content_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    session_progress_id: Mapped[int] = mapped_column(Integer, ForeignKey("session_progress.id", ondelete="CASCADE"), index=True, nullable=False)
    session_content_id: Mapped[int] = mapped_column(Integer, ForeignKey("session_contents.id", ondelete="CASCADE"), nullable=False)
    watched_percent: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
