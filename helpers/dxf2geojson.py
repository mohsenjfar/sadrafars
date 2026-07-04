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
# 8. Function: Save to GeoJSON with district name (STANDARDIZED)
# =============================================
def save_as_geojson(poly_gdf, district_name, dxf_path):
    output_gdf = poly_gdf[['name', 'area_m2', 'centroid', 'geometry']].copy()
    output_gdf = output_gdf.dropna(subset=['name', 'geometry'])
    
    # =============================================
    # NEW: Calculate region-level centroid
    # =============================================
    region_centroid = None
    if not output_gdf.empty:
        # Combine all polygons to get region centroid
        from shapely.ops import unary_union as union_all
        all_polygons = union_all(output_gdf.geometry.tolist())
        if not all_polygons.is_empty:
            centroid_point = all_polygons.centroid
            region_centroid = [round(centroid_point.x, 6), round(centroid_point.y, 6)]
    
    # =============================================
    # Build STANDARDIZED GeoJSON structure
    # =============================================
    geojson_data = {
        "type": "FeatureCollection",
        "name": district_name,  # District name in Persian
        "centroid": region_centroid,  # NEW: Region-level centroid
        "crs": {  # NEW: CRS definition
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        },
        "features": []
    }
    
    for _, row in output_gdf.iterrows():
        # Round centroid coordinates to 6 decimal places
        centroid_coords = row['centroid']
        if centroid_coords:
            centroid_coords = [round(centroid_coords[0], 6), round(centroid_coords[1], 6)]
        
        feature = {
            "type": "Feature",
            "geometry": row['geometry'].__geo_interface__,
            "properties": {
                "name": str(row['name']),  # Piece name/number
                "area_m2": round(float(row['area_m2']), 2),  # Area in square meters
                "centroid": centroid_coords  # Piece centroid
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
    print(f"   - Region centroid: {region_centroid}")
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
    
    # 10. Save final GeoJSON (STANDARDIZED)
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