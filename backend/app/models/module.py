from datetime import datetime
import enum
from sqlalchemy import String, Integer, Boolean, DateTime, Text, Float, Enum, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ModuleStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class Module(Base):
    __tablename__ = "modules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ModuleStatus] = mapped_column(Enum(ModuleStatus), default=ModuleStatus.draft, nullable=False)
    thumbnail_media_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    passing_score: Mapped[float] = mapped_column(Float, default=70.0, nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    meta_data: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    sessions: Mapped[list["ModuleSession"]] = relationship("ModuleSession", back_populates="module", cascade="all, delete-orphan", order_by="ModuleSession.order")
    tokens: Mapped[list["ModuleToken"]] = relationship("ModuleToken", back_populates="module", cascade="all, delete-orphan")
    ratings: Mapped[list["ModuleRating"]] = relationship("ModuleRating", back_populates="module", cascade="all, delete-orphan")


class ModulePrerequisite(Base):
    __tablename__ = "module_prerequisites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    module_id: Mapped[int] = mapped_column(Integer, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    prerequisite_module_id: Mapped[int] = mapped_column(Integer, ForeignKey("modules.id", ondelete="NO ACTION"), nullable=False)


class ModuleRating(Base):
    __tablename__ = "module_ratings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    module_id: Mapped[int] = mapped_column(Integer, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 to 5
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    module: Mapped["Module"] = relationship("Module", back_populates="ratings")
