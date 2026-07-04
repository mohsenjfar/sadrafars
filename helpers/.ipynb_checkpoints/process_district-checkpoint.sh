#!/bin/bash

echo "Enter district name in Persian:"
read persian_name

if [ -z "$persian_name" ]; then
    echo "Error: Persian name cannot be empty!"
    exit 1
fi

echo "Enter district name in English:"
read english_name

if [ -z "$english_name" ]; then
    echo "Error: English name cannot be empty!"
    exit 1
fi

echo "Processing: $persian_name ($english_name)"

if [ ! -f "${persian_name}.dxf" ]; then
    echo "Error: ${persian_name}.dxf not found!"
    exit 1
fi

mkdir -p Done
mv "${persian_name}.dxf" Done/
echo "DXF moved to Done/"

if [ ! -f "${english_name}.geojson" ]; then
    echo "Error: ${english_name}.geojson not found!"
    exit 1
fi

mkdir -p ../static/data/districts/
mv "${english_name}.geojson" ../static/data/districts/
echo "GeoJSON moved to ../static/data/districts/"

git add ..
git commit -m "add region ${english_name} (${persian_name})"
git push

echo "Done! Region: ${persian_name} (${english_name})"