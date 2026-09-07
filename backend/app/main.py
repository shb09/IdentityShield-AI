import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from contextlib import asynccontextmanager

from app.config import UPLOAD_DIR
from app.database import connect_db, close_db, get_db
from app.auth import hash_password
from app.api.auth_routes import router as auth_router
from app.api.screening_routes import router as screening_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    await create_demo_data()
    yield
    await close_db()


app = FastAPI(
    title="IdentityShield AI — Document Screening System",
    description="AI-powered assistive screening platform for identity and travel documents. Smart India Hackathon 2026 - Problem Statement ID: 26188",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(screening_router)

# Serve uploaded files
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


async def create_demo_data():
    """Create synthetic demo records if none exist."""
    db = get_db()
    count = await db.screenings.count_documents({})

    # Create default users if not exist
    admin_exists = await db.users.find_one({"_id": "admin"})
    if not admin_exists:
        await db.users.insert_one({
            "_id": "admin",
            "username": "admin",
            "password_hash": hash_password("admin123"),
            "full_name": "System Administrator",
            "role": "admin",
            "created_at": "2026-09-06T00:00:00",
        })

    officer_exists = await db.users.find_one({"_id": "officer"})
    if not officer_exists:
        await db.users.insert_one({
            "_id": "officer",
            "username": "officer",
            "password_hash": hash_password("officer123"),
            "full_name": "Border Officer",
            "role": "officer",
            "created_at": "2026-09-06T00:00:00",
        })

    if count == 0:
        demo_records = [
            {
                "_id": "DEMO-20260906-001",
                "officer_id": "admin",
                "document_type": "passport",
                "risk_score": 12,
                "risk_level": "LOW",
                "status": "completed",
                "ocr_confidence": 85.0,
                "ocr_result": {
                    "fields": {
                        "name": "RAHUL KUMAR SHARMA",
                        "document_number": "R1234567",
                        "nationality": "Indian",
                        "date_of_birth": "15/03/1990",
                        "date_of_expiry": "14/03/2030",
                        "gender": "Male",
                    },
                    "confidence": 85.0,
                    "status": "complete",
                },
                "validation_result": {
                    "status": "PASS",
                    "checks": [
                        {"check": "Required Fields Present", "status": "PASS", "detail": "All required fields detected"},
                        {"check": "Document Number Format", "status": "PASS", "detail": "Document number format appears valid"},
                        {"check": "Date of Birth Validity", "status": "PASS", "detail": "Age: 36 years - plausible"},
                        {"check": "Document Expiry", "status": "PASS", "detail": "Document valid until 2030-03-14"},
                        {"check": "Field Consistency", "status": "PASS", "detail": "All fields appear internally consistent"},
                    ],
                    "score": 100,
                },
                "tampering_result": {
                    "status": "PASS",
                    "risk_score": 5.0,
                    "suspicious_regions": [],
                    "explanations": ["No significant tampering indicators detected"],
                },
                "face_result": {
                    "status": "MATCH",
                    "similarity_score": 72.5,
                    "document_face_detected": True,
                    "presented_face_detected": True,
                    "explanation": "Strong face similarity: 72.5%",
                },
                "risk_result": {
                    "score": 12,
                    "level": "LOW",
                    "breakdown": {
                        "document_validity": 1.0,
                        "field_consistency": 3.0,
                        "tampering": 2.0,
                        "face_verification": 6.0,
                    },
                    "reasons": ["No significant risk indicators detected"],
                },
                "explanation": ["No significant risk indicators detected"],
                "document_image": None,
                "visa_image": None,
                "face_image": None,
                "demo_mode": True,
                "created_at": "2026-09-06T10:00:00",
                "completed_at": "2026-09-06T10:00:05",
            },
            {
                "_id": "DEMO-20260906-002",
                "officer_id": "admin",
                "document_type": "passport",
                "risk_score": 78,
                "risk_level": "HIGH",
                "status": "completed",
                "ocr_confidence": 72.0,
                "ocr_result": {
                    "fields": {
                        "name": "PRIYA DEVI VERMA",
                        "document_number": "P9876543",
                        "nationality": "Indian",
                        "date_of_birth": "22/07/1985",
                        "date_of_expiry": "21/07/2020",
                        "gender": "Female",
                    },
                    "confidence": 72.0,
                    "status": "complete",
                },
                "validation_result": {
                    "status": "WARNING",
                    "checks": [
                        {"check": "Required Fields Present", "status": "PASS", "detail": "All required fields detected"},
                        {"check": "Document Number Format", "status": "PASS", "detail": "Document number format appears valid"},
                        {"check": "Date of Birth Validity", "status": "PASS", "detail": "Age: 41 years - plausible"},
                        {"check": "Document Expiry", "status": "FAIL", "detail": "Document expired on 2020-07-21"},
                        {"check": "Field Consistency", "status": "PASS", "detail": "All fields appear internally consistent"},
                    ],
                    "score": 55,
                },
                "tampering_result": {
                    "status": "SUSPICIOUS",
                    "risk_score": 72.0,
                    "suspicious_regions": [
                        {"x": 120, "y": 80, "w": 96, "h": 96, "reason": "Color shift in photo region", "type": "color_inconsistency"},
                        {"x": 200, "y": 200, "w": 64, "h": 64, "reason": "Unusual noise level", "type": "noise_anomaly"},
                    ],
                    "explanations": [
                        "Noise: Found 2 regions with unusual noise patterns",
                        "Color: Found 1 color-inconsistent region",
                    ],
                },
                "face_result": {
                    "status": "MATCH",
                    "similarity_score": 68.0,
                    "document_face_detected": True,
                    "presented_face_detected": True,
                    "explanation": "Moderate face similarity: 68.0%",
                },
                "risk_result": {
                    "score": 78,
                    "level": "HIGH",
                    "breakdown": {
                        "document_validity": 16.0,
                        "field_consistency": 5.6,
                        "tampering": 43.2,
                        "face_verification": 13.2,
                    },
                    "reasons": [
                        "Document validation has warnings",
                        "Document shows signs of tampering",
                        "Found 2 suspicious regions",
                    ],
                },
                "explanation": [
                    "Document validation has warnings",
                    "Document shows signs of tampering",
                    "Found 2 suspicious regions",
                ],
                "document_image": None,
                "visa_image": None,
                "face_image": None,
                "demo_mode": True,
                "created_at": "2026-09-06T11:30:00",
                "completed_at": "2026-09-06T11:30:08",
            },
            {
                "_id": "DEMO-20260906-003",
                "officer_id": "admin",
                "document_type": "passport",
                "risk_score": 85,
                "risk_level": "HIGH",
                "status": "completed",
                "ocr_confidence": 88.0,
                "ocr_result": {
                    "fields": {
                        "name": "AMIT SINGH PATEL",
                        "document_number": "A5678901",
                        "nationality": "Indian",
                        "date_of_birth": "10/11/1988",
                        "date_of_expiry": "09/11/2028",
                        "gender": "Male",
                    },
                    "confidence": 88.0,
                    "status": "complete",
                },
                "validation_result": {
                    "status": "PASS",
                    "checks": [
                        {"check": "Required Fields Present", "status": "PASS", "detail": "All required fields detected"},
                        {"check": "Document Number Format", "status": "PASS", "detail": "Document number format appears valid"},
                        {"check": "Date of Birth Validity", "status": "PASS", "detail": "Age: 37 years - plausible"},
                        {"check": "Document Expiry", "status": "PASS", "detail": "Document valid until 2028-11-09"},
                        {"check": "Field Consistency", "status": "PASS", "detail": "All fields appear internally consistent"},
                    ],
                    "score": 100,
                },
                "tampering_result": {
                    "status": "PASS",
                    "risk_score": 8.0,
                    "suspicious_regions": [],
                    "explanations": ["No significant tampering indicators detected"],
                },
                "face_result": {
                    "status": "MISMATCH",
                    "similarity_score": 22.0,
                    "document_face_detected": True,
                    "presented_face_detected": True,
                    "explanation": "Low face similarity: 22.0% - faces appear different",
                },
                "risk_result": {
                    "score": 85,
                    "level": "HIGH",
                    "breakdown": {
                        "document_validity": 1.0,
                        "field_consistency": 2.4,
                        "tampering": 2.4,
                        "face_verification": 27.0,
                    },
                    "reasons": [
                        "Face mismatch between document and presented person",
                    ],
                },
                "explanation": [
                    "Face mismatch between document and presented person",
                ],
                "document_image": None,
                "visa_image": None,
                "face_image": None,
                "demo_mode": True,
                "created_at": "2026-09-06T14:15:00",
                "completed_at": "2026-09-06T14:15:06",
            },
        ]

        await db.screenings.insert_many(demo_records)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
