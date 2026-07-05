import json
import cv2
import numpy as np
import os
from shapely.geometry import Polygon
from shapely.ops import unary_union

# ============================================================
# CONFIGURATION - Edit these variables
# ============================================================

IMAGE_WIDTH = 800
KERNEL_SIZE = 18
MORPH_ITERATIONS = 3
EPSILON_FACTOR = 0.001
COORDINATE_PRECISION = 6

# ============================================================
# DO NOT EDIT BELOW THIS LINE
# ============================================================

def detect_boundary_from_geojson(geojson_data):
    """
    Detect boundary using image processing from GeoJSON data.
    Returns boundary points and region centroid.
    """
    
    # Extract polygons
    polygons = []
    for feature in geojson_data.get('features', []):
        geom = feature.get('geometry')
        if geom.get('type') == 'Polygon':
            polygons.append(Polygon(geom['coordinates'][0]))
        elif geom.get('type') == 'MultiPolygon':
            for coords in geom['coordinates']:
                polygons.append(Polygon(coords[0]))
    
    if not polygons:
        return [], None
    
    # Calculate bounds
    all_coords = []
    for poly in polygons:
        if poly.geom_type == 'Polygon':
            all_coords.extend(list(poly.exterior.coords))
    
    if not all_coords:
        return [], None
    
    coords_array = np.array(all_coords)
    min_lon, min_lat = coords_array.min(axis=0)
    max_lon, max_lat = coords_array.max(axis=0)
    
    pad_lon = (max_lon - min_lon) * 0.05
    pad_lat = (max_lat - min_lat) * 0.05
    min_lon -= pad_lon
    max_lon += pad_lon
    min_lat -= pad_lat
    max_lat += pad_lat
    
    # Image size
    width = IMAGE_WIDTH
    height = int(width * 0.8)
    
    scale_x = width / (max_lon - min_lon)
    scale_y = height / (max_lat - min_lat)
    
    def to_image_coords(lon, lat):
        x = int((lon - min_lon) * scale_x)
        y = int((max_lat - lat) * scale_y)
        return x, y
    
    def to_geo_coords(x, y):
        lon = min_lon + x / scale_x
        lat = max_lat - y / scale_y
        return lon, lat
    
    # Create image
    img = np.ones((height, width, 3), dtype=np.uint8) * 255
    
    # Draw pieces
    for poly in polygons:
        if poly.geom_type == 'Polygon':
            coords = list(poly.exterior.coords)
            points = [to_image_coords(lon, lat) for lon, lat in coords]
            points = np.array(points, dtype=np.int32)
            cv2.fillPoly(img, [points], (200, 200, 200))
            cv2.polylines(img, [points], True, (0, 0, 0), 1)
    
    # Boundary detection
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)
    
    kernel = np.ones((KERNEL_SIZE, KERNEL_SIZE), np.uint8)
    connected = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel, iterations=MORPH_ITERATIONS)
    
    contours, hierarchy = cv2.findContours(connected, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    mask = np.zeros_like(connected)
    
    if hierarchy is not None:
        for i, cnt in enumerate(contours):
            if hierarchy[0][i][3] == -1:
                cv2.drawContours(mask, [cnt], -1, 255, -1)
    
    contours_final, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours_final:
        return [], None
    
    main_contour = max(contours_final, key=cv2.contourArea)
    
    epsilon = EPSILON_FACTOR * cv2.arcLength(main_contour, True)
    simplified = cv2.approxPolyDP(main_contour, epsilon, True)
    
    # Convert boundary points back to GeoJSON coordinates
    boundary_points = []
    for point in simplified:
        x, y = point[0]
        lon, lat = to_geo_coords(x, y)
        boundary_points.append([round(lon, COORDINATE_PRECISION), round(lat, COORDINATE_PRECISION)])
    
    if boundary_points[0] != boundary_points[-1]:
        boundary_points.append(boundary_points[0])
    
    # Calculate centroid from boundary points
    boundary_np = np.array(boundary_points)
    centroid_lon = np.mean(boundary_np[:, 0])
    centroid_lat = np.mean(boundary_np[:, 1])
    region_centroid = [round(centroid_lon, 6), round(centroid_lat, 6)]
    
    return boundary_points, region_centroid


def process_file(file_path):
    """Process a single GeoJSON file: remove old boundary, add new one."""
    
    print(f"📄 Processing: {os.path.basename(file_path)}")
    
    # Load file
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Remove old boundary if exists
    if 'boundary' in data:
        del data['boundary']
        print("   🗑️ Old boundary removed")
    
    if 'boundary_count' in data:
        del data['boundary_count']
        print("   🗑️ Old boundary_count removed")
    
    # Detect new boundary using image processing
    print("   🔍 Detecting new boundary with image processing...")
    boundary_points, region_centroid = detect_boundary_from_geojson(data)
    
    if not boundary_points:
        print("   ❌ No boundary detected! Skipping...")
        return False
    
    # Add new boundary
    data['boundary'] = boundary_points
    data['boundary_count'] = len(boundary_points)
    data['centroid'] = region_centroid
    
    print(f"   ✅ New boundary added: {len(boundary_points)} points")
    print(f"   ✅ New centroid: {region_centroid}")
    
    # Save file (overwrite)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    return True


def main():
    """Process all GeoJSON files in the current folder."""
    
    current_folder = os.getcwd()
    geojson_files = [f for f in os.listdir(current_folder) if f.endswith('.geojson')]
    
    if not geojson_files:
        print("⚠️ No GeoJSON files found in current folder!")
        return
    
    print("=" * 60)
    print("📁 Current folder:", current_folder)
    print(f"🔍 Found {len(geojson_files)} GeoJSON file(s)")
    print("=" * 60)
    print()
    
    success_count = 0
    error_count = 0
    
    for filename in geojson_files:
        file_path = os.path.join(current_folder, filename)
        
        try:
            if process_file(file_path):
                success_count += 1
            else:
                error_count += 1
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            error_count += 1
        
        print()
    
    # Final report
    print("=" * 60)
    print("📊 Final Report:")
    print(f"   ✅ Success: {success_count} file(s)")
    print(f"   ❌ Failed: {error_count} file(s)")
    print("=" * 60)


if __name__ == "__main__":
    main()