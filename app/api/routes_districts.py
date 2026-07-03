# app/api/routes_districts.py
from fastapi import APIRouter, HTTPException
from pathlib import Path
import json
from typing import List, Dict

router = APIRouter(prefix="/api/districts", tags=["Districts"])

# مسیر پوشه نواحی
DISTRICTS_DIR = Path("static/data/districts")

def get_district_files() -> List[Dict[str, str]]:
    """اسکن پوشه و استخراج نام و نام فارسی نواحی"""
    districts = []
    
    if not DISTRICTS_DIR.exists():
        return districts
    
    for file_path in DISTRICTS_DIR.glob("*.geojson"):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            district_id = file_path.stem  # نام فایل بدون پسوند
            # اولویت: name از فایل، سپس نام فایل
            name = data.get("name", district_id)
            
            districts.append({
                "id": district_id,
                "name": name
            })
        except Exception as e:
            print(f"خطا در خواندن {file_path}: {e}")
    
    # مرتب‌سازی بر اساس نام فارسی
    districts.sort(key=lambda x: x["name"])
    
    return districts

@router.get("")
async def get_districts_list():
    """لیست تمام نواحی موجود"""
    return {
        "districts": get_district_files(),
        "city_center": [52.532017731377202, 29.786731343898762],
        "default_zoom": 50
    }

@router.get("/{district_id}/load")
async def load_district(district_id: str):
    """بارگذاری یک ناحیه خاص با تمام قطعات"""
    file_path = DISTRICTS_DIR / f"{district_id}.geojson"
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="ناحیه یافت نشد")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            geo_json = json.load(f)
        
        # استخراج لیست قطعات از ویژگی‌ها
        pieces = []
        centroid = geo_json.get("centroid", [52.532017731377202, 29.786731343898762])
        name = geo_json.get("name", district_id)
        
        for feature in geo_json.get("features", []):
            props = feature.get("properties", {})         
            pieces.append({
                "name": props.get("name"),
                "centroid": props.get("centroid", []),
                "area_m2": props.get("area_m2", 0)
            })
        
        return {
            "district_id": district_id,
            "name": name,
            "centroid": centroid,
            "pieces": pieces,
            "geojson": geo_json
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در خواندن فایل: {str(e)}")