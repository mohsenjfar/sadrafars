import json
import os
from shapely.geometry import Polygon, MultiPolygon, shape
from shapely.ops import unary_union
import re

def standardize_geojson(input_file, output_file=None):
    """
    استانداردسازی فایل GeoJSON ناحیه
    
    Args:
        input_file: مسیر فایل ورودی
        output_file: مسیر فایل خروجی (اختیاری - اگر ندهید، فایل ورودی را بازنویسی می‌کند)
    
    Returns:
        dict: داده استاندارد شده
    """
    
    # خواندن فایل
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # ========== ۱. استانداردسازی سطح اصلی ==========
    standardized = {
        "type": "FeatureCollection",
        "name": extract_name(data),
        "centroid": None,  # بعداً محاسبه می‌شود
        "crs": {
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        },
        "features": []
    }
    
    # ========== ۲. پردازش هر Feature ==========
    features = data.get('features', [])
    all_centroids = []
    
    for feature in features:
        # استانداردسازی properties
        props = feature.get('properties', {})
        
        # استخراج نام (Name یا name)
        name = props.get('name') or props.get('Name')
        if not name:
            # اگر هیچ نامی نبود، از فیلدهای دیگر استفاده کن
            name = props.get('id') or props.get('ID') or f"قطعه_{len(all_centroids)+1}"
        
        # استخراج مساحت (area_m2 یا masahat یا area)
        area = props.get('area_m2') or props.get('masahat') or props.get('area')
        if area:
            try:
                area = round(float(area), 2)  # دقت ۲ رقم اعشار
            except:
                area = 0.0
        else:
            area = 0.0
        
        # استانداردسازی geometry
        geometry = feature.get('geometry')
        if not geometry:
            continue
            
        # تبدیل MultiPolygon به Polygon اگر فقط یک تکه باشد
        geom_type = geometry.get('type')
        if geom_type == 'MultiPolygon' and len(geometry.get('coordinates', [])) == 1:
            geometry = {
                "type": "Polygon",
                "coordinates": geometry['coordinates'][0]
            }
        elif geom_type == 'MultiPolygon':
            # اگر چندتکه است، فعلاً همان را نگه دار
            pass
        
        # محاسبه centroid برای این قطعه
        try:
            shapely_geom = shape(geometry)
            centroid = shapely_geom.centroid
            centroid_coords = [round(centroid.x, 6), round(centroid.y, 6)]
        except:
            # اگر محاسبه نشد، از مرکز محدوده استفاده کن
            coords = extract_coordinates(geometry)
            if coords:
                centroid_coords = calculate_center_from_coords(coords)
            else:
                centroid_coords = [0, 0]
        
        all_centroids.append(centroid_coords)
        
        # ساخت Feature استاندارد
        standardized_feature = {
            "type": "Feature",
            "geometry": geometry,
            "properties": {
                "name": str(name),
                "area_m2": area,
                "centroid": centroid_coords
            }
        }
        
        # اگر فیلدهای اضافی مهمی وجود دارد، نگه دار
        extra_fields = ['description', 'district', 'population', 'color', 'type']
        for field in extra_fields:
            if field in props:
                standardized_feature['properties'][field] = props[field]
        
        standardized['features'].append(standardized_feature)
    
    # ========== ۳. محاسبه centroid کل منطقه ==========
    if all_centroids:
        # روش ۱: میانگین centroid قطعات
        avg_lon = sum(c[0] for c in all_centroids) / len(all_centroids)
        avg_lat = sum(c[1] for c in all_centroids) / len(all_centroids)
        standardized['centroid'] = [round(avg_lon, 6), round(avg_lat, 6)]
        
        # روش ۲: (اختیاری) محاسبه از روی همه نقاط
        try:
            all_polygons = []
            for feature in standardized['features']:
                geom = feature['geometry']
                shapely_geom = shape(geom)
                all_polygons.append(shapely_geom)
            
            if all_polygons:
                multi_poly = unary_union(all_polygons)
                region_centroid = multi_poly.centroid
                if region_centroid.is_valid:
                    standardized['centroid'] = [
                        round(region_centroid.x, 6),
                        round(region_centroid.y, 6)
                    ]
        except:
            pass  # در صورت خطا، همان میانگین قبلی استفاده می‌شود
    
    # ========== ۴. ذخیره فایل ==========
    if output_file is None:
        output_file = input_file
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(standardized, f, ensure_ascii=False, indent=2)
    
    print(f"✅ فایل استاندارد شد: {output_file}")
    print(f"   - تعداد قطعات: {len(standardized['features'])}")
    print(f"   - مرکز منطقه: {standardized['centroid']}")
    
    return standardized


def extract_name(data):
    """استخراج نام ناحیه از روش‌های مختلف"""
    # اولویت ۱: name_fa
    if 'name_fa' in data:
        return data['name_fa']
    
    # اولویت ۲: name
    if 'name' in data:
        return data['name']
    
    # اولویت ۳: از نام فایل
    return "منطقه"


def extract_coordinates(geometry):
    """استخراج همه مختصات از یک geometry"""
    coords = []
    geom_type = geometry.get('type')
    
    if geom_type == 'Polygon':
        for ring in geometry.get('coordinates', []):
            for point in ring:
                if len(point) >= 2:
                    coords.append([point[0], point[1]])
    
    elif geom_type == 'MultiPolygon':
        for polygon in geometry.get('coordinates', []):
            for ring in polygon:
                for point in ring:
                    if len(point) >= 2:
                        coords.append([point[0], point[1]])
    
    return coords


def calculate_center_from_coords(coords):
    """محاسبه مرکز از روی لیست مختصات"""
    if not coords:
        return [0, 0]
    
    min_lon = min(p[0] for p in coords)
    max_lon = max(p[0] for p in coords)
    min_lat = min(p[1] for p in coords)
    max_lat = max(p[1] for p in coords)
    
    center = [
        round((min_lon + max_lon) / 2, 6),
        round((min_lat + max_lat) / 2, 6)
    ]
    return center


def clean_coordinates(geometry):
    """پاکسازی مختصات (حذف Z اگر هست)"""
    geom_type = geometry.get('type')
    
    if geom_type == 'Polygon':
        new_coords = []
        for ring in geometry.get('coordinates', []):
            new_ring = []
            for point in ring:
                # فقط ۲ مختصات اول را نگه دار
                new_ring.append([point[0], point[1]])
            new_coords.append(new_ring)
        geometry['coordinates'] = new_coords
    
    elif geom_type == 'MultiPolygon':
        new_coords = []
        for polygon in geometry.get('coordinates', []):
            new_polygon = []
            for ring in polygon:
                new_ring = []
                for point in ring:
                    new_ring.append([point[0], point[1]])
                new_polygon.append(new_ring)
            new_coords.append(new_polygon)
        geometry['coordinates'] = new_coords
    
    return geometry


# ========== استفاده ==========

def process_all_files(input_folder, output_folder=None):
    """
    پردازش همه فایل‌های GeoJSON در یک پوشه
    
    Args:
        input_folder: پوشه حاوی فایل‌های ورودی
        output_folder: پوشه خروجی (اختیاری - اگر ندهید، فایل‌ها را جایگزین می‌کند)
    """
    if output_folder is None:
        output_folder = input_folder
    
    # ایجاد پوشه خروجی اگر وجود ندارد
    os.makedirs(output_folder, exist_ok=True)
    
    # پیدا کردن همه فایل‌های GeoJSON
    geojson_files = [f for f in os.listdir(input_folder) if f.endswith('.geojson')]
    
    if not geojson_files:
        print("⚠️ هیچ فایل GeoJSON پیدا نشد!")
        return
    
    print(f"🔍 {len(geojson_files)} فایل پیدا شد\n")
    
    for filename in geojson_files:
        input_path = os.path.join(input_folder, filename)
        
        # اگر پوشه خروجی متفاوت است
        if output_folder != input_folder:
            output_path = os.path.join(output_folder, filename)
        else:
            # بازنویسی فایل اصلی
            output_path = input_path
        
        print(f"📁 در حال پردازش: {filename}")
        try:
            standardize_geojson(input_path, output_path)
            print()
        except Exception as e:
            print(f"❌ خطا در پردازش {filename}: {str(e)}\n")


# ========== مثال استفاده ==========

if __name__ == "__main__":
    # مثال ۱: پردازش یک فایل
    standardize_geojson('baharestan.geojson', 'baharestan_standard.geojson')
    
    # مثال ۲: پردازش همه فایل‌های یک پوشه
    # process_all_files('input_folder', 'output_folder')
    
    # مثال ۳: پردازش همه فایل‌ها و بازنویسی
    # process_all_files('geojson_files')
    
    # مثال ۴: پردازش یک فایل و بازنویسی خودش
    # standardize_geojson('14hectari.geojson')