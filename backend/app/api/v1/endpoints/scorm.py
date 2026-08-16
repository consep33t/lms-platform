from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from uuid import UUID
from typing import Dict, Any

from app.schemas.scorm import (
    ScormPackageResponse,
    ScormTrackingSyncRequest,
    ScormTrackingResponse,
    XAPIStatementCreate,
    XAPIStatementResponse
)
from app.services.scorm_service import ScormService

router = APIRouter()
scorm_service = ScormService()

@router.post("/upload")
async def upload_scorm_package(file: UploadFile = File(...)):
    return {"status": "uploaded", "filename": file.filename}

@router.get("/packages/{id}", response_model=ScormPackageResponse)
async def get_scorm_package(id: UUID):
    raise HTTPException(status_code=404, detail="Not implemented completely")

@router.get("/packages/{id}/tracking")
async def get_scorm_tracking(id: UUID, user_id: UUID):
    return await scorm_service.get_or_create_tracking(str(user_id), str(id))

@router.post("/packages/{id}/tracking")
async def sync_scorm_tracking(id: UUID, user_id: UUID, request: ScormTrackingSyncRequest):
    return await scorm_service.sync_cmi_tracking(str(user_id), str(id), request.cmi_data)

@router.post("/xapi/statements")
async def store_xapi_statement(user_id: UUID, statement: XAPIStatementCreate):
    return await scorm_service.store_xapi_statement(str(user_id), statement.model_dump())
