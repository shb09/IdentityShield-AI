import re
import os
import shutil
from PIL import Image
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

_tesseract_available = None
_rapidocr_available = None


def _find_tesseract():
    if shutil.which("tesseract"):
        return True
    for p in ["/usr/bin/tesseract", "/usr/local/bin/tesseract", "/opt/homebrew/bin/tesseract"]:
        if os.path.isfile(p) and os.access(p, os.X_OK):
            return True
    import glob
    for p in glob.glob("/nix/store/*/bin/tesseract"):
        if os.path.isfile(p) and os.access(p, os.X_OK):
            return True
    return False


def _check_tesseract():
    global _tesseract_available
    if _tesseract_available is None:
        _tesseract_available = _find_tesseract()
        if _tesseract_available:
            logger.info("Tesseract binary found — using pytesseract for OCR")
        else:
            logger.info("Tesseract not found — will use rapidocr fallback")
    return _tesseract_available


def _check_rapidocr():
    global _rapidocr_available
    if _rapidocr_available is None:
        try:
            from rapidocr_onnxruntime import RapidOCR
            _rapidocr_available = True
            logger.info("RapidOCR available — using as OCR engine")
        except ImportError:
            _rapidocr_available = False
            logger.warning("Neither tesseract nor rapidocr available — OCR will return empty results")
    return _rapidocr_available


def extract_text_from_image(image_path: str) -> str:
    if _check_tesseract():
        return _extract_with_tesseract(image_path)
    elif _check_rapidocr():
        return _extract_with_rapidocr(image_path)
    return ""


def _extract_with_tesseract(image_path: str) -> str:
    try:
        import pytesseract
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
        return text
    except Exception as e:
        logger.error(f"Tesseract OCR failed: {e}")
        return ""


def _extract_with_rapidocr(image_path: str) -> str:
    try:
        from rapidocr_onnxruntime import RapidOCR
        engine = RapidOCR()
        result, _ = engine(image_path)
        if not result:
            return ""
        lines = [item[1] for item in result]
        return "\n".join(lines)
    except Exception as e:
        logger.error(f"RapidOCR failed: {e}")
        return ""


def _find_line_after(lines, pattern):
    for i, line in enumerate(lines):
        if re.search(pattern, line, re.IGNORECASE):
            if i + 1 < len(lines):
                return lines[i + 1].strip()
    return None


def _find_value_after_label(lines, label_pattern):
    """Find a value after a label, handling both multi-word and single-word line formats."""
    for i, line in enumerate(lines):
        if re.search(label_pattern, line, re.IGNORECASE):
            for j in range(i + 1, min(i + 4, len(lines))):
                candidate = lines[j].strip()
                if not re.match(r'^(?:REPUBLIC|PASSPORT|DOCUMENT|DATE|GENDER|ENDER|NATIONAL|PHOTO)', candidate, re.IGNORECASE):
                    return candidate
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
    # Tesseract format: "NAME DOCUMENT No.\nRAJESH KUMAR SINGH 4561234"
    # RapidOCR format: "NAME\nDOCUMENTNO\nRAJESHKUMARSINGH\nR4561234"
    # Also: "NAME\nRAJESHKUMARSINGH\nR4561234" (no DOCUMENTNO header)

    # First try: header-style extraction (Tesseract)
    name_value_line = _find_line_after(lines, r'^\s*Name\b')
    if name_value_line and not re.match(r'(?:REPUBLIC|PASSPORT|DOCUMENT|DATE|GENDER|ENDER|NATIONAL|PHOTO)', name_value_line, re.IGNORECASE):
        m = re.match(r'^(.+?)\s+(\d{5,12})\s*$', name_value_line)
        if m:
            fields["name"] = m.group(1).strip()
            fields["document_number"] = m.group(2).strip()
        else:
            m2 = re.match(r'^(.+?)\s+([A-Z]{1,3}\d{5,10})\s*$', name_value_line)
            if m2:
                fields["name"] = m2.group(1).strip()
                fields["document_number"] = m2.group(2).strip()
            else:
                cleaned = re.sub(r'[^A-Za-z\s]', '', name_value_line).strip()
                if len(cleaned) > 2:
                    fields["name"] = cleaned

    # RapidOCR-style: find NAME label, skip DOCUMENTNO, get actual name
    if fields["name"] in ("Not detected", "NAME"):
        name_idx = None
        for i, line in enumerate(lines):
            if re.match(r'^\s*Name\s*$', line, re.IGNORECASE):
                name_idx = i
                break
        if name_idx is not None:
            for j in range(name_idx + 1, min(name_idx + 5, len(lines))):
                candidate = lines[j].strip()
                if re.match(r'(?:DOCUMENT|DATE|PHOTO|GENDER|ENDER|NATIONAL|REPUBLIC|PASSPORT)', candidate, re.IGNORECASE):
                    continue
                if re.match(r'^[A-Z0-9]{5,15}$', candidate) and not any(c.isalpha() for c in candidate):
                    continue
                cleaned = re.sub(r'[^A-Za-z\s]', '', candidate).strip()
                if len(cleaned) > 2:
                    fields["name"] = cleaned
                    break

    # Document number: look after DOCUMENTNO label (RapidOCR) or after passport header
    if fields["document_number"] == "Not detected":
        doc_idx = None
        for i, line in enumerate(lines):
            if re.search(r'Document\s*(?:No|#|Number)', line, re.IGNORECASE) or re.match(r'^\s*DOCUMENT\s*NO\s*$', line, re.IGNORECASE):
                doc_idx = i
                break
        if doc_idx is not None:
            for j in range(doc_idx + 1, min(doc_idx + 4, len(lines))):
                candidate = lines[j].strip()
                if re.match(r'^[A-Z]?\d{5,15}$', candidate):
                    fields["document_number"] = candidate
                    break

    # Fallback: standalone doc number pattern
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
    date_pattern = r'(\d{2}[./-]\d{2}[./-]\d{4})'
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
    for i, line in enumerate(lines):
        if re.search(r'Nationality', line, re.IGNORECASE):
            for check_line in [line, lines[i + 1] if i + 1 < len(lines) else ""]:
                m = re.search(r'\b(Indian|Nepalese|Bhutanese|Bangladeshi|Pakistani|Sri\s*Lankan|Chinese|American|British|Canadian|Australian|German|French|Japanese|Korean)\b', check_line, re.IGNORECASE)
                if m:
                    fields["nationality"] = m.group(1).strip()
                    break
            break

    if fields["nationality"] == "Not detected":
        m = re.search(r'\b(Indian|Nepalese|Bhutanese|Bangladeshi|Pakistani|Sri\s*Lankan|Chinese)\b', text, re.IGNORECASE)
        if m:
            fields["nationality"] = m.group(1).strip()

    # --- Gender ---
    # Handle both Tesseract (header+value on next line) and RapidOCR (two-column layout)
    for i, line in enumerate(lines):
        if re.search(r'(?:Gender|Sex|ender)', line, re.IGNORECASE):
            for j in range(i + 1, min(i + 4, len(lines))):
                m = re.search(r'\b(Male|Female|M|F|Other)\b', lines[j], re.IGNORECASE)
                if m:
                    g = m.group(1).upper()
                    fields["gender"] = "Male" if g in ("M", "MALE") else "Female" if g in ("F", "FEMALE") else "Other"
                    break
            if fields["gender"] != "Not detected":
                break

    if fields["gender"] == "Not detected":
        m = re.search(r'\b(Male|Female)\b', text, re.IGNORECASE)
        if m:
            g = m.group(1).upper()
            fields["gender"] = "Male" if g == "MALE" else "Female"

    # --- MRZ detection ---
    mrz_lines = [line for line in lines if re.match(r'^[A-Z0-9<]{20,}', line)]
    if mrz_lines:
        fields["mrz_raw"] = mrz_lines[:3]
        # Recover name from MRZ: "P<INDIND<RAJESH<KUMAR<SINGH<<<" → "RAJESH KUMAR SINGH"
        if fields["name"] != "Not detected" and "<" in mrz_lines[0]:
            m = re.match(r'^P<[A-Z]{3}[A-Z]*<([A-Z<]+)', mrz_lines[0])
            if m:
                mrz_name = m.group(1).replace("<", " ").strip()
                if len(mrz_name) > len(fields["name"]):
                    fields["name"] = mrz_name
        # Recover document number from MRZ: "R45612340000000000IND" → "4561234"
        if fields["document_number"] != "Not detected" and len(mrz_lines) > 1:
            m = re.match(r'^[A-Z](\d{5,15})', mrz_lines[1])
            if m:
                mrz_doc = m.group(1).rstrip("0")
                if len(mrz_doc) == len(re.sub(r'[^0-9]', '', fields["document_number"])):
                    fields["document_number"] = mrz_doc

    return fields


def calculate_ocr_confidence(fields: Dict[str, Any]) -> float:
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
