import json
import os
from shapely.geometry import Polygon, MultiPolygon, shape
from shapely.ops import unary_union
from pathlib import Path


def standardize_geojson(input_path, output_path):
    """
    Standardize a single GeoJSON file to the target template format.
    
    Args:
        input_path: Full path to input GeoJSON file
        output_path: Full path for output standardized file
    
    Returns:
        dict: Standardized GeoJSON data
    """
    
    # Read input file
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # ========== 1. Standardize root level ==========
    standardized = {
        "type": "FeatureCollection",
        "name": extract_name(data, input_path),
        "centroid": None,  # Will be calculated later
        "crs": {
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        },
        "features": []
    }
    
    # ========== 2. Process each Feature ==========
    features = data.get('features', [])
    all_centroids = []
    
    for feature in features:
        # Standardize properties
        props = feature.get('properties', {})
        
        # Extract name (supports: name, Name, id, ID)
        name = props.get('name') or props.get('Name')
        if not name:
            name = props.get('id') or props.get('ID') or f"piece_{len(all_centroids)+1}"
        
        # Extract area (supports: area_m2, masahat, area)
        area = props.get('area_m2') or props.get('masahat') or props.get('area')
        if area:
            try:
                area = round(float(area), 2)  # 2 decimal places precision
            except:
                area = 0.0
        else:
            area = 0.0
        
        # Standardize geometry
        geometry = feature.get('geometry')
        if not geometry:
            continue
            
        # Clean coordinates (remove Z dimension if present)
        geometry = clean_coordinates(geometry)
        
        # Convert MultiPolygon to Polygon if it has only one part
        geom_type = geometry.get('type')
        if geom_type == 'MultiPolygon' and len(geometry.get('coordinates', [])) == 1:
            geometry = {
                "type": "Polygon",
                "coordinates": geometry['coordinates'][0]
            }
        
        # Calculate centroid for this piece
        try:
            shapely_geom = shape(geometry)
            centroid = shapely_geom.centroid
            centroid_coords = [round(centroid.x, 6), round(centroid.y, 6)]
        except:
            # Fallback: calculate from bounding box center
            coords = extract_coordinates(geometry)
            if coords:
                centroid_coords = calculate_center_from_coords(coords)
            else:
                centroid_coords = [0, 0]
        
        all_centroids.append(centroid_coords)
        
        # Build standardized Feature
        standardized_feature = {
            "type": "Feature",
            "geometry": geometry,
            "properties": {
                "name": str(name),
                "area_m2": area,
                "centroid": centroid_coords
            }
        }
        
        # Preserve important extra fields if they exist
        extra_fields = ['description', 'district', 'population', 'color', 'type', 'id']
        for field in extra_fields:
            if field in props:
                standardized_feature['properties'][field] = props[field]
        
        standardized['features'].append(standardized_feature)
    
    # ========== 3. Calculate region-level centroid ==========
    if all_centroids:
        # Method 1: Calculate from all geometries (more accurate)
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
            # Fallback: average of all piece centroids
            avg_lon = sum(c[0] for c in all_centroids) / len(all_centroids)
            avg_lat = sum(c[1] for c in all_centroids) / len(all_centroids)
            standardized['centroid'] = [round(avg_lon, 6), round(avg_lat, 6)]
    
    # ========== 4. Save output file ==========
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(standardized, f, ensure_ascii=False, indent=2)
    
    return standardized


def extract_name(data, file_path):
    """
    Extract region name from various possible sources.
    
    Priority:
    1. name_fa (Persian name)
    2. name (generic name)
    3. Filename without extension
    
    Args:
        data: Loaded GeoJSON data
        file_path: Path to the file (for fallback)
    
    Returns:
        str: Extracted name
    """
    # Priority 1: Persian name
    if 'name_fa' in data:
        return data['name_fa']
    
    # Priority 2: Generic name
    if 'name' in data:
        return data['name']
    
    # Priority 3: Filename without extension
    return Path(file_path).stem


def extract_coordinates(geometry):
    """
    Extract all coordinates from a geometry object.
    
    Args:
        geometry: GeoJSON geometry object
    
    Returns:
        list: List of [longitude, latitude] points
    """
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
    """
    Calculate center point from a list of coordinates (bounding box center).
    
    Args:
        coords: List of [longitude, latitude] points
    
    Returns:
        list: [longitude, latitude] center point
    """
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
    """
    Remove Z dimension (altitude) from coordinates if present.
    
    Args:
        geometry: GeoJSON geometry object
    
    Returns:
        dict: Cleaned geometry with 2D coordinates only
    """
    geom_type = geometry.get('type')
    
    if geom_type == 'Polygon':
        new_coords = []
        for ring in geometry.get('coordinates', []):
            new_ring = []
            for point in ring:
                # Keep only first 2 coordinates (longitude, latitude)
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


def process_all_files():
    """
    Automatically process all GeoJSON files in the current directory.
    
    This function:
    - Scans current folder for .geojson files
    - Creates a 'standardized' subfolder
    - Processes each file with standardize_geojson()
    - Saves standardized versions in the subfolder
    - Prints progress and summary report
    
    Returns:
        None
    """
    # Current working directory (where the script is executed)
    current_folder = os.getcwd()
    
    # Find all GeoJSON files
    geojson_files = []
    for file in os.listdir(current_folder):
        if file.endswith('.geojson'):
            geojson_files.append(file)
    
    if not geojson_files:
        print("⚠️ No GeoJSON files found in the current directory!")
        print(f"   Current folder: {current_folder}")
        return
    
    # Create output folder
    output_folder = os.path.join(current_folder, 'standardized')
    os.makedirs(output_folder, exist_ok=True)
    
    # Print header
    print("=" * 60)
    print(f"📁 Current folder: {current_folder}")
    print(f"📁 Output folder: {output_folder}")
    print("=" * 60)
    print(f"\n🔍 Found {len(geojson_files)} GeoJSON file(s):\n")
    
    success_count = 0
    error_count = 0
    
    # Process each file
    for filename in geojson_files:
        input_path = os.path.join(current_folder, filename)
        output_path = os.path.join(output_folder, filename)
        
        print(f"📄 Processing: {filename}")
        
        try:
            result = standardize_geojson(input_path, output_path)
            success_count += 1
            
            # Display file info
            feature_count = len(result.get('features', []))
            centroid = result.get('centroid', [0, 0])
            print(f"   ✅ Standardized successfully!")
            print(f"      - Number of pieces: {feature_count}")
            print(f"      - Region centroid: [{centroid[0]:.6f}, {centroid[1]:.6f}]")
            
        except Exception as e:
            error_count += 1
            print(f"   ❌ Error: {str(e)}")
        
        print()
    
    # Final report
    print("=" * 60)
    print("📊 Final Report:")
    print(f"   ✅ Successful: {success_count} file(s)")
    print(f"   ❌ Failed: {error_count} file(s)")
    print(f"   📁 Standardized files saved in: {output_folder}")
    print("=" * 60)


# ========== Main Execution ==========

if __name__ == "__main__":
    process_all_files()