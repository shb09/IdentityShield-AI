#!/bin/bash
echo "========================================="
echo " IdentityShield AI — Document Screening System"
echo " Smart India Hackathon 2026"
echo " Problem Statement ID: 26188 | Ministry of Home Affairs | SSB"
echo "========================================="
echo ""

# Check tesseract
if ! command -v tesseract &> /dev/null; then
    echo "[!] Tesseract not found. Installing via Homebrew..."
    brew install tesseract
fi

# Setup backend
echo "[1/4] Setting up backend..."
cd backend
pip install -r requirements.txt -q 2>/dev/null
echo "  ✓ Backend dependencies installed"

# Setup frontend
echo "[2/4] Setting up frontend..."
cd ../frontend
npm install --silent 2>/dev/null
echo "  ✓ Frontend dependencies installed"

# Start backend
echo "[3/4] Starting backend server..."
cd ../backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
sleep 2

# Start frontend
echo "[4/4] Starting frontend dev server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
sleep 2

echo ""
echo "========================================="
echo " Servers running:"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo ""
echo " Login: admin / admin123"
echo "========================================="
echo ""

# Wait for both
wait
