try:
    import pytest
except ImportError:
    pytest = None

from app.core.security import verify_password, get_password_hash, create_access_token, decode_token



def test_password_hashing():
    raw_pass = "SuperSecret123!"
    hashed = get_password_hash(raw_pass)
    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_flow(sample_user_payload):
    user_id = sample_user_payload["user_id"]
    token = create_access_token(user_id)
    payload = decode_token(token)
    assert payload is not None
    assert payload.get("sub") == str(user_id)
    assert payload.get("type") == "access"


def test_jwt_invalid_token():
    invalid_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature"
    payload = decode_token(invalid_token)
    assert not payload or payload == {}


def test_user_response_nullable_fields_and_meta_data():
    from app.schemas.user import UserResponse
    from app.models.user import UserRole
    # Simulate DB user object before metadata migration (meta_data is None, optional fields None)
    raw_user_dict = {
        "id": 1,
        "email": "admin@lms.alfanet.id",
        "full_name": "Super Admin",
        "role": UserRole.superadmin,
        "is_active": True,
        "meta_data": None,
        "personal_email": None,
        "custom_lms_email": None,
        "phone_number": None,
        "institution": None,
        "rejection_reason": None,
        "avatar_media_id": None,
        "approved_at": None,
        "created_at": None,
        "updated_at": None
    }
    user_res = UserResponse.model_validate(raw_user_dict)
    assert user_res.id == 1
    assert user_res.email == "admin@lms.alfanet.id"
    assert user_res.meta_data == {}
    assert user_res.personal_email is None


def test_user_response_with_populated_metadata():
    from app.schemas.user import UserResponse
    from app.models.user import UserRole
    raw_user_dict = {
        "id": 2,
        "email": "budi@student.lms.alfanet.id",
        "full_name": "Budi Santoso",
        "role": UserRole.user,
        "is_active": True,
        "meta_data": {"preferences": {"theme": "dark"}},
        "personal_email": "budi@gmail.com",
    }
    user_res = UserResponse.model_validate(raw_user_dict)
    assert user_res.id == 2
    assert user_res.meta_data == {"preferences": {"theme": "dark"}}
    assert user_res.personal_email == "budi@gmail.com"


