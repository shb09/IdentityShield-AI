from typing import Dict, Any, List
from app.config import RISK_WEIGHTS


def calculate_risk_score(
    validation: Dict[str, Any],
    tampering: Dict[str, Any],
    face: Dict[str, Any],
    ocr_confidence: float,
    weights: Dict[str, float] = None,
) -> Dict[str, Any]:
    """Calculate explainable risk score from all module results."""
    w = weights or RISK_WEIGHTS

    reasons = []

    # Document validity score (0 = bad, 100 = good)
    val_score = validation.get("score", 100)
    val_status = validation.get("status", "PASS")
    if val_status == "FAIL":
        reasons.append("Document validation failed critical checks")
        val_risk = 80
    elif val_status == "WARNING":
        reasons.append("Document validation has warnings")
        val_risk = 35
    else:
        val_risk = 5

    # Field consistency
    field_risk = max(0, 100 - ocr_confidence)
    if ocr_confidence < 50:
        reasons.append(f"Low OCR confidence ({ocr_confidence}%)")
    elif ocr_confidence < 70:
        reasons.append(f"Moderate OCR confidence ({ocr_confidence}%)")

    # Tampering risk
    tamper_score = tampering.get("risk_score", 0)
    tamper_status = tampering.get("status", "PASS")
    if tamper_status == "SUSPICIOUS":
        reasons.append("Document shows signs of tampering")
        if tampering.get("suspicious_regions"):
            reasons.append(f"Found {len(tampering['suspicious_regions'])} suspicious regions")
        tamper_risk = min(tamper_score, 95)
    elif tamper_status == "WARNING":
        reasons.append("Minor tampering indicators detected")
        tamper_risk = min(tamper_score, 45)
    else:
        tamper_risk = tamper_score * 0.3

    # Face verification risk
    face_status = face.get("status", "MATCH")
    face_score = face.get("similarity_score", 100)

    if face_status == "MISMATCH":
        reasons.append("Face mismatch between document and presented person")
        face_risk = 90
    elif face_status == "POSSIBLE_MATCH":
        reasons.append("Face similarity is borderline - requires manual review")
        face_risk = 50
    elif face_status == "NOT_DETECTED":
        reasons.append("Face detection failed")
        face_risk = 40
    else:
        face_risk = max(0, 20 - (face_score * 0.2))

    # Weighted calculation
    breakdown = {
        "document_validity": round(val_risk * w["document_validity"], 1),
        "field_consistency": round(field_risk * w["field_consistency"], 1),
        "tampering": round(tamper_risk * w["tampering"], 1),
        "face_verification": round(face_risk * w["face_verification"], 1),
    }

    total_score = sum(breakdown.values())
    total_score = min(100, max(0, total_score))

    if total_score <= 30:
        level = "LOW"
    elif total_score <= 60:
        level = "MEDIUM"
    else:
        level = "HIGH"

    return {
        "score": round(total_score),
        "level": level,
        "breakdown": breakdown,
        "reasons": reasons if reasons else ["No significant risk indicators detected"],
    }
