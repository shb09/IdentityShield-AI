import re
import pytesseract
from PIL import Image
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


def extract_text_from_image(image_path: str) -> str:
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
        return text
    except Exception as e:
        logger.error(f"OCR extraction failed: {e}")
        return ""


def extract_fields_from_text(text: str) -> Dict[str, Any]:
    fields = {
        "name": "Not detected",
        "document_number": "Not detected",
        "nationality": "Not detected",
        "date_of_birth": "Not detected",
        "date_of_expiry": "Not detected",
        "gender": "Not detected",
        "visa_number": "Not detected",
        "visa_type": "Not detected",
        "issue_date": "Not detected",
        "additional_info": "Not detected",
    }

    lines = [line.strip() for line in text.split("\n") if line.strip()]

    # Extract document number (alphanumeric, typically 6-12 chars)
    for pattern in [
        r'(?:Passport|Document|ID|License)\s*(?:No|Number|#)\s*[:.]?\s*([A-Z0-9]{6,12})',
        r'\b([A-Z]{1,2}\d{6,10})\b',
        r'\b(\d{8,12})\b',
    ]:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            fields["document_number"] = match.group(1)
            break

    # Extract names
    name_patterns = [
        r'(?:Name|Surname|Given\s*Name)\s*[:.]?\s*([A-Z][A-Za-z\s]+)',
        r'(?:S/O|D/O|W/O)\s*[:.]?\s*([A-Z][A-Za-z\s]+)',
    ]
    for pattern in name_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            fields["name"] = match.group(1).strip()
            break

    # If no name found, try first substantial line
    if fields["name"] == "Not detected" and lines:
        for line in lines:
            cleaned = re.sub(r'[^A-Za-z\s]', '', line).strip()
            if len(cleaned) > 3 and not any(kw in cleaned.lower() for kw in ['passport', 'republic', 'government', 'identity']):
                fields["name"] = cleaned
                break

    # Extract dates
    date_patterns = [
        r'(\d{2}[./-]\d{2}[./-]\d{4})',
        r'(\d{4}[./-]\d{2}[./-]\d{2})',
        r'(\d{2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4})',
    ]
    dates_found = []
    for pattern in date_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        dates_found.extend(matches)

    if dates_found:
        if len(dates_found) >= 1:
            fields["date_of_birth"] = dates_found[0]
        if len(dates_found) >= 2:
            fields["date_of_expiry"] = dates_found[-1]
        if len(dates_found) >= 3:
            fields["issue_date"] = dates_found[1]

    # Extract nationality
    nationality_patterns = [
        r'(?:Nationality|Country|Citizen)\s*[:.]?\s*([A-Z][A-Za-z\s]+)',
        r'\b(Indian|Nepalese|Bhutanese|Bangladeshi|Pakistani|Sri\s*Lankan|Chinese)\b',
    ]
    for pattern in nationality_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            fields["nationality"] = match.group(1).strip()
            break

    # Extract gender
    gender_match = re.search(r'(?:Sex|Gender)\s*[:.]?\s*(Male|Female|M|F|Other)', text, re.IGNORECASE)
    if gender_match:
        g = gender_match.group(1).upper()
        fields["gender"] = "Male" if g in ("M", "MALE") else "Female" if g in ("F", "FEMALE") else "Other"

    # MRZ detection
    mrz_lines = [line for line in lines if re.match(r'^[A-Z0-9<]{20,}', line)]
    if mrz_lines:
        fields["mrz_raw"] = mrz_lines[:3]

    return fields


def calculate_ocr_confidence(fields: Dict[str, Any]) -> float:
    detected = sum(1 for v in fields.values() if v != "Not detected" and v != "Not detected" and v)
    total = len(fields)
    return round((detected / total) * 100, 1) if total > 0 else 0.0


def run_ocr(image_path: str) -> Dict[str, Any]:
    raw_text = extract_text_from_image(image_path)
    fields = extract_fields_from_text(raw_text)
    confidence = calculate_ocr_confidence(fields)

    return {
        "fields": fields,
        "confidence": confidence,
        "raw_text": raw_text[:2000] if raw_text else "",
        "status": "complete" if raw_text else "failed",
    }
