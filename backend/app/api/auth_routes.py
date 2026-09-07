from fastapi import APIRouter, Depends, HTTPException
from app.models import LoginRequest, TokenResponse
from app.auth import verify_password, create_access_token, get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    db = get_db()
    user = await db.users.find_one({"username": request.username})

    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user["_id"], "role": user["role"]})

    return TokenResponse(
        access_token=token,
        user={
            "id": user["_id"],
            "username": user["username"],
            "full_name": user["full_name"],
            "role": user["role"],
        }
    )


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["_id"],
        "username": current_user["username"],
        "full_name": current_user["full_name"],
        "role": current_user["role"],
    }
