from app.models.base_mixins import TimestampMixin, SoftDeleteMixin, ZeroDDLMixin
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Text, Integer, ForeignKey, JSON, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.core.database import Base

class DiscussionTopic(TimestampMixin, SoftDeleteMixin, ZeroDDLMixin, Base):
    __tablename__ = "discussion_topics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("module_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content_body: Mapped[str] = mapped_column(Text, nullable=False)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    vote_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reply_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    __table_args__ = (
        Index('ix_discussion_topics_session', 'session_id', 'is_pinned', 'created_at'),
    )


class DiscussionReply(TimestampMixin, SoftDeleteMixin, ZeroDDLMixin, Base):
    __tablename__ = "discussion_replies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    topic_id: Mapped[int] = mapped_column(Integer, ForeignKey("discussion_topics.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    reply_body: Mapped[str] = mapped_column(Text, nullable=False)
    is_accepted_answer: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    vote_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    __table_args__ = (
        Index('ix_discussion_replies_topic', 'topic_id', 'created_at'),
    )


class DiscussionVote(Base):
    __tablename__ = "discussion_votes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    topic_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("discussion_topics.id", ondelete="CASCADE"), nullable=True)
    reply_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("discussion_replies.id", ondelete="CASCADE"), nullable=True)
    vote_type: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint('user_id', 'topic_id', name='uq_disc_vote_user_topic'),
        UniqueConstraint('user_id', 'reply_id', name='uq_disc_vote_user_reply'),
        Index('ix_disc_vote_user', 'user_id'),
    )
