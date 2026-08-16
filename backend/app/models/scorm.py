from datetime import datetime
from sqlalchemy import Integer, String, Boolean, JSON, Float, Text, ForeignKey, DateTime, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base

class ScormPackage(Base):
    __tablename__ = "scorm_packages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_content_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("session_contents.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[str] = mapped_column(String(50), default="SCORM_1.2", nullable=False)
    manifest_data: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    entry_url: Mapped[str] = mapped_column(String(500), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    meta_data: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

class ScormTracking(Base):
    __tablename__ = "scorm_tracking"
    __table_args__ = (UniqueConstraint('user_id', 'package_id', name='uq_scorm_user_package'),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    package_id: Mapped[int] = mapped_column(Integer, ForeignKey("scorm_packages.id", ondelete="CASCADE"), nullable=False)
    lesson_status: Mapped[str] = mapped_column(String(50), default="incomplete", nullable=False)
    lesson_location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    score_raw: Mapped[float | None] = mapped_column(Float, nullable=True)
    score_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    score_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    suspend_data: Mapped[str | None] = mapped_column(Text, nullable=True)
    total_time: Mapped[str] = mapped_column(String(50), default="00:00:00", nullable=False)
    cmi_data: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    last_accessed_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

class XAPIStatement(Base):
    __tablename__ = "xapi_statements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    actor: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    verb: Mapped[str] = mapped_column(String(100), nullable=False)
    object: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    result: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    statement_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
