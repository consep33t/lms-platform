from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ModuleToken(Base):
    __tablename__ = "module_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    module_id: Mapped[int] = mapped_column(Integer, ForeignKey("modules.id", ondelete="CASCADE"), index=True, nullable=False)
    token_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    max_uses: Mapped[int] = mapped_column(Integer, default=1, nullable=False)  # 0 = unlimited
    current_uses: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    expired_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    module: Mapped["Module"] = relationship("Module", back_populates="tokens")
    usages: Mapped[list["TokenUsage"]] = relationship("TokenUsage", back_populates="token", cascade="all, delete-orphan")


class TokenUsage(Base):
    __tablename__ = "token_usages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    token_id: Mapped[int] = mapped_column(Integer, ForeignKey("module_tokens.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    used_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    token: Mapped["ModuleToken"] = relationship("ModuleToken", back_populates="usages")
