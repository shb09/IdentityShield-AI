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
    db.execute(
        """INSERT INTO screenings
        (id, officer_id, document_type, status, document_image, visa_image, face_image, created_at)
        VALUES (?, ?, ?, 'processing', ?, ?, ?, ?)""",
        (screening_id, current_user["id"], document_type, doc_path, visa_path, face_path,
         datetime.now().isoformat())
    )
    db.commit()

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

        # Update database
        db.execute(
            """UPDATE screenings SET
            status = 'completed',
            risk_score = ?,
            risk_level = ?,
            ocr_confidence = ?,
            ocr_result = ?,
            validation_result = ?,
            tampering_result = ?,
            face_result = ?,
            risk_result = ?,
            explanation = ?,
            completed_at = ?
            WHERE id = ?""",
            (
                risk_result["score"],
                risk_result["level"],
                ocr_result.get("confidence", 0),
                json.dumps(ocr_result),
                json.dumps(validation_result),
                json.dumps(tampering_result),
                json.dumps(face_result),
                json.dumps(risk_result),
                json.dumps(risk_result.get("reasons", [])),
                datetime.now().isoformat(),
                screening_id,
            )
        )
        db.commit()

        # Audit log
        db.execute(
            "INSERT INTO audit_log (screening_id, officer_id, action, details) VALUES (?, ?, ?, ?)",
            (screening_id, current_user["id"], "screen_complete",
             json.dumps({"risk_score": risk_result["score"], "risk_level": risk_result["level"]}))
        )
        db.commit()

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
        db.execute(
            "UPDATE screenings SET status = 'error' WHERE id = ?",
            (screening_id,)
        )
        db.commit()
        raise HTTPException(status_code=500, detail=f"Screening failed: {str(e)}")
    finally:
        db.close()


@router.get("/cases")
async def list_cases(
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    cases = db.execute(
        """SELECT id, document_type, risk_score, risk_level, status, created_at, demo_mode
        FROM screenings ORDER BY created_at DESC LIMIT ? OFFSET ?""",
        (limit, skip)
    ).fetchall()
    total = db.execute("SELECT COUNT(*) as cnt FROM screenings").fetchone()["cnt"]
    db.close()

    return {
        "cases": [dict(c) for c in cases],
        "total": total,
    }


@router.get("/cases/{screening_id}")
async def get_case(
    screening_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    case = db.execute(
        "SELECT * FROM screenings WHERE id = ?", (screening_id,)
    ).fetchone()
    db.close()

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    case_dict = dict(case)
    for field in ["ocr_result", "validation_result", "tampering_result", "face_result", "risk_result", "explanation"]:
        if case_dict.get(field):
            try:
                case_dict[field] = json.loads(case_dict[field])
            except (json.JSONDecodeError, TypeError):
                pass

    if case_dict.get("document_image"):
        case_dict["document_image_url"] = f"/api/uploads/documents/{case_dict['document_image'].split('/')[-1]}"

    return case_dict


@router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    db = get_db()
    total = db.execute("SELECT COUNT(*) as cnt FROM screenings").fetchone()["cnt"]
    low = db.execute("SELECT COUNT(*) as cnt FROM screenings WHERE risk_level = 'LOW'").fetchone()["cnt"]
    medium = db.execute("SELECT COUNT(*) as cnt FROM screenings WHERE risk_level = 'MEDIUM'").fetchone()["cnt"]
    high = db.execute("SELECT COUNT(*) as cnt FROM screenings WHERE risk_level = 'HIGH'").fetchone()["cnt"]

    recent = db.execute(
        """SELECT id, document_type, risk_score, risk_level, status, created_at
        FROM screenings ORDER BY created_at DESC LIMIT 10"""
    ).fetchall()
    db.close()

    return {
        "total_screenings": total,
        "low_risk": low,
        "medium_risk": medium,
        "high_risk": high,
        "recent_cases": [dict(c) for c in recent],
    }
