#!/bin/bash

echo "Searching for GeoJSON files in current directory..."

# Find all .geojson files and store them in an array
geojson_files=()
while IFS= read -r file; do
    geojson_files+=("$file")
done < <(find . -maxdepth 1 -name "*.geojson" -type f | sed 's/\.\///' | sed 's/\.geojson$//')

if [ ${#geojson_files[@]} -eq 0 ]; then
    echo "No GeoJSON files found in current directory!"
    exit 1
fi

echo "Found ${#geojson_files[@]} GeoJSON file(s):"
for i in "${!geojson_files[@]}"; do
    echo "  $((i+1)). ${geojson_files[i]}.geojson"
done

echo ""
echo "Processing each file..."

for persian_name in "${geojson_files[@]}"; do
    echo ""
    echo "========================================="
    echo "Processing: ${persian_name}.geojson"
    echo "========================================="
    
    echo "Enter English name for this district:"
    read english_name
    
    if [ -z "$english_name" ]; then
        echo "Warning: English name cannot be empty! Skipping ${persian_name}"
        continue
    fi
    
    echo "Processing: $persian_name -> $english_name"
    
    # Check and move DXF if exists
    if [ -f "${persian_name}.dxf" ]; then
        mkdir -p Done
        mv "${persian_name}.dxf" Done/
        echo "  ✓ DXF moved to Done/"
    else
        echo "  ! DXF file not found: ${persian_name}.dxf"
    fi
    
    # Create target directory
    mkdir -p ../static/data/districts/
    
    # Rename and move GeoJSON
    mv "${persian_name}.geojson" "${english_name}.geojson"
    echo "  ✓ GeoJSON renamed to ${english_name}.geojson"
    
    mv "${english_name}.geojson" ../static/data/districts/
    echo "  ✓ GeoJSON moved to ../static/data/districts/"
    
    echo "  ✓ Completed: ${persian_name} -> ${english_name}"
done

echo ""
echo "========================================="
echo "All files processed. Committing to git..."
echo "========================================="

git add ..
git commit -m "add regions: $(printf '%s ' "${geojson_files[@]}")"
git push

echo ""
echo "✅ Done! Processed ${#geojson_files[@]} region(s):"
for i in "${!geojson_files[@]}"; do
    echo "  $((i+1)). ${geojson_files[i]} -> ${english_names[i]}"
done