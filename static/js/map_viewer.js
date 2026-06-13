/* file_path: /static/js/map_viewer.js */

let map;
let currentLayers = [];
let currentDistrictId = null;
let districtsConfig = null;
let currentHighlightedLayer = null;
let allPiecesData = []; // ذخیره تمام قطعات برای جستجو

// ============================================================
// مقداردهی اولیه نقشه
// ============================================================
async function initializeMap() {
    // بارگذاری کانفیگ نواحی
    await loadDistrictsConfig();
    
    // ایجاد نقشه با مرکزیت شهر صدرا و زوم پیش‌فرض
    map = L.map('map').setView(districtsConfig.city_center, districtsConfig.default_zoom);
    
    // اضافه کردن لایه نقشه پایه (خاکستری ملایم)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 10
    }).addTo(map);
    
    // راه‌اندازی جستجو با تکمیل خودکار
    setupSearchSuggestions();
    
    // بارگذاری تمام نواحی به صورت اولیه
    await loadAllDistricts();
}

// ============================================================
// بارگذاری کانفیگ نواحی
// ============================================================
async function loadDistrictsConfig() {
    try {
        const response = await fetch('/static/data/districts_config.json');
        districtsConfig = await response.json();
        
        // پر کردن dropdown ناحیه‌ها
        populateDistrictDropdown();
        
        return districtsConfig;
    } catch (error) {
        console.error('خطا در بارگذاری کانفیگ نواحی:', error);
    }
}

// ============================================================
// پر کردن dropdown ناحیه‌ها
// ============================================================
function populateDistrictDropdown() {
    const dropdown = document.getElementById('districtSelect');
    if (!dropdown || !districtsConfig) return;
    
    dropdown.innerHTML = '<option value="">همه نواحی</option>';
    
    districtsConfig.districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district.id;
        option.textContent = district.name_fa;
        dropdown.appendChild(option);
    });
    
    dropdown.addEventListener('change', onDistrictChange);
}

// ============================================================
// تغییر ناحیه از dropdown
// ============================================================
async function onDistrictChange(event) {
    const districtId = event.target.value;
    
    if (!districtId) {
        await loadAllDistricts();
        map.setView(districtsConfig.city_center, districtsConfig.default_zoom);
        updateSearchPlaceholder('همه نواحی');
        return;
    }
    
    const district = districtsConfig.districts.find(d => d.id === districtId);
    if (!district) return;
    
    currentDistrictId = districtId;
    
    // پاک کردن لایه‌های قبلی
    clearLayers();
    
    // بارگذاری فقط ناحیه انتخاب شده
    await loadDistrict(district);
    
    // تنظیم view روی ناحیه (بدون تغییر زوم)
    map.panTo(district.center);
    
    updateSearchPlaceholder(district.name_fa);
}

// ============================================================
// بارگذاری تمام نواحی
// ============================================================
async function loadAllDistricts() {
    clearLayers();
    currentDistrictId = null;
    allPiecesData = [];
    
    for (const district of districtsConfig.districts) {
        await loadDistrict(district);
    }
    
    updateSearchPlaceholder('همه نواحی');
    
    // به‌روزرسانی پیشنهادات جستجو
    setupSearchSuggestions();
}

// ============================================================
// بارگذاری یک ناحیه خاص (پشتیبانی از Polygon و MultiPolygon)
// ============================================================
async function loadDistrict(district) {
    try {
        for (const filePath of district.layer_files) {
            const response = await fetch(filePath);
            const geoJsonData = await response.json();
            
            // پردازش ویژگی‌ها
            if (geoJsonData.features) {
                geoJsonData.features.forEach(feature => {
                    // استخراج شماره قطعه (از فیلد Name)
                    let pieceNumber = null;
                    if (feature.properties) {
                        pieceNumber = feature.properties.Name || 
                                     feature.properties.name || 
                                     feature.properties.piece_num ||
                                     feature.properties.fid;
                    }
                    
                    // استخراج مختصات مرکزی برای قطعه (از properties یا محاسبه از geometry)
                    let centerLat = feature.properties.lat || null;
                    let centerLng = feature.properties.lon || null;
                    
                    // ایجاد لایه بر اساس نوع geometry
                    let layer = null;
                    const geometry = feature.geometry;
                    
                    if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
                        // برای Polygon ها از L.geoJSON استفاده می‌کنیم
                        layer = L.geoJSON(feature, {
                            style: {
                                color: '#3b82f6',
                                weight: 2,
                                opacity: 0.7,
                                fillColor: '#3b82f6',
                                fillOpacity: 0.1
                            },
                            onEachFeature: function(f, l) {
                                l.feature = f;
                                l.districtId = district.id;
                                l.pieceNumber = pieceNumber;
                                l.centerLat = centerLat;
                                l.centerLng = centerLng;
                                
                                // محاسبه مرکز از geometry اگر در properties نبود
                                if (!centerLat && l.getBounds && l.getBounds().isValid()) {
                                    const bounds = l.getBounds();
                                    const center = bounds.getCenter();
                                    l.centerLat = center.lat;
                                    l.centerLng = center.lng;
                                }
                                
                                // اضافه کردن popup
                                if (pieceNumber) {
                                    l.bindPopup(`
                                        <div style="text-align: center; font-family: Vazirmatn;">
                                            <strong>قطعه شماره</strong><br>
                                            <span style="font-size: 16px; color: #2563eb;">${pieceNumber}</span>
                                            ${feature.properties.masahat ? `<br><span style="font-size: 11px;">مساحت: ${feature.properties.masahat} متر مربع</span>` : ''}
                                        </div>
                                    `);
                                }
                                
                                l.on('click', function(e) {
                                    highlightPiece(l, pieceNumber, district);
                                });
                            }
                        });
                    } else if (geometry.type === 'LineString' || geometry.type === 'MultiLineString') {
                        // برای LineString ها (مثل قبل)
                        layer = L.geoJSON(feature, {
                            style: {
                                color: '#3b82f6',
                                weight: 2,
                                opacity: 0.7
                            },
                            onEachFeature: function(f, l) {
                                l.feature = f;
                                l.districtId = district.id;
                                l.pieceNumber = pieceNumber;
                                
                                if (pieceNumber) {
                                    l.bindPopup(`
                                        <div style="text-align: center; font-family: Vazirmatn;">
                                            <strong>قطعه شماره</strong><br>
                                            <span style="font-size: 16px; color: #2563eb;">${pieceNumber}</span>
                                        </div>
                                    `);
                                }
                                
                                l.on('click', function(e) {
                                    highlightPiece(l, pieceNumber, district);
                                });
                            }
                        });
                    } else if (geometry.type === 'Point') {
                        // برای Point ها
                        const coords = geometry.coordinates;
                        layer = L.circleMarker([coords[1], coords[0]], {
                            radius: 6,
                            color: '#10b981',
                            weight: 2,
                            opacity: 0.8,
                            fillColor: '#10b981',
                            fillOpacity: 0.6
                        });
                        layer.feature = feature;
                        layer.districtId = district.id;
                        layer.pieceNumber = pieceNumber;
                        layer.centerLat = coords[1];
                        layer.centerLng = coords[0];
                        
                        if (pieceNumber) {
                            layer.bindPopup(`
                                <div style="text-align: center; font-family: Vazirmatn;">
                                    <strong>قطعه شماره</strong><br>
                                    <span style="font-size: 16px; color: #2563eb;">${pieceNumber}</span>
                                </div>
                            `);
                        }
                        
                        layer.on('click', function(e) {
                            highlightPiece(layer, pieceNumber, district);
                        });
                    }
                    
                    if (layer) {
                        layer.addTo(map);
                        currentLayers.push(layer);
                        
                        // ذخیره اطلاعات قطعه برای جستجو
                        if (pieceNumber) {
                            allPiecesData.push({
                                number: pieceNumber,
                                layer: layer,
                                districtId: district.id,
                                districtName: district.name_fa
                            });
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error(`خطا در بارگذاری ناحیه ${district.name_fa}:`, error);
    }
}

// ============================================================
// پاک کردن لایه‌های فعلی
// ============================================================
function clearLayers() {
    currentLayers.forEach(layer => {
        map.removeLayer(layer);
    });
    currentLayers = [];
    allPiecesData = [];
    
    if (currentHighlightedLayer) {
        resetLayerStyle(currentHighlightedLayer);
        currentHighlightedLayer = null;
    }
}

// ============================================================
// بازنشانی استایل لایه
// ============================================================
function resetLayerStyle(layer) {
    if (layer && layer.setStyle) {
        layer.setStyle({
            color: '#3b82f6',
            weight: 2,
            opacity: 0.7,
            fillColor: '#3b82f6',
            fillOpacity: 0.1
        });
    } else if (layer && layer.setRadius) {
        // برای circleMarker
        layer.setStyle({
            color: '#10b981',
            weight: 2,
            opacity: 0.8,
            fillColor: '#10b981',
            fillOpacity: 0.6
        });
    }
}

// ============================================================
// هایلایت کردن قطعه انتخاب شده و زوم روی آن
// ============================================================
function highlightPiece(layer, pieceNumber, district) {
    // بازنشانی استایل لایه قبلی
    if (currentHighlightedLayer && currentHighlightedLayer !== layer) {
        resetLayerStyle(currentHighlightedLayer);
    }
    
    // تنظیم استایل جدید برای لایه انتخاب شده
    if (layer.setStyle) {
        layer.setStyle({
            color: '#ef4444',
            weight: 4,
            opacity: 1,
            fillColor: '#ef4444',
            fillOpacity: 0.3
        });
    } else if (layer.setRadius) {
        // برای circleMarker
        layer.setStyle({
            color: '#ef4444',
            weight: 3,
            opacity: 1,
            fillColor: '#ef4444',
            fillOpacity: 0.8
        });
        layer.setRadius(10);
    }
    
    currentHighlightedLayer = layer;
    
    // زوم روی قطعه
    if (layer.getBounds && layer.getBounds().isValid()) {
        map.fitBounds(layer.getBounds(), {
            padding: [50, 50],
            maxZoom: districtsConfig.piece_zoom
        });
    } else if (layer.getLatLng) {
        map.setView(layer.getLatLng(), districtsConfig.piece_zoom);
    } else if (layer.centerLat && layer.centerLng) {
        map.setView([layer.centerLat, layer.centerLng], districtsConfig.piece_zoom);
    }
    
    // نمایش اطلاعات در پنل کناری
    showInfoPanel(pieceNumber, district);
}

// ============================================================
// نمایش پنل اطلاعات
// ============================================================
function showInfoPanel(pieceNumber, district) {
    const panel = document.getElementById('infoPanel');
    const infoPieceNum = document.getElementById('infoPieceNum');
    const infoFullName = document.getElementById('infoFullName');
    const infoCoords = document.getElementById('infoCoords');
    
    if (panel && infoPieceNum && infoFullName) {
        infoPieceNum.textContent = pieceNumber || 'نامشخص';
        infoFullName.textContent = district ? `${district.name_fa} - قطعه ${pieceNumber}` : `قطعه ${pieceNumber}`;
        
        const center = map.getCenter();
        infoCoords.textContent = `${center.lat.toFixed(6)} , ${center.lng.toFixed(6)}`;
        
        panel.style.display = 'block';
    }
}

// ============================================================
// جستجوی قطعه
// ============================================================
async function searchPiece() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('لطفاً شماره قطعه را وارد کنید');
        return;
    }
    
    // جستجو در allPiecesData
    const queryLower = query.toLowerCase();
    const matches = allPiecesData.filter(p => 
        String(p.number).toLowerCase().includes(queryLower)
    );
    
    if (matches.length === 0) {
        alert(`قطعه "${query}" یافت نشد`);
        return;
    }
    
    // اگر بیش از یک نتیجه بود، اولین را انتخاب کن
    const match = matches[0];
    
    // اگر ناحیه متفاوت است، ابتدا آن ناحیه را بارگذاری کن
    if (currentDistrictId !== match.districtId) {
        const district = districtsConfig.districts.find(d => d.id === match.districtId);
        if (district) {
            // تغییر dropdown
            const dropdown = document.getElementById('districtSelect');
            dropdown.value = match.districtId;
            
            // بارگذاری ناحیه
            clearLayers();
            await loadDistrict(district);
            map.panTo(district.center);
            currentDistrictId = match.districtId;
            updateSearchPlaceholder(district.name_fa);
            
            // دوباره لایه را پیدا کن (چون reference عوض شده)
            const newLayer = currentLayers.find(l => l.pieceNumber === match.number);
            if (newLayer) {
                highlightPiece(newLayer, match.number, district);
            }
        }
    } else {
        highlightPiece(match.layer, match.number, districtsConfig.districts.find(d => d.id === match.districtId));
    }
    
    // بستن dropdown پیشنهادات
    const suggestions = document.getElementById('suggestions');
    if (suggestions) suggestions.style.display = 'none';
}

// ============================================================
// راه‌اندازی جستجو با تکمیل خودکار
// ============================================================
function setupSearchSuggestions() {
    const searchInput = document.getElementById('searchInput');
    const suggestionsDiv = document.getElementById('suggestions');
    
    if (!searchInput || !suggestionsDiv) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        if (query.length < 2) {
            suggestionsDiv.style.display = 'none';
            return;
        }
        
        const queryLower = query.toLowerCase();
        const matches = allPiecesData.filter(p => 
            String(p.number).toLowerCase().includes(queryLower)
        ).slice(0, 10);
        
        if (matches.length === 0) {
            suggestionsDiv.style.display = 'none';
            return;
        }
        
        suggestionsDiv.innerHTML = '';
        matches.forEach(match => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = `${match.number} (${match.districtName})`;
            item.onclick = () => {
                searchInput.value = match.number;
                suggestionsDiv.style.display = 'none';
                
                // اگر ناحیه متفاوت است، ابتدا آن ناحیه را بارگذاری کن
                if (currentDistrictId !== match.districtId) {
                    const district = districtsConfig.districts.find(d => d.id === match.districtId);
                    if (district) {
                        const dropdown = document.getElementById('districtSelect');
                        dropdown.value = match.districtId;
                        onDistrictChange({ target: dropdown });
                        setTimeout(() => {
                            const newLayer = currentLayers.find(l => l.pieceNumber === match.number);
                            if (newLayer) {
                                highlightPiece(newLayer, match.number, district);
                            }
                        }, 500);
                    }
                } else {
                    highlightPiece(match.layer, match.number, districtsConfig.districts.find(d => d.id === match.districtId));
                }
            };
            suggestionsDiv.appendChild(item);
        });
        
        suggestionsDiv.style.display = 'block';
    });
    
    document.addEventListener('click', function(e) {
        if (e.target !== searchInput) {
            suggestionsDiv.style.display = 'none';
        }
    });
}

// ============================================================
// به‌روزرسانی placeholder جستجو
// ============================================================
function updateSearchPlaceholder(districtName) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = `جستجو در ${districtName}...`;
    }
}

// ============================================================
// بارگذاری اولیه هنگام load صفحه
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
});