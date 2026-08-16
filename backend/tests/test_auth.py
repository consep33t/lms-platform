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

