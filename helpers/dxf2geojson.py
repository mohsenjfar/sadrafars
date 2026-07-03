import ezdxf
from shapely.geometry import LineString, Polygon, MultiPolygon, Point, MultiLineString
from shapely.ops import polygonize, unary_union
import geopandas as gpd
import pandas as pd
from pyproj import Transformer
import json
import os
from math import sin, cos

# =============================================
# 0. Get district name from user
# =============================================
district_name = input("Enter district name (e.g., Baharestan): ").strip()
if not district_name:
    district_name = "Unknown_District"
    print(f"⚠️ No name entered. Using default: {district_name}")

dxf_path = f"{district_name}.dxf"  # Input file

# =============================================
# 1. Function: Extract all lines (including curves)
# =============================================
def extract_all_lines(msp, segment_length=0.5):
    lines = []
    for entity in msp:
        if entity.dxftype() == 'LINE':
            start = entity.dxf.start[:2]
            end = entity.dxf.end[:2]
            lines.append(LineString([start, end]))
        elif entity.dxftype() == 'ARC':
            center = entity.dxf.center[:2]
            radius = entity.dxf.radius
            start_angle = entity.dxf.start_angle
            end_angle = entity.dxf.end_angle
            points = []
            for i in range(20):
                angle = (start_angle + (end_angle - start_angle) * i / 20)
                x = center[0] + radius * cos(angle)
                y = center[1] + radius * sin(angle)
                points.append((x, y))
            lines.append(LineString(points))
        elif entity.dxftype() == 'LWPOLYLINE':
            points = list(entity.get_points())
            if entity.closed and len(points) > 1:
                points.append(points[0])
            for i in range(len(points)-1):
                start = points[i][:2]
                end = points[i+1][:2]
                lines.append(LineString([start, end]))
    return lines

# =============================================
# 2. Function: Merge lines with buffer
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
# 3. Function: Convert lines to polygons
# =============================================
def lines_to_polygons(lines):
    return list(polygonize(unary_union(lines)))

# =============================================
# 4. Function: Extract texts with reversal
# =============================================
def extract_texts(msp):
    texts = []
    for entity in msp.query('TEXT MTEXT'):
        try:
            if entity.dxftype() == 'TEXT':
                x = entity.dxf.insert[0]
                y = entity.dxf.insert[1]
            else:
                x = entity.dxf.insert[0] if entity.dxf.hasattr('insert') else entity.dxf.location[0]
                y = entity.dxf.insert[1] if entity.dxf.hasattr('insert') else entity.dxf.location[1]
            text_value = entity.dxf.text.strip()
            if text_value:
                texts.append({
                    'text': text_value[::-1],  # Reversed text
                    'geometry': Point(float(x), float(y))
                })
        except:
            continue
    return gpd.GeoDataFrame(texts, crs="EPSG:32639")

# =============================================
# 5. Function: Keep only the highest text per polygon
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
# 6. Function: Calculate area and centroid (in meters)
# =============================================
def calculate_area_and_centroid(poly_gdf):
    poly_gdf['area_m2'] = poly_gdf.geometry.area
    poly_gdf['centroid'] = poly_gdf.geometry.centroid
    return poly_gdf

# =============================================
# 7. Function: Convert UTM to degrees (WGS84)
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
# 8. Function: Save to GeoJSON with district name
# =============================================
def save_as_geojson(poly_gdf, district_name, dxf_path):
    output_gdf = poly_gdf[['name', 'area_m2', 'centroid', 'geometry']].copy()
    output_gdf = output_gdf.dropna(subset=['name', 'geometry'])
    
    # Build GeoJSON structure with district name
    geojson_data = {
        "type": "FeatureCollection",
        "name": district_name,
        "features": []
    }
    
    for _, row in output_gdf.iterrows():
        feature = {
            "type": "Feature",
            "geometry": row['geometry'].__geo_interface__,
            "properties": {
                "name": row['name'],
                "area_m2": float(row['area_m2']),
                "centroid": row['centroid']
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
    
    # 4. Convert to polygons
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
    
    # 8. Calculate area and centroid
    poly_gdf = calculate_area_and_centroid(poly_gdf)
    print(f"✅ Area and centroid calculated")
    
    # 9. Convert to WGS84
    poly_gdf = convert_to_wgs84(poly_gdf)
    print(f"✅ Coordinates converted to WGS84 (degrees)")
    
    # 10. Save final GeoJSON
    output_path = save_as_geojson(poly_gdf, district_name, dxf_path)
    return output_path

# =============================================
# Execute
# =============================================
if __name__ == "__main__":
    # Check if file exists before running pipeline
    if not os.path.exists(dxf_path):
        print(f"❌ Error: File '{dxf_path}' not found!")
        print(f"Please make sure '{dxf_path}' exists in the current directory.")
        exit(1)
    
    output = run_pipeline(dxf_path, district_name)
    print(f"\n🎉 Pipeline completed successfully!")
    print(f"📁 Output file: {output}")