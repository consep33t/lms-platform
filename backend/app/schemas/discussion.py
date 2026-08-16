from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import List, Optional, Any

class DiscussionTopicBase(BaseModel):
    title: str = Field(..., max_length=255)
    content_body: str
    session_id: int
    meta_data: dict = {}

class DiscussionTopicCreate(DiscussionTopicBase):
    pass

class DiscussionTopicUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    content_body: Optional[str] = None
    is_resolved: Optional[bool] = None

class DiscussionTopicResponse(BaseModel):
    id: int
    session_id: int
    user_id: int
    title: str
    content_body: str
    is_pinned: bool = False
    is_resolved: bool = False
    vote_count: int = 0
    reply_count: int = 0
    meta_data: dict = {}
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class DiscussionTopicListResponse(BaseModel):
    items: List[DiscussionTopicResponse]
    total: int

class DiscussionReplyBase(BaseModel):
    reply_body: str
    meta_data: dict = {}

class DiscussionReplyCreate(DiscussionReplyBase):
    topic_id: int

class DiscussionReplyUpdate(BaseModel):
    reply_body: str

class DiscussionReplyResponse(BaseModel):
    id: int
    topic_id: int
    user_id: int
    reply_body: str
    is_accepted_answer: bool = False
    vote_count: int = 0
    meta_data: dict = {}
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class DiscussionVoteCreate(BaseModel):
    vote_type: int = 1

class DiscussionVoteResponse(BaseModel):
    id: int
    user_id: int
    topic_id: Optional[int] = None
    reply_id: Optional[int] = None
    vote_type: int = 1
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
