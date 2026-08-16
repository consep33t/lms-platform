try:
    import pytest
    fixture_decorator = pytest.fixture
except ImportError:
    fixture_decorator = lambda func: func

from app.core.security import create_access_token


@fixture_decorator
def sample_user_payload():

    return {
        "user_id": 42,
        "email": "testuser@alfanet.id",
        "full_name": "Peserta Uji LMS",
        "role": "user"
    }


@pytest.fixture
def sample_jwt_token(sample_user_payload):
    return create_access_token(sample_user_payload["user_id"])


@pytest.fixture
def sample_admin_jwt_token():
    return create_access_token(1)