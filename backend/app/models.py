from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum


class DocumentType(str, Enum):
    PASSPORT = "passport"
    NATIONAL_ID = "national_id"
    VISA = "visa"
    DRIVING_LICENSE = "driving_license"
    PERMIT = "permit"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class VerificationStatus(str, Enum):
    PASS = "PASS"
    WARNING = "WARNING"
    FAIL = "FAIL"
    SUSPICIOUS = "SUSPICIOUS"
    MATCH = "MATCH"
    MISMATCH = "MISMATCH"
    POSSIBLE_MATCH = "POSSIBLE_MATCH"
    NOT_DETECTED = "NOT_DETECTED"


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class OCRResult(BaseModel):
    fields: Dict[str, Any] = {}
    confidence: float = 0.0
    mrz_info: Optional[Dict[str, str]] = None
    raw_text: str = ""
    status: str = "complete"


class ValidationResult(BaseModel):
    status: VerificationStatus = VerificationStatus.PASS
    checks: List[Dict[str, Any]] = []
    score: float = 100.0


class TamperingResult(BaseModel):
    status: VerificationStatus = VerificationStatus.PASS
    risk_score: float = 0.0
    suspicious_regions: List[Dict[str, Any]] = []
    explanations: List[str] = []


class FaceResult(BaseModel):
    status: VerificationStatus = VerificationStatus.MATCH
    similarity_score: float = 0.0
    document_face_detected: bool = False
    presented_face_detected: bool = False
    explanation: str = ""


class RiskAssessment(BaseModel):
    score: int = 0
    level: RiskLevel = RiskLevel.LOW
    breakdown: Dict[str, float] = {}
    reasons: List[str] = []


class ScreeningResponse(BaseModel):
    screening_id: str
    status: str
    document_type: str
    ocr: OCRResult
    validation: ValidationResult
    tampering: TamperingResult
    face: FaceResult
    risk: RiskAssessment
    document_image_url: Optional[str] = None
    created_at: str


class CaseListItem(BaseModel):
    id: str
    document_type: str
    risk_score: int
    risk_level: str
    status: str
    created_at: str
    demo_mode: bool = False


class DashboardStats(BaseModel):
    total_screenings: int = 0
    low_risk: int = 0
    medium_risk: int = 0
    high_risk: int = 0
    recent_cases: List[Dict[str, Any]] = []
