# app/utils/auth.py
from fastapi import HTTPException, Depends, Header
from app.utils.pb_client import PBClient
from typing import Optional, Dict

class AuthMiddleware:
    def __init__(self):
        self.pb = PBClient()
    
    async def verify_token(self, authorization: str = Header(...)) -> Dict:
        try:
            if not authorization.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Invalid token format")
            
            token = authorization.split(" ")[1]
            auth_data = self.pb.client.collection("users").auth_refresh(token)
            
            if not auth_data or not auth_data.record:
                raise HTTPException(status_code=401, detail="Invalid token")
            
            return {
                "user": auth_data.record,
                "token": auth_data.token
            }
        except Exception as e:
            raise HTTPException(status_code=401, detail=str(e))
    
    async def get_current_user(self, authorization: str = Header(...)) -> Dict:
        auth = await self.verify_token(authorization)
        user = auth["user"]
        profile = self.pb.get_user_profile(user.id)
        
        user_data = user.__dict__.copy()
        user_data["profile"] = profile
        return user_data
    
    async def require_admin(self, authorization: str = Header(...)) -> Dict:
        user = await self.get_current_user(authorization)
        if user.get("profile", {}).get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return user