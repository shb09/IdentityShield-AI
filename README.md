# IdentityShield AI

### AI-Based Fake Identity & Document Screening System

> **Smart India Hackathon 2026**
> Problem Statement ID: 26188
> Ministry of Home Affairs | Sashastra Seema Bal (SSB), Police II Division
> Theme: Blockchain & Cybersecurity | Category: Software

---

## What It Does

IdentityShield AI is an **AI-assisted screening platform** that analyzes identity and travel documents and produces an **explainable risk assessment**. It is an assistive tool — it does NOT replace government verification systems or border officers.

### Multi-Signal Analysis

| Module | Technology | What It Does |
|--------|-----------|--------------|
| **OCR Extraction** | Tesseract | Extracts name, document number, DOB, nationality, expiry from document images |
| **Document Validation** | Rule-based engine | Validates dates, formats, expiry, field consistency |
| **Tampering Detection** | Image forensics (PIL + NumPy) | Detects noise anomalies, color shifts, edge inconsistencies, compression artifacts |
| **Face Verification** | Histogram + structural analysis | Compares document face vs presented person |
| **Risk Engine** | Weighted scoring | Produces explainable 0–100 risk score with contributing factors |

### Explainable Risk Scoring

Instead of "AI says fake," the system shows:
- **Risk Score:** 0–100 (LOW / MEDIUM / HIGH)
- **Contributing Factors:** Exactly which module flagged what
- **Score Breakdown:** How much each module contributed

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Tesseract OCR

### Install Tesseract
```bash
# macOS
brew install tesseract

# Ubuntu/Debian
sudo apt install tesseract-ocr

# Windows — download from https://github.com/tesseract-ocr/tesseract
```

### Start Everything
```bash
cd fake-id-screener
chmod +x start.sh
./start.sh
```

### Or Start Manually

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Access
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Default Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | System Admin |
| `officer` | `officer123` | Border Officer |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              React Frontend (Vite)              │
│         Tailwind CSS • Lucide Icons            │
└──────────────────────┬──────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────┐
│              FastAPI Backend (Python)            │
│    JWT Auth • File Upload • REST API            │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────┐  ┌────────────┐  ┌──────────────┐ │
│  │   OCR   │  │ Validation │  │  Tampering   │ │
│  │Tesseract│  │   Rules    │  │ PIL + NumPy  │ │
│  └────┬────┘  └─────┬──────┘  └──────┬───────┘ │
│       │             │                │          │
│  ┌────▼─────────────▼────────────────▼───────┐  │
│  │           Risk Engine (Weighted)           │  │
│  └────────────────────┬──────────────────────┘  │
│                       │                          │
│  ┌────────────────────▼──────────────────────┐  │
│  │         Face Verification                  │  │
│  │    Histogram + Structural + Texture        │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
└──────────────────────┬──────────────────────────┘
                       │
              ┌────────▼────────┐
              │  SQLite Database │
              │  (screenings.db) │
              └─────────────────┘
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Authenticate officer |
| GET | `/api/auth/me` | Yes | Get current user profile |
| POST | `/api/screen` | Yes | Run full document screening |
| GET | `/api/cases` | Yes | List all screening cases |
| GET | `/api/cases/{id}` | Yes | Get detailed case analysis |
| GET | `/api/dashboard/stats` | Yes | Dashboard statistics |
| GET | `/api/health` | No | System health check |

---

## Risk Scoring

### Score Ranges

| Range | Level | Action |
|-------|-------|--------|
| 0–30 | **LOW** | Document appears genuine |
| 31–60 | **MEDIUM** | Some concerns — review recommended |
| 61–100 | **HIGH** | Multiple risk factors — escalate |

### Configurable Weights

```python
RISK_WEIGHTS = {
    "document_validity": 0.20,   # Date checks, expiry, format
    "field_consistency": 0.20,   # OCR confidence, field completeness
    "tampering": 0.30,           # Image forensics analysis
    "face_verification": 0.30,   # Document vs presented face
}
```

---

## Demo Scenarios

Three pre-loaded synthetic test cases:

| Case | Score | Level | Scenario |
|------|-------|-------|----------|
| DEMO-001 | 12/100 | LOW | Genuine document, face match |
| DEMO-002 | 78/100 | HIGH | Tampered document (expired + suspicious regions) |
| DEMO-003 | 85/100 | HIGH | Identity mismatch (face doesn't match) |

All demo data is labeled **"DEMO / SYNTHETIC DATA"**.

---

## Project Structure

```
fake-id-screener/
├── README.md
├── DEMO_SCRIPT.md          # Live demo walkthrough for judges
├── start.sh                # One-click startup script
├── .gitignore
│
├── backend/
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py         # FastAPI app + demo data
│   │   ├── config.py       # Configuration
│   │   ├── database.py     # SQLite setup
│   │   ├── models.py       # Pydantic models
│   │   ├── auth.py         # JWT authentication
│   │   ├── api/
│   │   │   ├── auth_routes.py
│   │   │   └── screening_routes.py
│   │   ├── services/
│   │   │   ├── ocr_service.py
│   │   │   ├── validation_service.py
│   │   │   ├── tampering_service.py
│   │   │   ├── face_service.py
│   │   │   └── risk_service.py
│   │   └── utils/
│   │       └── helpers.py
│   ├── uploads/            # Uploaded document images
│   └── demo_data/          # Synthetic test documents
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── components/
        │   ├── Layout.jsx
        │   ├── RiskBadge.jsx
        │   ├── StatusCard.jsx
        │   └── DocumentPreview.jsx
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── NewScreening.jsx
            ├── ScreeningResult.jsx
            └── History.jsx
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons |
| Backend | Python, FastAPI, Uvicorn |
| OCR | Tesseract (pytesseract) |
| Image Analysis | PIL/Pillow, NumPy |
| Face Detection | OpenCV Haar Cascade + skin-color heuristics |
| Authentication | JWT (python-jose), PBKDF2 hashing |
| Database | SQLite |
| Fonts | Inter, JetBrains Mono |

---

## Security Features

- JWT-based authentication with token expiry
- Role-based access control (admin / officer)
- File type validation (JPEG, PNG, WebP only)
- File size limits (10MB max)
- Secure temporary file handling
- No unnecessary storage of biometric images
- Input validation on all endpoints
- Audit logging for all screenings

---

## Disclaimer

This is a **hackathon prototype** for assistive screening. It:

- Does NOT replace government verification systems
- Does NOT make autonomous rejection decisions
- Does NOT claim forensic-grade certainty
- Does NOT access real government databases
- Uses only synthetic/demo data

**Final decision always remains with authorized personnel.**

---

## Team

- Problem Statement: 26188
- Organization: Ministry of Home Affairs
- Department: Sashastra Seema Bal (SSB), Police II Division
- Theme: Blockchain & Cybersecurity
- Category: Software

---

*IdentityShield AI — Smart India Hackathon 2026*
