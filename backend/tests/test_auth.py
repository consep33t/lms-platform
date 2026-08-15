import pytest
from app.core.security import verify_password, get_password_hash, create_access_token, decode_token


def test_password_hashing():
    raw_pass = "SuperSecret123!"
    hashed = get_password_hash(raw_pass)
    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_flow():
    user_id = 99
    token = create_access_token(user_id)
    payload = decode_token(token)
    assert payload.get("sub") == str(user_id)
    assert payload.get("type") == "access"
