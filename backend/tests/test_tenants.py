import pytest
from pydantic import ValidationError
from app.schemas.tenant import TenantCreate, TenantBrandingResponse

def test_tenant_create_valid_slug():
    # Valid slugs
    tenant = TenantCreate(name="My Tenant", slug="valid-slug-123")
    assert tenant.slug == "valid-slug-123"

    tenant2 = TenantCreate(name="Another", slug="simple")
    assert tenant2.slug == "simple"

def test_tenant_create_invalid_slug():
    invalid_slugs = [
        "invalid slug!",
        "-invalid",
        "invalid-",
        "Invalid-Slug", # upper case
        "invalid--slug", # consecutive hyphens
        "invalid_slug", # underscore
    ]
    for slug in invalid_slugs:
        with pytest.raises(ValidationError):
            TenantCreate(name="My Tenant", slug=slug)

def test_tenant_branding_response_valid_colors():
    branding = TenantBrandingResponse(
        primary_color="#10B981",
        secondary_color="#047857"
    )
    assert branding.primary_color == "#10B981"
    
    branding2 = TenantBrandingResponse(
        primary_color="#FFF",
        secondary_color="#fff"
    )
    assert branding2.primary_color == "#FFF"
    assert branding2.secondary_color == "#fff"

def test_tenant_branding_response_invalid_colors():
    invalid_colors = [
        "10B981", # missing hash
        "#10B981Z", # invalid character
        "#1234", # invalid length (4)
        "#12", # invalid length (2)
        "invalid", 
        "red",
        "#-12345"
    ]
    
    for color in invalid_colors:
        with pytest.raises(ValidationError):
            TenantBrandingResponse(primary_color=color, secondary_color="#047857")
            
        with pytest.raises(ValidationError):
            TenantBrandingResponse(primary_color="#10B981", secondary_color=color)
