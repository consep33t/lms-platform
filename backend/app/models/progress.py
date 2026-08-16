from datetime import datetime
import enum
from sqlalchemy import String, Integer, Boolean, DateTime, Float, Enum, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base
from sqlalchemy import Index, UniqueConstraint


class ProgressStatus(str, enum.Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    completed = "completed"


class FlagType(str, enum.Enum):
    tab_switch = "tab_switch"
    time_anomaly = "time_anomaly"
    multi_device = "multi_device"


class UserModuleProgress(Base):
    __tablename__ = "user_module_progress"
    __table_args__ = (
        Index("ix_user_module_progress_user_status", "user_id", "status"),
        Index("ix_user_module_progress_module_status", "module_id", "status"),
        UniqueConstraint("user_id", "module_id", name="uq_user_module_progress_user_module"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    module_id: Mapped[int] = mapped_column(Integer, ForeignKey("modules.id", ondelete="CASCADE"), index=True, nullable=False)
    status: Mapped[ProgressStatus] = mapped_column(Enum(ProgressStatus), default=ProgressStatus.not_started, nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    session_progresses: Mapped[list["SessionProgress"]] = relationship("SessionProgress", back_populates="module_progress", cascade="all, delete-orphan")


class SessionProgress(Base):
    __tablename__ = "session_progress"
    __table_args__ = (
        Index("ix_session_progress_ump_status", "user_module_progress_id", "status"),
        Index("ix_session_progress_session_ump", "session_id", "user_module_progress_id"),
        UniqueConstraint("session_id", "user_module_progress_id", name="uq_session_progress_ump"),
    )


    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_module_progress_id: Mapped[int] = mapped_column(Integer, ForeignKey("user_module_progress.id", ondelete="CASCADE"), index=True, nullable=False)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("module_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    status: Mapped[ProgressStatus] = mapped_column(Enum(ProgressStatus), default=ProgressStatus.not_started, nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    time_spent_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    module_progress: Mapped["UserModuleProgress"] = relationship("UserModuleProgress", back_populates="session_progresses")
    answers: Mapped[list["UserAnswer"]] = relationship("UserAnswer", back_populates="session_progress", cascade="all, delete-orphan")
    flags: Mapped[list["SessionFlag"]] = relationship("SessionFlag", back_populates="session_progress", cascade="all, delete-orphan")


class UserAnswer(Base):
    __tablename__ = "user_answers"
    __table_args__ = (
        UniqueConstraint("session_progress_id", "question_id", name="uq_user_answers_session_question"),
        Index("ix_user_answers_session_question", "session_progress_id", "question_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_progress_id: Mapped[int] = mapped_column(Integer, ForeignKey("session_progress.id", ondelete="CASCADE"), index=True, nullable=False)
    question_id: Mapped[int] = mapped_column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    selected_option_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("question_options.id", ondelete="CASCADE"), nullable=True)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    answered_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    session_progress: Mapped["SessionProgress"] = relationship("SessionProgress", back_populates="answers")


class Certificate(Base):
    __tablename__ = "certificates"
    __table_args__ = (
        Index("ix_certificates_user_module", "user_id", "module_id"),
        Index("ix_certificates_code", "certificate_code"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    module_id: Mapped[int] = mapped_column(Integer, ForeignKey("modules.id", ondelete="CASCADE"), index=True, nullable=False)
    certificate_code: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    media_file_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("media_files.id", ondelete="SET NULL"), nullable=True)
    meta_data: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    issued_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
    module: Mapped["Module"] = relationship("Module", foreign_keys=[module_id])
    media_file: Mapped["MediaFile | None"] = relationship("MediaFile", foreign_keys=[media_file_id])



class SessionFlag(Base):
    __tablename__ = "session_flags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_progress_id: Mapped[int] = mapped_column(Integer, ForeignKey("session_progress.id", ondelete="CASCADE"), index=True, nullable=False)
    flag_type: Mapped[FlagType] = mapped_column(Enum(FlagType), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    session_progress: Mapped["SessionProgress"] = relationship("SessionProgress", back_populates="flags")
