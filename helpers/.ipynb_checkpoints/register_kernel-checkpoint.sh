python -m ipykernel install --user --name=sadrafars --display-name="Python (sadrafars)"
mv baharestan.geojson ../static/data/districts/
git add . && git commit -m "add region " && git push