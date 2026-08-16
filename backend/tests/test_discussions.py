from datetime import datetime
from app.schemas.discussion import (
    DiscussionTopicCreate,
    DiscussionTopicResponse,
    DiscussionReplyCreate,
    DiscussionReplyResponse,
    DiscussionVoteCreate
)

def test_discussion_topic_schema():
    payload = {
        "title": "Bagaimana cara deploy MinIO?",
        "content_body": "Saya mengalami error connection refused saat connect ke port 9000.",
        "session_id": 1,
        "meta_data": {"tags": ["docker", "minio"]}
    }
    obj = DiscussionTopicCreate(**payload)
    assert obj.title == "Bagaimana cara deploy MinIO?"
    assert obj.session_id == 1
    assert obj.meta_data["tags"] == ["docker", "minio"]

    resp = DiscussionTopicResponse(
        id=1,
        session_id=1,
        user_id=5,
        title=obj.title,
        content_body=obj.content_body,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    assert resp.id == 1
    assert resp.reply_count == 0

def test_discussion_reply_schema():
    reply_payload = {
        "topic_id": 1,
        "reply_body": "Pastikan container MinIO berada dalam network bridge yang sama dengan backend.",
        "meta_data": {}
    }
    reply = DiscussionReplyCreate(**reply_payload)
    assert reply.topic_id == 1
    assert "network bridge" in reply.reply_body
