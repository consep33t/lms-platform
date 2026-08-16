from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, JSON, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base

class SSOProvider(Base):
    __tablename__ = "sso_providers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    protocol: Mapped[str] = mapped_column(String(50), default="OIDC", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    client_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    client_secret: Mapped[str | None] = mapped_column(String(255), nullable=True)
    issuer_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    authorization_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    token_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    userinfo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    saml_metadata_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    saml_entity_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    saml_x509_cert: Mapped[str | None] = mapped_column(Text, nullable=True)
    ldap_server_uri: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ldap_bind_dn: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ldap_base_dn: Mapped[str | None] = mapped_column(String(255), nullable=True)
    attribute_mapping: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    meta_data: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

class SSOAuditLog(Base):
    __tablename__ = "sso_audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    provider_id: Mapped[int] = mapped_column(Integer, ForeignKey("sso_providers.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    details: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
