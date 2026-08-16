from datetime import datetime
from app.schemas.note import UserNoteSave, UserNoteResponse

def test_user_note_save_schema():
    payload = {
        "session_id": 10,
        "note_title": "Ringkasan Arsitektur",
        "note_content": "Poin 1: Gunakan async engine. Poin 2: Composite index.",
        "meta_data": {"starred": True}
    }
    note = UserNoteSave(**payload)
    assert note.session_id == 10
    assert note.meta_data["starred"] is True

    resp = UserNoteResponse(
        id=1,
        user_id=2,
        session_id=note.session_id,
        note_title=note.note_title,
        note_content=note.note_content,
        meta_data=note.meta_data,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    assert resp.user_id == 2
