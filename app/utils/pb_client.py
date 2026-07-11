# app/utils/pb_client.py
from pocketbase import PocketBase
import os
from typing import Optional, Dict, List

class PBClient:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        self.url = os.getenv("PB_URL", "http://pocketbase:8090")
        self.client = PocketBase(self.url)
        self.admin_email = os.getenv("PB_ADMIN_EMAIL", "admin@example.com")
        self.admin_password = os.getenv("PB_ADMIN_PASSWORD", "password123")
        
        # اتصال به عنوان ادمین
        try:
            self.admin = self.client.admins.auth_with_password(
                self.admin_email,
                self.admin_password
            )
            print(f"✅ Connected to PocketBase at {self.url}")
        except Exception as e:
            print(f"❌ Failed to connect to PocketBase: {e}")
            self.admin = None
    
    def get_client(self):
        return self.client
    
    def get_user_profile(self, user_id: str) -> Optional[Dict]:
        try:
            result = self.client.collection("user_profiles").get_list(
                1, 1,
                filter=f'user = "{user_id}"'
            )
            if result.items:
                return result.items[0]
            return None
        except:
            return None
    
    def create_or_update_profile(self, user_id: str, data: Dict) -> Dict:
        existing = self.get_user_profile(user_id)
        
        if existing:
            return self.client.collection("user_profiles").update(
                existing.id,
                data
            )
        else:
            data["user"] = user_id
            return self.client.collection("user_profiles").create(data)
    
    def save_calculation(self, user_id: str, calc_type: str, input_data: Dict, result: Dict) -> Dict:
        data = {
            "user": user_id,
            "calculation_type": calc_type,
            "input_data": input_data,
            "result": result,
            "total_amount": result.get("total_amount", 0)
        }
        return self.client.collection("calculations").create(data)
    
    def get_user_calculations(self, user_id: str, limit: int = 50) -> List:
        try:
            result = self.client.collection("calculations").get_list(
                1, limit,
                filter=f'user = "{user_id}"',
                sort="-saved_at"
            )
            return result.items
        except:
            return []
    
    def add_favorite_district(self, user_id: str, district_id: str, district_name: str, notes: str = "") -> Dict:
        data = {
            "user": user_id,
            "district_id": district_id,
            "district_name": district_name,
            "notes": notes
        }
        return self.client.collection("favorite_districts").create(data)
    
    def get_favorite_districts(self, user_id: str) -> List:
        try:
            result = self.client.collection("favorite_districts").get_list(
                1, 100,
                filter=f'user = "{user_id}"',
                sort="-added_at"
            )
            return result.items
        except:
            return []