import pytest
from app.schemas.sso import SSOProviderCreate
from app.services.sso_service import sso_service
from pydantic import ValidationError

def test_sso_attribute_claim_mapping():
    claims = {
        "mail": "user@example.com",
        "givenName": "John",
        "surName": "Doe",
        "department": "Engineering"
    }
    mapping = {
        "email": "mail",
        "first_name": "givenName",
        "last_name": "surName"
    }
    
    mapped = sso_service.map_sso_attributes(claims, mapping)
    assert mapped.get("email") == "user@example.com"
    assert mapped.get("first_name") == "John"
    assert mapped.get("last_name") == "Doe"
    assert "department" not in mapped

def test_sso_provider_create_schema_saml():
    data = {
        "name": "Corporate SAML",
        "type": "saml",
        "configuration": {
            "idp_entity_id": "https://idp.example.com",
            "sso_url": "https://idp.example.com/sso",
            "certificate": "cert_data"
        },
        "attribute_mapping": {
            "email": "mail"
        },
        "is_active": True
    }
    schema = SSOProviderCreate(**data)
    assert schema.name == "Corporate SAML"
    assert schema.type == "saml"
    assert schema.configuration["idp_entity_id"] == "https://idp.example.com"

def test_sso_provider_create_schema_oidc():
    data = {
        "name": "Corporate OIDC",
        "type": "oidc",
        "configuration": {
            "client_id": "client_abc",
            "client_secret": "secret_123",
            "issuer": "https://oidc.example.com"
        },
        "attribute_mapping": {
            "email": "email"
        },
        "is_active": True
    }
    schema = SSOProviderCreate(**data)
    assert schema.name == "Corporate OIDC"
    assert schema.type == "oidc"
    assert schema.configuration["client_id"] == "client_abc"

def test_sso_provider_create_schema_invalid():
    with pytest.raises(ValidationError):
        SSOProviderCreate(name="Missing Fields")

def test_jit_provisioning_payload_generation():
    mapped_data = {
        "email": "jituser@example.com",
        "first_name": "JIT",
        "last_name": "User"
    }
    tenant_id = 42
    
    payload = sso_service.provision_jit_user(tenant_id, mapped_data)
    
    assert payload["tenant_id"] == 42
    assert payload["email"] == "jituser@example.com"
    assert payload["status"] == "active"
    assert payload["id"] == 999
