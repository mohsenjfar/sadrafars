// static/js/map_viewer.js
let map;
let currentHighlight = null;
let piecesData = [];
let linesLayer = null;
let pointsLayer = null;

const DEFAULT_BOUNDS = [[52.444, 29.808], [52.458, 29.817]];

function initMap() {
    map = L.map('map').fitBounds(DEFAULT_BOUNDS);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    loadData();
}

async function loadData() {
    showLoading(true);
    
    try {
        const linesResponse = await fetch('/static/data/baharestannewtafkik_2.js');
        const linesData = await linesResponse.json();
        
        linesLayer = L.geoJSON(linesData, {
            style: { color: '#3b82f6', weight: 1.5, opacity: 0.6 }
        }).addTo(map);
        
        const pointsResponse = await fetch('/static/data/baharestannewtafkik_3.js');
        const pointsData = await pointsResponse.json();
        
        pointsData.features.forEach(feature => {
            if (feature.properties && feature.properties.text) {
                piecesData.push({
                    id: feature.properties.text,
                    name: feature.properties.Name || feature.properties.text,
                    coordinates: feature.geometry.coordinates,
                    lat: feature.geometry.coordinates[1],
                    lng: feature.geometry.coordinates[0]
                });
            }
        });
        
        pointsLayer = L.geoJSON(pointsData, {
            pointToLayer: function(feature, latlng) {
                const customIcon = L.divIcon({
                    html: `<div style="background: #10b981; width: 8px; height: 8px; border-radius: 50%; border: 2px solid white;"></div>`,
                    iconSize: [8, 8]
                });
                const marker = L.marker(latlng, { icon: customIcon });
                marker.bindTooltip(`📌 ${feature.properties?.text || '?'}`, { sticky: true });
                return marker;
            }
        }).addTo(map);
        
        if (linesLayer && linesLayer.getBounds().isValid()) {
            map.fitBounds(linesLayer.getBounds());
        }
        
    } catch (error) {
        console.error('خطا:', error);
        showError('خطا در بارگذاری داده‌های نقشه');
    } finally {
        showLoading(false);
    }
}

function searchPiece() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        alert('لطفاً شماره قطعه را وارد کنید');
        return;
    }
    
    let found = piecesData.find(p => p.id === query || p.id.includes(query));
    if (!found) {
        found = piecesData.find(p => p.id.toLowerCase().includes(query.toLowerCase()));
    }
    
    if (!found) {
        alert(`قطعه "${query}" یافت نشد!`);
        return;
    }
    
    map.setView([found.lat, found.lng], 19);
    highlightLocation([found.lat, found.lng], found.id);
    showInfo(found);
}

function highlightLocation(latlng, pieceId) {
    if (currentHighlight) map.removeLayer(currentHighlight);
    currentHighlight = L.circle(latlng, {
        color: '#ef4444', weight: 3, opacity: 1,
        fillColor: '#ef4444', fillOpacity: 0.3, radius: 15
    }).addTo(map);
}

function showInfo(piece) {
    const panel = document.getElementById('infoPanel');
    document.getElementById('infoPieceNum').innerHTML = piece.id;
    document.getElementById('infoFullName').innerHTML = piece.name || piece.id;
    document.getElementById('infoCoords').innerHTML = `${piece.lat.toFixed(6)} , ${piece.lng.toFixed(6)}`;
    panel.style.display = 'block';
    setTimeout(() => {
        if (panel.style.display === 'block' && !panel.matches(':hover')) {
            panel.style.display = 'none';
        }
    }, 5000);
}

function setupAutoSuggest() {
    const input = document.getElementById('searchInput');
    const suggestionsDiv = document.getElementById('suggestions');
    
    input.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        if (query.length < 2) {
            suggestionsDiv.style.display = 'none';
            return;
        }
        
        const matches = piecesData.filter(p => 
            p.id.toLowerCase().includes(query)
        ).slice(0, 10);
        
        if (matches.length === 0) {
            suggestionsDiv.style.display = 'none';
            return;
        }
        
        suggestionsDiv.innerHTML = matches.map(m => 
            `<div class="suggestion-item" onclick="selectSuggestion('${m.id.replace(/'/g, "\\'")}')">
                📍 ${m.id}
            </div>`
        ).join('');
        suggestionsDiv.style.display = 'block';
    });
    
    document.addEventListener('click', function(e) {
        if (!suggestionsDiv.contains(e.target) && e.target !== input) {
            suggestionsDiv.style.display = 'none';
        }
    });
}

function selectSuggestion(value) {
    document.getElementById('searchInput').value = value;
    document.getElementById('suggestions').style.display = 'none';
    searchPiece();
}

function showError(message) {
    const div = document.createElement('div');
    div.className = 'loading';
    div.style.background = 'rgba(220, 38, 38, 0.9)';
    div.innerHTML = `⚠️ ${message}`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function showLoading(show) {
    let div = document.getElementById('loadingDiv');
    if (show) {
        if (!div) {
            div = document.createElement('div');
            div.id = 'loadingDiv';
            div.className = 'loading';
            div.innerHTML = '⏳ بارگذاری داده‌ها...';
            document.body.appendChild(div);
        }
    } else {
        if (div) div.remove();
    }
}

// مقداردهی اولیه
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    setupAutoSuggest();
});