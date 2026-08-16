import pytest
from pydantic import ValidationError
from datetime import datetime, timezone

from app.schemas.scorm import ScormTrackingSyncRequest, XAPIStatementCreate
from app.services.scorm_service import ScormService

def test_parse_imsmanifest_scorm_12():
    xml_content = """<?xml version="1.0" encoding="utf-8"?>
<manifest identifier="com.scorm.test" version="1.2" xmlns="http://www.imsglobal.org/xsd/imscp_v1p1">
  <organizations>
    <organization identifier="org_1">
      <title>Test Course</title>
      <item identifier="item_1" identifierref="res_1">
        <title>Test Lesson 1</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res_1" type="webcontent" href="index.html">
    </resource>
  </resources>
</manifest>
"""
    result = ScormService.parse_imsmanifest(xml_content)
    
    # Check organizations
    assert len(result['organizations']) == 1
    org = result['organizations'][0]
    assert org['id'] == 'org_1'
    assert len(org['items']) == 1
    
    item = org['items'][0]
    assert item['id'] == 'item_1'
    assert item['identifierref'] == 'res_1'
    assert item['title'] == 'Test Lesson 1'
    
    # Check resources
    assert len(result['resources']) == 1
    res = result['resources'][0]
    assert res['id'] == 'res_1'
    assert res['href'] == 'index.html'

def test_scorm_tracking_sync_request_valid():
    data = {
        "cmi_data": {
            "cmi.core.lesson_status": "completed",
            "cmi.core.score.raw": "100"
        }
    }
    schema = ScormTrackingSyncRequest(**data)
    assert schema.cmi_data["cmi.core.lesson_status"] == "completed"

def test_scorm_tracking_sync_request_invalid():
    # missing cmi_data
    with pytest.raises(ValidationError):
        ScormTrackingSyncRequest()

def test_xapi_statement_create_valid():
    data = {
        "actor": {"mbox": "mailto:test@example.com"},
        "verb": {"id": "http://adlnet.gov/expapi/verbs/completed"},
        "object": {"id": "http://example.com/activities/course-1"},
        "result": {"score": {"raw": 100}},
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    schema = XAPIStatementCreate(**data)
    assert schema.actor["mbox"] == "mailto:test@example.com"
    assert schema.result["score"]["raw"] == 100

def test_xapi_statement_create_invalid():
    # missing actor
    data = {
        "verb": {"id": "http://adlnet.gov/expapi/verbs/completed"},
        "object": {"id": "http://example.com/activities/course-1"}
    }
    with pytest.raises(ValidationError):
        XAPIStatementCreate(**data)
