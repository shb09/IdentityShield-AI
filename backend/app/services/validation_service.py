import re
from datetime import datetime, date
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


def validate_date_format(date_str: str) -> Dict[str, Any]:
    formats = ["%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", "%Y-%m-%d", "%Y/%m/%d"]
    for fmt in formats:
        try:
            parsed = datetime.strptime(date_str, fmt)
            return {"valid": True, "parsed": parsed.date(), "format": fmt}
        except ValueError:
            continue
    return {"valid": False, "parsed": None, "format": None}


def check_date合理性(dob_str: str) -> Dict[str, Any]:
    result = {"check": "Date of Birth Validity", "status": "PASS", "detail": ""}

    date_info = validate_date_format(dob_str)
    if not date_info["valid"]:
        result["status"] = "WARNING"
        result["detail"] = f"DOB format could not be validated: {dob_str}"
        return result

    dob = date_info["parsed"]
    today = date.today()

    age = (today - dob).days / 365.25
    if age < 0:
        result["status"] = "FAIL"
        result["detail"] = "DOB is in the future"
    elif age > 120:
        result["status"] = "FAIL"
        result["detail"] = f"Unreasonable age: {age:.0f} years"
    elif age < 16:
        result["status"] = "WARNING"
        result["detail"] = f"Young age for travel document: {age:.0f} years"
    else:
        result["detail"] = f"Age: {age:.0f} years - plausible"
    return result


def check_expiry(date_str: str) -> Dict[str, Any]:
    result = {"check": "Document Expiry", "status": "PASS", "detail": ""}

    date_info = validate_date_format(date_str)
    if not date_info["valid"]:
        result["status"] = "WARNING"
        result["detail"] = f"Expiry date format not recognized: {date_str}"
        return result

    expiry = date_info["parsed"]
    today = date.today()

    if expiry < today:
        result["status"] = "FAIL"
        result["detail"] = f"Document expired on {expiry}"
    elif (expiry - today).days < 30:
        result["status"] = "WARNING"
        result["detail"] = f"Document expires soon: {expiry}"
    else:
        result["detail"] = f"Document valid until {expiry}"
    return result


def check_document_number(doc_number: str) -> Dict[str, Any]:
    result = {"check": "Document Number Format", "status": "PASS", "detail": ""}

    if doc_number == "Not detected":
        result["status"] = "WARNING"
        result["detail"] = "Document number not detected by OCR"
        return result

    if len(doc_number) < 5:
        result["status"] = "WARNING"
        result["detail"] = f"Document number seems too short: {doc_number}"
    elif len(doc_number) > 15:
        result["status"] = "WARNING"
        result["detail"] = f"Document number seems unusually long: {doc_number}"
    elif not re.match(r'^[A-Z0-9]+$', doc_number):
        result["status"] = "WARNING"
        result["detail"] = "Document number contains unusual characters"
    else:
        result["detail"] = f"Document number format appears valid: {doc_number}"
    return result


def check_required_fields(fields: Dict[str, Any]) -> Dict[str, Any]:
    result = {"check": "Required Fields Present", "status": "PASS", "detail": ""}

    required = ["name", "document_number", "date_of_birth"]
    missing = [f for f in required if fields.get(f, "Not detected") == "Not detected"]

    if missing:
        result["status"] = "WARNING"
        result["detail"] = f"Missing fields: {', '.join(missing)}"
    else:
        result["detail"] = "All required fields detected"
    return result


def check_field_consistency(fields: Dict[str, Any]) -> Dict[str, Any]:
    result = {"check": "Field Consistency", "status": "PASS", "details": []}

    name = fields.get("name", "Not detected")
    if name != "Not detected" and len(name.strip()) < 2:
        result["status"] = "WARNING"
        result["details"].append("Name seems too short")

    gender = fields.get("gender", "Not detected")
    if gender != "Not detected" and gender not in ("Male", "Female", "Other", "M", "F"):
        result["status"] = "WARNING"
        result["details"].append(f"Unusual gender value: {gender}")

    if not result["details"]:
        result["details"].append("All fields appear internally consistent")

    return result


def run_validation(ocr_fields: Dict[str, Any]) -> Dict[str, Any]:
    checks = []

    checks.append(check_required_fields(ocr_fields))
    checks.append(check_document_number(ocr_fields.get("document_number", "Not detected")))

    dob = ocr_fields.get("date_of_birth", "Not detected")
    if dob != "Not detected":
        checks.append(check_date合理性(dob))

    expiry = ocr_fields.get("date_of_expiry", "Not detected")
    if expiry != "Not detected":
        checks.append(check_expiry(expiry))

    checks.append(check_field_consistency(ocr_fields))

    fail_count = sum(1 for c in checks if c["status"] == "FAIL")
    warn_count = sum(1 for c in checks if c["status"] == "WARNING")

    if fail_count > 0:
        overall = "FAIL"
    elif warn_count > 0:
        overall = "WARNING"
    else:
        overall = "PASS"

    score = max(0, 100 - (fail_count * 30) - (warn_count * 10))

    return {
        "status": overall,
        "checks": checks,
        "score": score,
    }
