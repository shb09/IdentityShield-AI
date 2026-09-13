import re
import shutil
from PIL import Image
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

_tesseract_available = None


def _check_tesseract():
    global _tesseract_available
    if _tesseract_available is None:
        _tesseract_available = shutil.which("tesseract") is not None
        if not _tesseract_available:
            logger.warning("Tesseract binary not found — OCR will return empty results. Install tesseract-ocr.")
    return _tesseract_available


def extract_text_from_image(image_path: str) -> str:
    if not _check_tesseract():
        return ""
    try:
        import pytesseract
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
        return text
    except Exception as e:
        logger.error(f"OCR extraction failed: {e}")
        return ""


def _find_line_after(lines, pattern):
    for i, line in enumerate(lines):
        if re.search(pattern, line, re.IGNORECASE):
            if i + 1 < len(lines):
                return lines[i + 1].strip()
    return None


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

    # --- Name + Document Number ---
    # Header: "NAME DOCUMENT No." → next line: "RAJESH KUMAR SINGH 4561234"
    name_value_line = _find_line_after(lines, r'^\s*Name\b')
    if name_value_line and not re.match(r'(?:REPUBLIC|PASSPORT|DOCUMENT|DATE|GENDER|ENDER|NATIONAL)', name_value_line, re.IGNORECASE):
        # Split: trailing digits are document number, leading words are name
        m = re.match(r'^(.+?)\s+(\d{5,12})\s*$', name_value_line)
        if m:
            fields["name"] = m.group(1).strip()
            fields["document_number"] = m.group(2).strip()
        else:
            # Try: embedded alphanumeric doc number (like AT894561)
            m2 = re.match(r'^(.+?)\s+([A-Z]{1,3}\d{5,10})\s*$', name_value_line)
            if m2:
                fields["name"] = m2.group(1).strip()
                fields["document_number"] = m2.group(2).strip()
            else:
                # Entire line is name, no doc number visible
                cleaned = re.sub(r'[^A-Za-z\s]', '', name_value_line).strip()
                if len(cleaned) > 2:
                    fields["name"] = cleaned

    # Fallback name/doc patterns in raw text
    if fields["document_number"] == "Not detected":
        for pattern in [
            r'(?:Passport|Document|ID|License)\s*(?:No|Number|#)\s*[:.]?\s*([A-Z0-9]{5,15})',
        ]:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                fields["document_number"] = match.group(1)
                break

    if fields["name"] == "Not detected":
        name_patterns = [
            r'(?:Name|Surname|Given\s*Name)\s*[:.]?\s*([A-Z][A-Za-z\s]+)',
            r'(?:S/O|D/O|W/O)\s*[:.]?\s*([A-Z][A-Za-z\s]+)',
        ]
        for pattern in name_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                candidate = match.group(1).strip()
                if not re.match(r'(?:DOCUMENT|REPUBLIC|PASSPORT)', candidate, re.IGNORECASE):
                    fields["name"] = candidate
                    break

    # Last resort: first clean line that looks like a person name
    if fields["name"] == "Not detected":
        for line in lines:
            cleaned = re.sub(r'[^A-Za-z\s]', '', line).strip()
            if (len(cleaned) > 3 and
                not any(kw in cleaned.lower() for kw in
                        ['passport', 'republic', 'government', 'identity', 'document',
                         'date', 'gender', 'ender', 'nationality', 'expiry', 'india'])):
                fields["name"] = cleaned
                break

    # --- Dates ---
    # Typically line like: "12/05/1988 11/05/2028"
    # First date = DOB, last = expiry
    date_pattern = r'(\d{2}[./-]\d{2}[./-]\d{4})'

    # Try finding dates near specific headers
    date_line = _find_line_after(lines, r'(?:Date|Expiry|DOB|Birth)')
    if not date_line:
        # Just find all dates in the whole text
        date_line = text

    all_dates = re.findall(date_pattern, date_line, re.IGNORECASE)
    if not all_dates:
        all_dates = re.findall(date_pattern, text, re.IGNORECASE)

    if all_dates:
        fields["date_of_birth"] = all_dates[0]
        if len(all_dates) >= 2:
            fields["date_of_expiry"] = all_dates[-1]
        else:
            fields["date_of_expiry"] = all_dates[0]
        if len(all_dates) >= 3:
            fields["issue_date"] = all_dates[1]

    # --- Nationality ---
    # Look for nationality keyword in any line, extract country from that line or next
    for i, line in enumerate(lines):
        if re.search(r'Nationality', line, re.IGNORECASE):
            # Check current line and next for a country name
            for check_line in [line, lines[i + 1] if i + 1 < len(lines) else ""]:
                m = re.search(r'\b(Indian|Nepalese|Bhutanese|Bangladeshi|Pakistani|Sri\s*Lankan|Chinese|American|British|Canadian|Australian|German|French|Japanese|Korean)\b', check_line, re.IGNORECASE)
                if m:
                    fields["nationality"] = m.group(1).strip()
                    break
            break

    # Fallback
    if fields["nationality"] == "Not detected":
        m = re.search(r'\b(Indian|Nepalese|Bhutanese|Bangladeshi|Pakistani|Sri\s*Lankan|Chinese)\b', text, re.IGNORECASE)
        if m:
            fields["nationality"] = m.group(1).strip()

    # --- Gender ---
    # OCR reads "GENDER" as "ENDER". Look for gender-related header.
    for i, line in enumerate(lines):
        if re.search(r'(?:Gender|Sex|ender)', line, re.IGNORECASE):
            # Check next line for gender value
            if i + 1 < len(lines):
                m = re.search(r'\b(Male|Female|M|F|Other)\b', lines[i + 1], re.IGNORECASE)
                if m:
                    g = m.group(1).upper()
                    fields["gender"] = "Male" if g in ("M", "MALE") else "Female" if g in ("F", "FEMALE") else "Other"
                    break

    # Fallback
    if fields["gender"] == "Not detected":
        m = re.search(r'(?:Sex|Gender|ender)\s*[:.]?\s*(Male|Female|M|F|Other)', text, re.IGNORECASE)
        if m:
            g = m.group(1).upper()
            fields["gender"] = "Male" if g in ("M", "MALE") else "Female" if g in ("F", "FEMALE") else "Other"

    # --- MRZ detection ---
    mrz_lines = [line for line in lines if re.match(r'^[A-Z0-9<]{20,}', line)]
    if mrz_lines:
        fields["mrz_raw"] = mrz_lines[:3]

    return fields


def calculate_ocr_confidence(fields: Dict[str, Any]) -> float:
    # Only count the core fields for confidence
    core_fields = ["name", "document_number", "nationality", "date_of_birth", "date_of_expiry", "gender"]
    detected = sum(1 for f in core_fields if fields.get(f) and fields.get(f) != "Not detected")
    total = len(core_fields)
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
