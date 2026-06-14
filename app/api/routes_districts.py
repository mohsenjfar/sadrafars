# app/api/routes_districts.py
from fastapi import APIRouter, HTTPException
from pathlib import Path
import json
from typing import List, Dict, Any

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
            name_fa = data.get("name_fa", district_id)  # از فایل بخوان
            
            districts.append({
                "id": district_id,
                "name_fa": name_fa
            })
        except Exception as e:
            print(f"خطا در خواندن {file_path}: {e}")
    
    return districts

@router.get("")
async def get_districts_list():
    """لیست تمام نواحی موجود"""
    return {
        "districts": get_district_files(),
        "city_center": [52.532017731377202, 29.786731343898762],  # مرکز صدرا
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
        center = geo_json.get("center", [52.532017731377202, 29.786731343898762])
        
        for feature in geo_json.get("features", []):
            props = feature.get("properties", {})
            piece_num = props.get("Name") or props.get("name")
            
            if piece_num:
                # محاسبه مرکز قطعه (از geometry)
                piece_center = calculate_piece_center(feature.get("geometry"))
                
                pieces.append({
                    "number": str(piece_num),
                    "center": piece_center,
                    "area": props.get("masahat", 0)
                })
        
        return {
            "district_id": district_id,
            "name_fa": geo_json.get("name_fa", district_id),
            "center": center,
            "pieces": pieces,
            "geojson": geo_json  # ارسال کامل GeoJSON برای نمایش روی نقشه
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در خواندن فایل: {str(e)}")

def calculate_piece_center(geometry: Dict[str, Any]) -> List[float]:
    """محاسبه نقطه مرکزی یک قطعه (اولین نقطه از اولین چندضلعی)"""
    try:
        if geometry["type"] == "Polygon":
            coords = geometry["coordinates"][0]
            # میانگین مختصات
            lng_sum = sum(p[0] for p in coords)
            lat_sum = sum(p[1] for p in coords)
            count = len(coords)
            return [lng_sum / count, lat_sum / count]
        
        elif geometry["type"] == "MultiPolygon":
            # از اولین Polygon استفاده کن
            coords = geometry["coordinates"][0][0]
            lng_sum = sum(p[0] for p in coords)
            lat_sum = sum(p[1] for p in coords)
            count = len(coords)
            return [lng_sum / count, lat_sum / count]
        
        return [52.532017731377202, 29.786731343898762]
    except:
        return [52.532017731377202, 29.786731343898762]