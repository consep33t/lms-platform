import pytest
from app.schemas.study_room import StudyRoomCreate, StudyRoomMessageCreate
from pydantic import ValidationError

def test_study_room_create_valid():
    schema = StudyRoomCreate(title="Math Study Group", topic="Calculus", max_participants=10, is_active=True)
    assert schema.title == "Math Study Group"
    assert schema.topic == "Calculus"
    assert schema.max_participants == 10
    assert schema.is_active is True

def test_study_room_create_defaults():
    schema = StudyRoomCreate(title="Physics Group")
    assert schema.title == "Physics Group"
    assert schema.topic is None
    assert schema.max_participants == 20
    assert schema.is_active is True

def test_study_room_create_missing_title():
    with pytest.raises(ValidationError):
        StudyRoomCreate(topic="Missing Title")

def test_study_room_message_create_valid():
    schema = StudyRoomMessageCreate(room_id=1, message_text="Hello everyone!", message_type="chat")
    assert schema.room_id == 1
    assert schema.message_text == "Hello everyone!"
    assert schema.message_type == "chat"

def test_study_room_message_missing_fields():
    with pytest.raises(ValidationError):
        StudyRoomMessageCreate(room_id=1)
