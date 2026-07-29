# app/api/routes_auth.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from app.utils.pb_client import PBClient
from app.utils.auth import AuthMiddleware
from typing import Optional, Dict

router = APIRouter(prefix="/auth", tags=["Authentication"])
pb = PBClient()
auth_middleware = AuthMiddleware()

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    password_confirm: str
    username: str
    full_name: str
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
async def register_user(data: RegisterRequest):
    try:
        if data.password != data.password_confirm:
            raise HTTPException(status_code=400, detail="Passwords do not match")
        
        user = pb.client.collection("users").create({
            "email": data.email,
            "password": data.password,
            "passwordConfirm": data.password_confirm,
            "username": data.username,
            "verified": False
        })
        
        profile_data = {
            "user": user.id,
            "full_name": data.full_name,
            "phone": data.phone or "",
            "role": "user"
        }
        pb.create_or_update_profile(user.id, profile_data)
        
        return {
            "message": "User registered successfully",
            "user_id": user.id,
            "email": user.email
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login_user(data: LoginRequest):
    try:
        auth_data = pb.client.collection("users").auth_with_password(
            data.email,
            data.password
        )
        
        profile = pb.get_user_profile(auth_data.record.id)
        
        return {
            "token": auth_data.token,
            "user": {
                "id": auth_data.record.id,
                "email": auth_data.record.email,
                "username": auth_data.record.username,
                "verified": auth_data.record.verified,
                "profile": profile
            }
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/me")
async def get_me(user: Dict = Depends(auth_middleware.get_current_user)):
    return {"user": user}