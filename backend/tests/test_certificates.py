try:
    import pytest
except ImportError:
    pytest = None

from app.schemas.certificate import CertificateResponse, CertificateVerifyResponse



def test_certificate_verify_schema():
    verify_data = {
        "is_valid": True,
        "certificate_code": "CERT-LMS-2026-AB12CD34",
        "student_name": "Alfanet Developer",
        "institution": "PT Alfanet Mediatama",
        "module_title": "Arsitektur Jaringan & Cloud Enterprise",
        "issued_at": "2026-08-16T10:00:00Z",
        "message": "Sertifikat resmi dan terverifikasi di database LMS Alfanet."
    }
    schema = CertificateVerifyResponse(**verify_data)
    assert schema.is_valid is True
    assert schema.certificate_code.startswith("CERT-LMS-2026-")
    assert schema.student_name == "Alfanet Developer"

