import ezdxf
from shapely.geometry import LineString, Polygon, MultiPolygon, Point, MultiLineString
from shapely.ops import polygonize, unary_union
import geopandas as gpd
import pandas as pd
from pyproj import Transformer
import json
import os
import cv2
import numpy as np
from math import sin, cos

# ============================================================
# CONFIGURATION - Edit these variables
# ============================================================

IMAGE_WIDTH = 800
KERNEL_SIZE = 15
MORPH_ITERATIONS = 3
EPSILON_FACTOR = 0.001
COORDINATE_PRECISION = 6

# ============================================================
# DO NOT EDIT BELOW THIS LINE
# ============================================================

# =============================================
# 0. Get district name from user
# =============================================
district_name = input("Enter district name (e.g., Baharestan): ").strip()
if not district_name:
    district_name = "Unknown_District"
    print(f"⚠️ No name entered. Using default: {district_name}")

dxf_path = f"{district_name}.dxf"

# =============================================
# 1. Extract all lines (including curves)
# =============================================
def extract_all_lines(msp, segment_length=0.5):
    lines = []
    for entity in msp:
        if entity.dxftype() == 'LINE':
            start = entity.dxf.start
            end = entity.dxf.end
            lines.append(LineString([(start.x, start.y), (end.x, end.y)]))
        elif entity.dxftype() == 'ARC':
            center = entity.dxf.center
            radius = entity.dxf.radius
            start_angle = entity.dxf.start_angle
            end_angle = entity.dxf.end_angle
            points = []
            for i in range(20):
                angle = (start_angle + (end_angle - start_angle) * i / 20)
                x = center.x + radius * cos(angle)
                y = center.y + radius * sin(angle)
                points.append((x, y))
            lines.append(LineString(points))
        elif entity.dxftype() == 'LWPOLYLINE':
            points = list(entity.get_points())
            if entity.closed and len(points) > 1:
                points.append(points[0])
            for i in range(len(points)-1):
                start = points[i]
                end = points[i+1]
                lines.append(LineString([(start[0], start[1]), (end[0], end[1])]))
    return lines

# =============================================
# 2. Merge lines with buffer
# =============================================
def merge_lines_with_buffer(lines, buffer_distance=0.01):
    multi_line = MultiLineString(lines)
    buffered = multi_line.buffer(buffer_distance)
    if buffered.geom_type == 'Polygon':
        boundary = buffered.boundary
        return list(boundary.geoms) if hasattr(boundary, 'geoms') else [boundary]
    elif buffered.geom_type == 'MultiPolygon':
        boundaries = []
        for poly in buffered.geoms:
            boundaries.append(poly.boundary)
        return boundaries
    return []

# =============================================
# 3. Convert lines to polygons
# =============================================
def lines_to_polygons(lines):
    # unary_union still needed here to connect lines into polygons
    return list(polygonize(unary_union(lines)))

# =============================================
# 4. Extract texts with reversal
# =============================================
def extract_texts(msp):
    texts = []
    for entity in msp.query('TEXT MTEXT'):
        try:
            if entity.dxftype() == 'TEXT':
                insert = entity.dxf.insert
                x = insert.x
                y = insert.y
            else:
                if entity.dxf.hasattr('insert'):
                    insert = entity.dxf.insert
                else:
                    insert = entity.dxf.location
                x = insert.x
                y = insert.y
            text_value = entity.dxf.text.strip()
            if text_value:
                texts.append({
                    'text': text_value[::-1],
                    'geometry': Point(float(x), float(y))
                })
        except:
            continue
    return gpd.GeoDataFrame(texts, crs="EPSG:32639")

# =============================================
# 5. Keep only the highest text per polygon
# =============================================
def keep_highest_text(poly_gdf, text_gdf):
    for idx, row in poly_gdf.iterrows():
        polygon = row.geometry
        points_inside = text_gdf[text_gdf.within(polygon)]
        if not points_inside.empty:
            points_inside['y'] = points_inside.geometry.y
            top_text = points_inside.sort_values('y', ascending=False).iloc[0]['text']
            poly_gdf.at[idx, 'name'] = top_text
    return poly_gdf

# =============================================
# 6. Calculate area and centroid (for each piece)
# =============================================
def calculate_area_and_centroid(poly_gdf):
    poly_gdf['area_m2'] = poly_gdf.geometry.area
    poly_gdf['centroid'] = poly_gdf.geometry.centroid
    return poly_gdf

# =============================================
# 7. Convert UTM to degrees (WGS84)
# =============================================
def convert_to_wgs84(poly_gdf):
    transformer = Transformer.from_crs("EPSG:32639", "EPSG:4326", always_xy=True)
    
    def convert_geom(geom):
        if geom.is_empty:
            return None
        if geom.geom_type == 'Polygon':
            coords = [[transformer.transform(x, y)[0], transformer.transform(x, y)[1]] for x, y in geom.exterior.coords]
            return Polygon(coords)
        elif geom.geom_type == 'MultiPolygon':
            new_polygons = [convert_geom(poly) for poly in geom.geoms]
            return MultiPolygon([p for p in new_polygons if p is not None])
        return None
    
    poly_gdf['geometry'] = poly_gdf['geometry'].apply(convert_geom)
    poly_gdf['centroid'] = poly_gdf.geometry.centroid
    poly_gdf['centroid'] = poly_gdf['centroid'].apply(lambda p: [p.x, p.y] if not p.is_empty else None)
    return poly_gdf

# =============================================
# 8. Detect boundary and centroid using image processing
# =============================================
def detect_boundary_and_centroid_image(poly_gdf):
    """
    Detect boundary and calculate centroid using OpenCV image processing.
    Returns boundary points and region centroid.
    """
    print("🖼️ Detecting boundary and centroid using image processing...")
    
    # Extract polygons for rendering
    polygons = []
    for geom in poly_gdf.geometry:
        if geom.geom_type == 'Polygon':
            polygons.append(geom)
        elif geom.geom_type == 'MultiPolygon':
            for poly in geom.geoms:
                polygons.append(poly)
    
    if not polygons:
        print("❌ No polygons to render!")
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
        print("❌ No boundary detected!")
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
    
    # ============================================================
    # CALCULATE CENTROID FROM IMAGE (boundary points)
    # ============================================================
    # Convert boundary points to numpy array
    boundary_np = np.array(boundary_points)
    
    # Calculate centroid (average of all boundary points)
    centroid_lon = np.mean(boundary_np[:, 0])
    centroid_lat = np.mean(boundary_np[:, 1])
    region_centroid = [round(centroid_lon, 6), round(centroid_lat, 6)]
    
    print(f"✅ Boundary points detected: {len(boundary_points)}")
    print(f"✅ Region centroid from image: {region_centroid}")
    
    return boundary_points, region_centroid

# =============================================
# 9. Save to GeoJSON with boundary and centroid
# =============================================
def save_as_geojson(poly_gdf, district_name, dxf_path, boundary_points, region_centroid):
    output_gdf = poly_gdf[['name', 'area_m2', 'centroid', 'geometry']].copy()
    output_gdf = output_gdf.dropna(subset=['name', 'geometry'])
    
    # Build GeoJSON with boundary
    geojson_data = {
        "type": "FeatureCollection",
        "name": district_name,
        "centroid": region_centroid,  # ← From image processing
        "boundary": boundary_points,
        "boundary_count": len(boundary_points),
        "crs": {
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        },
        "features": []
    }
    
    for _, row in output_gdf.iterrows():
        centroid_coords = row['centroid']
        if centroid_coords:
            centroid_coords = [round(centroid_coords[0], 6), round(centroid_coords[1], 6)]
        
        feature = {
            "type": "Feature",
            "geometry": row['geometry'].__geo_interface__,
            "properties": {
                "name": str(row['name']),
                "area_m2": round(float(row['area_m2']), 2),
                "centroid": centroid_coords
            }
        }
        geojson_data['features'].append(feature)
    
    # Save with input file name
    base_name = os.path.splitext(os.path.basename(dxf_path))[0]
    output_path = f"{base_name}.geojson"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(geojson_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ GeoJSON file saved at:")
    print(output_path)
    print(f"   - Features: {len(geojson_data['features'])}")
    print(f"   - Region centroid (from image): {region_centroid}")
    print(f"   - Boundary points: {len(boundary_points)}")
    return output_path

# =============================================
# Run the complete pipeline
# =============================================
def run_pipeline(dxf_path, district_name):
    # 1. Read file
    print(f"📂 Loading file: {dxf_path}")
    doc = ezdxf.readfile(dxf_path)
    msp = doc.modelspace()
    
    # 2. Extract lines
    lines = extract_all_lines(msp)
    print(f"✅ Lines extracted: {len(lines)}")
    
    # 3. Merge with buffer
    merged = merge_lines_with_buffer(lines, buffer_distance=0.01)
    print(f"✅ Lines merged with buffer: {len(merged)}")
    
    # 4. Convert to polygons (unary_union used here)
    polygons = lines_to_polygons(merged)
    print(f"✅ Polygons created: {len(polygons)}")
    
    # 5. Extract texts
    text_gdf = extract_texts(msp)
    print(f"✅ Texts extracted: {len(text_gdf)}")
    
    # 6. Create polygon GeoDataFrame
    poly_gdf = gpd.GeoDataFrame(geometry=polygons, crs="EPSG:32639")
    
    # 7. Keep the highest text per polygon
    poly_gdf = keep_highest_text(poly_gdf, text_gdf)
    print(f"✅ Lower texts removed, only the highest text per polygon kept")
    
    # 8. Calculate area and centroid (for each piece)
    poly_gdf = calculate_area_and_centroid(poly_gdf)
    print(f"✅ Area and centroid calculated for each piece")
    
    # 9. Convert to WGS84
    poly_gdf = convert_to_wgs84(poly_gdf)
    print(f"✅ Coordinates converted to WGS84 (degrees)")
    
    # 10. Detect boundary AND centroid using image processing
    boundary_points, region_centroid = detect_boundary_and_centroid_image(poly_gdf)
    
    # 11. Save final GeoJSON with boundary and centroid
    output_path = save_as_geojson(poly_gdf, district_name, dxf_path, boundary_points, region_centroid)
    return output_path

# =============================================
# Execute
# =============================================
if __name__ == "__main__":
    if not os.path.exists(dxf_path):
        print(f"❌ Error: File '{dxf_path}' not found!")
        print(f"Please make sure '{dxf_path}' exists in the current directory.")
        exit(1)
    
    output = run_pipeline(dxf_path, district_name)
    print(f"\n🎉 Pipeline completed successfully!")
    print(f"📁 Output file: {output}")