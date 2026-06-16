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
            # اولویت: name_fa از فایل، سپس نام فایل
            name_fa = data.get("name_fa", district_id)
            
            districts.append({
                "id": district_id,
                "name_fa": name_fa
            })
        except Exception as e:
            print(f"خطا در خواندن {file_path}: {e}")
    
    # مرتب‌سازی بر اساس نام فارسی
    districts.sort(key=lambda x: x["name_fa"])
    
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
        center = geo_json.get("center", [52.532017731377202, 29.786731343898762])
        name_fa = geo_json.get("name_fa", district_id)
        
        for feature in geo_json.get("features", []):
            props = feature.get("properties", {})
            # پشتیبانی از کلیدهای مختلف برای شماره قطعه
            piece_num = props.get("Name") or props.get("name") or props.get("piece_num")
            
            if piece_num:
                # محاسبه مرکز قطعه (از geometry)
                piece_center = calculate_piece_center(feature.get("geometry"))
                # محاسبه مساحت
                area = calculate_polygon_area(feature.get("geometry"))
                
                pieces.append({
                    "number": str(piece_num),
                    "center": piece_center,
                    "area": area or props.get("masahat", 0)
                })
        
        return {
            "district_id": district_id,
            "name_fa": name_fa,
            "center": center,
            "pieces": pieces,
            "geojson": geo_json
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در خواندن فایل: {str(e)}")

def calculate_piece_center(geometry: Dict[str, Any]) -> List[float]:
    """محاسبه نقطه مرکزی یک قطعه"""
    try:
        if geometry["type"] == "Polygon":
            coords = geometry["coordinates"][0]
            lng_sum = sum(p[0] for p in coords)
            lat_sum = sum(p[1] for p in coords)
            count = len(coords)
            return [lng_sum / count, lat_sum / count]
        
        elif geometry["type"] == "MultiPolygon":
            coords = geometry["coordinates"][0][0]
            lng_sum = sum(p[0] for p in coords)
            lat_sum = sum(p[1] for p in coords)
            count = len(coords)
            return [lng_sum / count, lat_sum / count]
        
        return [52.532017731377202, 29.786731343898762]
    except:
        return [52.532017731377202, 29.786731343898762]

def calculate_polygon_area(geometry: Dict[str, Any]) -> float:
    """محاسبه تقریبی مساحت چندضلعی (در صورت نیاز)"""
    try:
        if geometry["type"] == "Polygon":
            coords = geometry["coordinates"][0]
            area = 0
            for i in range(len(coords)):
                j = (i + 1) % len(coords)
                area += coords[i][0] * coords[j][1]
                area -= coords[j][0] * coords[i][1]
            area = abs(area) / 2
            # مقیاس تقریبی (در دنیای واقعی هر درجه ~111 کیلومتر است)
            # این فقط برای تخمین است
            return area * 111000 * 111000 * 0.0001
        return 0
    except:
        return 0