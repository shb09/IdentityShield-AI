import json
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from typing import Optional
from app.auth import get_current_user
from app.database import get_db
from app.models import DocumentType
from app.utils.helpers import generate_screening_id, save_upload
from app.services.ocr_service import run_ocr
from app.services.validation_service import run_validation
from app.services.tampering_service import run_tampering_detection
from app.services.face_service import run_face_verification
from app.services.risk_service import calculate_risk_score
from app.config import MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES

router = APIRouter(prefix="/api", tags=["screening"])


def validate_file(file: UploadFile):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )


@router.post("/screen")
async def screen_document(
    document_type: str = Form(...),
    document: UploadFile = File(...),
    visa: Optional[UploadFile] = File(None),
    face: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user),
):
    validate_file(document)
    if visa:
        validate_file(visa)
    if face:
        validate_file(face)

    screening_id = generate_screening_id()
    db = get_db()

    # Save uploaded files
    doc_content = await document.read()
    if len(doc_content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB.")

    doc_path = save_upload(doc_content, document.filename, "documents")

    visa_path = None
    if visa:
        visa_content = await visa.read()
        visa_path = save_upload(visa_content, visa.filename, "visas")

    face_path = None
    if face:
        face_content = await face.read()
        face_path = save_upload(face_content, face.filename, "faces")

    # Create screening record
    screening_doc = {
        "_id": screening_id,
        "officer_id": current_user["_id"],
        "document_type": document_type,
        "status": "processing",
        "risk_score": 0,
        "risk_level": "PENDING",
        "ocr_confidence": 0.0,
        "ocr_result": {},
        "validation_result": {},
        "tampering_result": {},
        "face_result": {},
        "risk_result": {},
        "explanation": [],
        "document_image": doc_path,
        "visa_image": visa_path,
        "face_image": face_path,
        "demo_mode": False,
        "created_at": datetime.now().isoformat(),
        "completed_at": None,
    }
    await db.screenings.insert_one(screening_doc)

    try:
        # Module 1: OCR
        ocr_result = run_ocr(doc_path)
        if visa_path:
            visa_ocr = run_ocr(visa_path)
            ocr_result["visa_info"] = visa_ocr.get("fields", {})

        # Module 2: Validation
        validation_result = run_validation(ocr_result.get("fields", {}))

        # Module 3: Tampering Detection
        tampering_result = run_tampering_detection(doc_path)

        # Module 4: Face Verification
        if face_path:
            face_result = run_face_verification(doc_path, face_path)
        else:
            face_result = {
                "status": "NOT_DETECTED",
                "similarity_score": 0.0,
                "document_face_detected": False,
                "presented_face_detected": False,
                "explanation": "No face image provided for comparison",
            }

        # Module 5: Risk Engine
        risk_result = calculate_risk_score(
            validation_result,
            tampering_result,
            face_result,
            ocr_result.get("confidence", 0),
        )

        # Update MongoDB
        await db.screenings.update_one(
            {"_id": screening_id},
            {"$set": {
                "status": "completed",
                "risk_score": risk_result["score"],
                "risk_level": risk_result["level"],
                "ocr_confidence": ocr_result.get("confidence", 0),
                "ocr_result": ocr_result,
                "validation_result": validation_result,
                "tampering_result": tampering_result,
                "face_result": face_result,
                "risk_result": risk_result,
                "explanation": risk_result.get("reasons", []),
                "completed_at": datetime.now().isoformat(),
            }}
        )

        # Audit log
        await db.audit_log.insert_one({
            "screening_id": screening_id,
            "officer_id": current_user["_id"],
            "action": "screen_complete",
            "details": {"risk_score": risk_result["score"], "risk_level": risk_result["level"]},
            "timestamp": datetime.now().isoformat(),
        })

        return {
            "screening_id": screening_id,
            "status": "completed",
            "document_type": document_type,
            "ocr": ocr_result,
            "validation": validation_result,
            "tampering": tampering_result,
            "face": face_result,
            "risk": risk_result,
            "document_image_url": f"/api/uploads/documents/{doc_path.split('/')[-1]}",
            "created_at": datetime.now().isoformat(),
        }

    except Exception as e:
        await db.screenings.update_one(
            {"_id": screening_id},
            {"$set": {"status": "error"}}
        )
        raise HTTPException(status_code=500, detail=f"Screening failed: {str(e)}")


@router.get("/cases")
async def list_cases(
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    cursor = db.screenings.find(
        {},
        {"_id": 1, "document_type": 1, "risk_score": 1, "risk_level": 1, "status": 1, "created_at": 1, "demo_mode": 1}
    ).sort("created_at", -1).skip(skip).limit(limit)
    cases = await cursor.to_list(length=limit)
    total = await db.screenings.count_documents({})

    # Convert _id to id for frontend
    for case in cases:
        case["id"] = case.pop("_id")

    return {
        "cases": cases,
        "total": total,
    }


@router.get("/cases/{screening_id}")
async def get_case(
    screening_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    case = await db.screenings.find_one({"_id": screening_id})

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    case["id"] = case.pop("_id")

    if case.get("document_image"):
        case["document_image_url"] = f"/api/uploads/documents/{case['document_image'].split('/')[-1]}"

    return case


@router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    db = get_db()
    total = await db.screenings.count_documents({})
    low = await db.screenings.count_documents({"risk_level": "LOW"})
    medium = await db.screenings.count_documents({"risk_level": "MEDIUM"})
    high = await db.screenings.count_documents({"risk_level": "HIGH"})

    cursor = db.screenings.find(
        {},
        {"_id": 1, "document_type": 1, "risk_score": 1, "risk_level": 1, "status": 1, "created_at": 1}
    ).sort("created_at", -1).limit(10)
    recent = await cursor.to_list(length=10)

    for case in recent:
        case["id"] = case.pop("_id")

    return {
        "total_screenings": total,
        "low_risk": low,
        "medium_risk": medium,
        "high_risk": high,
        "recent_cases": recent,
    }
