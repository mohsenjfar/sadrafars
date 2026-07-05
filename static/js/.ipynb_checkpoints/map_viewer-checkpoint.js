/* file_path: /static/js/map_viewer.js */

let map;
let currentDistrictLayer = null;
let currentPiecesData = [];
let currentlyHighlighted = null;
let currentDistrictId = null;
let allDistrictsLayer = null;
let allDistrictsData = [];
let districtsData = [];
let isLoadingAllDistricts = false;

// ============================================================
// Cache for district data
// ============================================================
let districtsCache = {
    list: null,
    all: null,
    timestamp: null
};

const CACHE_TTL = 3600000; // 1 hour in milliseconds

const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#FF8A5C', '#A29BFE', '#FD79A8', '#00B894',
    '#E17055', '#74B9FF', '#55EFC4', '#FDCB6E', '#E84393',
    '#6C5CE7', '#00CEC9', '#FD79A8'
];

function getDistrictColor(index) {
    return COLORS[index % COLORS.length];
}

function isCacheValid() {
    if (!districtsCache.timestamp) return false;
    return (Date.now() - districtsCache.timestamp) < CACHE_TTL;
}

async function initializeMap() {
    map = L.map("map").setView([29.80421, 52.49931], 13);

    const layerStreet = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
        minZoom: 10
    });

    const layerSatellite = L.tileLayer("https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        maxZoom: 20,
        minZoom: 10,
        attribution: 'Google Maps'
    });

    layerStreet.addTo(map);

    const baseMaps = {
        "🗺️ معمولی": layerStreet,
        "🛰️ ماهواره‌ای": layerSatellite
    };

    L.control.layers(baseMaps, null, {
        position: 'bottomright'
    }).addTo(map);

    showLoading(true, "در حال بارگذاری نقشه...");
    
    try {
        await loadDistrictsList();
        await loadAllDistricts();
    } catch (error) {
        console.error("Error loading map:", error);
        showError("خطا در بارگذاری نقشه");
    } finally {
        showLoading(false);
    }
}

function showLoading(show, message = "در حال بارگذاری...") {
    const loading = $("#loading");
    if (loading.length) {
        if (show) {
            loading.find("span").text(message);
            loading.removeClass("hidden").addClass("show");
        } else {
            loading.addClass("hidden").removeClass("show");
        }
    }
}

async function loadDistrictsList() {
    try {
        // Check cache first
        if (districtsCache.list && isCacheValid()) {
            console.log("📦 Using cached district list");
            districtsData = districtsCache.list;
            populateDistrictDropdown(districtsData);
            return;
        }

        const response = await fetch("/api/districts");
        const data = await response.json();
        districtsData = data.districts;
        
        // Update cache
        districtsCache.list = districtsData;
        districtsCache.timestamp = Date.now();
        
        populateDistrictDropdown(districtsData);
    } catch (error) {
        showError("خطا در بارگذاری لیست نواحی");
    }
}

async function loadAllDistricts() {
    if (isLoadingAllDistricts) return;
    isLoadingAllDistricts = true;

    if (allDistrictsLayer) {
        map.removeLayer(allDistrictsLayer);
        allDistrictsLayer = null;
    }

    allDistrictsData = [];
    
    try {
        // Check cache first
        if (districtsCache.all && isCacheValid()) {
            console.log("📦 Using cached all districts data");
            allDistrictsData = districtsCache.all;
            renderDistrictsOnMap(allDistrictsData);
            isLoadingAllDistricts = false;
            return;
        }

        showLoading(true, "در حال بارگذاری نواحی...");
        
        const response = await fetch("/api/districts/all");
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || "خطا در بارگذاری نواحی");
        }
        
        const districts = data.districts || [];
        
        if (districts.length === 0) {
            console.warn("⚠️ هیچ ناحیه‌ای یافت نشد");
            return;
        }
        
        allDistrictsData = districts;
        
        // Update cache
        districtsCache.all = districts;
        districtsCache.timestamp = Date.now();
        
        renderDistrictsOnMap(districts);
        
    } catch (error) {
        console.error("❌ خطا در بارگذاری همه نواحی:", error);
        showError("خطا در بارگذاری نواحی");
    } finally {
        isLoadingAllDistricts = false;
        showLoading(false);
    }
}

function renderDistrictsOnMap(districts) {
    const featureGroup = L.featureGroup();
    
    districts.forEach((district, index) => {
        const color = getDistrictColor(index);
        const boundary = district.boundary || [];
        const centroid = district.centroid || [0, 0];
        const name = district.name || district.id;
        
        if (boundary.length >= 3) {
            const latLngs = boundary.map(p => [p[1], p[0]]);
            
            const polygon = L.polygon(latLngs, {
                color: color,
                weight: 4,
                opacity: 0.9,
                fillColor: color,
                fillOpacity: 0.15,
                smoothFactor: 1,
                className: 'district-boundary'
            });
            
            polygon.on('click', function(e) {
                zoomToDistrict(district.id);
            });
            
            const centerLat = centroid[1] || latLngs.reduce((sum, p) => sum + p[0], 0) / latLngs.length;
            const centerLng = centroid[0] || latLngs.reduce((sum, p) => sum + p[1], 0) / latLngs.length;
            
            const label = L.marker([centerLat, centerLng], {
                icon: L.divIcon({
                    className: 'district-label',
                    html: `<div class="text-xs font-bold text-gray-800 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-gray-200" style="color: ${color};">${name}</div>`,
                    iconSize: [0, 0],
                    iconAnchor: [0, 0]
                }),
                interactive: false,
                zIndexOffset: 1000
            });
            
            featureGroup.addLayer(polygon);
            featureGroup.addLayer(label);
        }
    });
    
    allDistrictsLayer = featureGroup;
    map.addLayer(allDistrictsLayer);
    
    const bounds = getDistrictsBounds(districts);
    if (bounds) {
        map.flyToBounds(bounds, { 
            padding: [50, 50],
            duration: 1.5
        });
    }
    
    console.log(`✅ ${districts.length} ناحیه روی نقشه نمایش داده شد`);
}

function getDistrictsBounds(districts) {
    let allPoints = [];
    districts.forEach(d => {
        if (d.boundary && d.boundary.length > 0) {
            d.boundary.forEach(p => {
                allPoints.push([p[1], p[0]]);
            });
        }
    });
    
    if (allPoints.length === 0) return null;
    
    const lats = allPoints.map(p => p[0]);
    const lngs = allPoints.map(p => p[1]);
    
    return [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)]
    ];
}

function zoomToDistrict(districtId) {
    const district = allDistrictsData.find(d => d.id === districtId);
    if (!district) {
        showError("ناحیه یافت نشد");
        return;
    }
    
    const input = $("#districtInput");
    const clearBtn = $("#districtClearBtn");
    if (input.length) {
        input.val(district.name);
        clearBtn.removeClass("hidden").addClass("visible");
    }
    
    if (district.boundary && district.boundary.length > 0) {
        const points = district.boundary.map(p => [p[1], p[0]]);
        const bounds = L.latLngBounds(points);
        map.flyToBounds(bounds, {
            padding: [50, 50],
            duration: 1.5,
            maxZoom: 17
        });
    } else if (district.centroid && district.centroid.length === 2) {
        map.flyTo([district.centroid[1], district.centroid[0]], 15, {
            animate: true,
            duration: 1.5
        });
    } else {
        map.flyTo([29.80421, 52.49931], 13);
    }
    
    setTimeout(() => {
        if (allDistrictsLayer) {
            map.removeLayer(allDistrictsLayer);
            allDistrictsLayer = null;
        }
        
        showDistrictPieces(district);
    }, 800);
}

function showDistrictPieces(district) {
    currentDistrictId = district.id;
    currentPiecesData = district.pieces || [];
    window.currentPiecesData = currentPiecesData;
    
    populatePiecesDropdown(currentPiecesData);
    fetchDistrictGeoJSON(district.id);
}

async function fetchDistrictGeoJSON(districtId) {
    try {
        // Check if we already have the full data in cache
        const cachedDistrict = districtsCache.all?.find(d => d.id === districtId);
        if (cachedDistrict && cachedDistrict.fullGeoJSON) {
            console.log("📦 Using cached GeoJSON for district:", districtId);
            displayDistrictOnMap(cachedDistrict.fullGeoJSON);
            
            if (cachedDistrict.centroid && cachedDistrict.centroid.length === 2) {
                map.flyTo([cachedDistrict.centroid[1], cachedDistrict.centroid[0]], 15, {
                    animate: true,
                    duration: 1.5,
                });
            }
            return;
        }

        showLoading(true, "در حال بارگذاری قطعات...");
        
        const response = await fetch(`/api/districts/${districtId}/load`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || "خطا در بارگذاری");
        }
        
        // Cache the full GeoJSON
        const district = districtsCache.all?.find(d => d.id === districtId);
        if (district) {
            district.fullGeoJSON = data.geojson;
        }
        
        displayDistrictOnMap(data.geojson);
        
        if (data.centroid && data.centroid.length === 2) {
            map.flyTo([data.centroid[1], data.centroid[0]], 15, {
                animate: true,
                duration: 1.5,
            });
        }
    } catch (error) {
        showError("خطا در بارگذاری قطعات");
    } finally {
        showLoading(false);
    }
}

function populateDistrictDropdown(districts) {
    const input = $("#districtInput");
    const list = $("#districtList");
    const dropdown = $("#districtDropdown");
    const clearBtn = $("#districtClearBtn");

    if (!input.length || !list.length || !dropdown.length || !clearBtn.length)
        return;

    function renderList(filter = "") {
        list.empty().removeClass("hidden");

        let filtered = districts;
        if (filter.trim() !== "") {
            filtered = districts.filter((d) => d.name.includes(filter));
        }

        if (filtered.length === 0) {
            list.append(
                `<div class="px-3.5 py-2 text-center text-gray-400 text-sm">❌ ناحیه‌ای یافت نشد</div>`,
            );
            return;
        }

        filtered.forEach((district) => {
            let displayText = district.name;
            if (filter.trim() !== "") {
                const regex = new RegExp(filter, "gi");
                displayText = district.name.replace(
                    regex,
                    (match) => `<span class="text-blue-600 font-bold">${match}</span>`,
                );
            }

            const item = $(`
                <div class="px-3.5 py-2 cursor-pointer text-sm text-gray-800 transition-colors duration-150 border-b border-gray-100 last:border-none hover:bg-gray-100" data-id="${district.id}">
                    ${displayText}
                </div>
            `);

            item.on("click", function () {
                input.val(district.name);
                list.empty().addClass("hidden");
                dropdown.removeClass("open");
                updateClearButtonVisibility(input, clearBtn);
                if (district.id !== currentDistrictId) {
                    if (allDistrictsLayer) {
                        zoomToDistrict(district.id);
                    } else {
                        onDistrictChange(district.id);
                    }
                }
            });

            list.append(item);
        });
    }

    function updateClearButtonVisibility(inputElement, buttonElement) {
        if (inputElement.val().trim() !== "") {
            buttonElement.removeClass("hidden").addClass("visible");
        } else {
            buttonElement.addClass("hidden").removeClass("visible");
        }
    }

    clearBtn.off("click").on("click", function (e) {
        e.stopPropagation();
        input.val("");
        list.empty().addClass("hidden");
        dropdown.removeClass("open");
        $(this).addClass("hidden").removeClass("visible");
        clearDistrictFromMap();
        currentDistrictId = null;
        input.focus();
    });

    input.off("click").on("click", function (e) {
        e.stopPropagation();
        if (dropdown.hasClass("open")) {
            dropdown.removeClass("open");
            list.addClass("hidden");
        } else {
            renderList("");
            dropdown.addClass("open");
            list.removeClass("hidden");
        }
    });

    input.off("input").on("input", function () {
        updateClearButtonVisibility($(this), clearBtn);
        const val = $(this).val();
        if (val === "") {
            clearDistrictFromMap();
            currentDistrictId = null;
            if (dropdown.hasClass("open")) {
                renderList("");
                list.removeClass("hidden");
            }
        } else {
            renderList(val);
            if (!dropdown.hasClass("open")) {
                dropdown.addClass("open");
                list.removeClass("hidden");
            }
        }
    });

    $(document)
        .off("click.district")
        .on("click.district", function (e) {
            if (!dropdown.is(e.target) && !dropdown.has(e.target).length) {
                dropdown.removeClass("open");
                list.addClass("hidden");
            }
        });

    input.off("keydown").on("keydown", function (e) {
        if (e.key === "Enter") {
            const firstItem = list.find("div[data-id]").first();
            if (firstItem.length && firstItem.data("id")) {
                const district = districts.find((d) => d.id === firstItem.data("id"));
                if (district && district.id !== currentDistrictId) {
                    input.val(district.name);
                    list.empty().addClass("hidden");
                    dropdown.removeClass("open");
                    updateClearButtonVisibility(input, clearBtn);
                    if (allDistrictsLayer) {
                        zoomToDistrict(district.id);
                    } else {
                        onDistrictChange(district.id);
                    }
                }
            }
        }
    });

    if (currentDistrictId) {
        const district = districts.find((d) => d.id === currentDistrictId);
        if (district) {
            input.val(district.name);
            updateClearButtonVisibility(input, clearBtn);
        }
    }
}

async function onDistrictChange(districtId) {
    if (!districtId) return;

    showLoading(true, "در حال بارگذاری ناحیه...");
    currentDistrictId = districtId;

    try {
        const response = await fetch(`/api/districts/${districtId}/load`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "خطا در بارگذاری");
        }

        currentPiecesData = data.pieces || [];
        window.currentPiecesData = currentPiecesData;

        populatePiecesDropdown(currentPiecesData);
        displayDistrictOnMap(data.geojson);

        if (allDistrictsLayer) {
            map.removeLayer(allDistrictsLayer);
            allDistrictsLayer = null;
        }

        if (data.centroid && data.centroid.length === 2) {
            map.flyTo([data.centroid[1], data.centroid[0]], 15, {
                animate: true,
                duration: 1.5,
            });
        }
    } catch (error) {
        showError("خطا در بارگذاری ناحیه");
        currentDistrictId = null;
    } finally {
        showLoading(false);
    }
}

function displayDistrictOnMap(geojson) {
    if (currentDistrictLayer) {
        map.removeLayer(currentDistrictLayer);
    }

    const piecesDataForClosure = [...currentPiecesData];

    currentDistrictLayer = L.geoJSON(geojson, {
        style: function (feature) {
            const pieceNumber = feature.properties?.name || feature.properties?.Name;
            const isHighlighted =
                currentlyHighlighted &&
                currentlyHighlighted.pieceNumber === String(pieceNumber);

            return {
                color: isHighlighted ? "#ef4444" : "#3b82f6",
                weight: isHighlighted ? 4 : 2,
                opacity: 0.7,
                fillColor: isHighlighted ? "#ef4444" : "#3b82f6",
                fillOpacity: isHighlighted ? 0.3 : 0.1,
            };
        },
        onEachFeature: function (feature, layer) {
            const pieceNumber = feature.properties?.name || feature.properties?.Name;
            if (pieceNumber) {
                const pieceNumberStr = String(pieceNumber);
                const pieceData = piecesDataForClosure.find(
                    (p) => String(p.name) === pieceNumberStr,
                );
                layer.pieceNumber = pieceNumberStr;

                layer.on("click", function () {
                    selectPieceFromMap(pieceNumberStr);
                });

                if (pieceData && pieceData.centroid) {
                    const centerText = `${pieceData.centroid[1]?.toFixed(6)} , ${pieceData.centroid[0]?.toFixed(6)}`;
                    const lat = pieceData.centroid[1];
                    const lng = pieceData.centroid[0];
                    const areaValue = pieceData.area_m2 || pieceData.area || 0;

                    layer.bindPopup(`
                        <div class="text-center font-vazir rtl min-w-[150px]">
                            <div class="text-[15px] font-bold">🏠 قطعه شماره ${pieceNumber}</div>
                            ${areaValue ? `<div>📐 مساحت: ${Number(areaValue).toLocaleString()} متر مربع</div>` : ""}
                            <div class="bg-slate-100 p-2 rounded-lg mt-2">
                                <code class="text-[11px]">${centerText}</code>
                                <button onclick="copyToClipboard('${centerText}')" class="mt-1.5 bg-blue-600 text-white border-none rounded-lg px-3 py-1 cursor-pointer w-full text-sm">
                                    📋 کپی مختصات
                                </button>
                                <button onclick="window.open('https://www.google.com/maps?q=${lat},${lng}', '_blank')" 
                                        class="mt-1.5 bg-red-600 text-white border-none rounded-lg px-3 py-1 cursor-pointer w-full text-sm hover:bg-red-700 transition-colors">
                                    🌍 مسیریابی در گوگل
                                </button>
                            </div>
                        </div>
                    `);
                } else {
                    layer.bindPopup(
                        `<div style="text-align: center;"><strong>قطعه شماره ${pieceNumber}</strong></div>`,
                    );
                }
            }
        },
    }).addTo(map);
}

function populatePiecesDropdown(pieces) {
    const container = $("#pieceSelectContainer");
    const input = $("#pieceInput");
    const list = $("#pieceList");
    const clearBtn = $("#pieceClearBtn");

    if (!container.length || !input.length || !list.length || !clearBtn.length)
        return;

    if (!pieces || pieces.length === 0) {
        container.addClass("hidden");
        return;
    }

    const sortedPieces = [...pieces].sort(
        (a, b) => parseFloat(a.name) - parseFloat(b.name),
    );

    function renderList(filter = "") {
        list.empty().removeClass("hidden");

        let filtered = sortedPieces;
        if (filter.trim() !== "") {
            filtered = sortedPieces.filter((p) => String(p.name).includes(filter));
        }

        if (filtered.length === 0) {
            list.append(
                `<div class="px-3.5 py-2 text-center text-gray-400 text-sm">❌ قطعه‌ای یافت نشد</div>`,
            );
            return;
        }

        filtered.forEach((piece) => {
            let displayText = `قطعه ${piece.name}`;
            if (filter.trim() !== "") {
                const regex = new RegExp(filter, "gi");
                displayText = `قطعه ${piece.name}`.replace(
                    regex,
                    (match) => `<span class="text-blue-600 font-bold">${match}</span>`,
                );
            }

            const item = $(`
                <div class="px-3.5 py-2 cursor-pointer text-sm text-gray-800 transition-colors duration-150 border-b border-gray-100 last:border-none hover:bg-gray-100" data-id="${piece.name}">
                    ${displayText}
                </div>
            `);

            item.on("click", function () {
                input.val(`قطعه ${piece.name}`);
                list.empty().addClass("hidden");
                container.removeClass("open");
                updateClearButtonVisibility(input, clearBtn);
                onPieceChangeFromDropdown(piece.name);
            });

            list.append(item);
        });
    }

    function updateClearButtonVisibility(inputElement, buttonElement) {
        if (inputElement.val().trim() !== "") {
            buttonElement.removeClass("hidden").addClass("visible");
        } else {
            buttonElement.addClass("hidden").removeClass("visible");
        }
    }

    clearBtn.off("click").on("click", function (e) {
        e.stopPropagation();
        input.val("");
        list.empty().addClass("hidden");
        container.removeClass("open");
        $(this).addClass("hidden").removeClass("visible");

        if (currentDistrictLayer) {
            currentDistrictLayer.eachLayer(function (layer) {
                if (layer.setStyle) {
                    layer.setStyle({
                        color: "#3b82f6",
                        weight: 2,
                        opacity: 0.7,
                        fillColor: "#3b82f6",
                        fillOpacity: 0.1,
                    });
                }
            });
            currentlyHighlighted = null;
        }
        input.focus();
    });

    input.off("click").on("click", function (e) {
        e.stopPropagation();
        if (container.hasClass("open")) {
            container.removeClass("open");
            list.addClass("hidden");
        } else {
            renderList("");
            container.addClass("open");
            list.removeClass("hidden");
        }
    });

    input.off("input").on("input", function () {
        updateClearButtonVisibility($(this), clearBtn);
        const val = $(this).val();
        if (val === "") {
            if (container.hasClass("open")) {
                renderList("");
                list.removeClass("hidden");
            }
        } else {
            renderList(val);
            if (!container.hasClass("open")) {
                container.addClass("open");
                list.removeClass("hidden");
            }
        }
    });

    $(document)
        .off("click.piece")
        .on("click.piece", function (e) {
            if (!container.is(e.target) && !container.has(e.target).length) {
                container.removeClass("open");
                list.addClass("hidden");
            }
        });

    input.off("keydown").on("keydown", function (e) {
        if (e.key === "Enter") {
            const firstItem = list.find("div[data-id]").first();
            if (firstItem.length && firstItem.data("id")) {
                const pieceNumber = firstItem.data("id");
                input.val(`قطعه ${pieceNumber}`);
                list.empty().addClass("hidden");
                container.removeClass("open");
                updateClearButtonVisibility(input, clearBtn);
                onPieceChangeFromDropdown(pieceNumber);
            }
        }
    });

    container.removeClass("hidden");
}

function hidePiecesDropdown() {
    const container = $("#pieceSelectContainer");
    const input = $("#pieceInput");
    const clearBtn = $("#pieceClearBtn");
    const list = $("#pieceList");

    container.addClass("hidden").removeClass("open");
    input.val("");
    clearBtn.addClass("hidden").removeClass("visible");
    list.empty().addClass("hidden");

    if (currentlyHighlighted && currentDistrictLayer) {
        currentDistrictLayer.eachLayer(function (layer) {
            if (layer.setStyle) {
                layer.setStyle({
                    color: "#3b82f6",
                    weight: 2,
                    opacity: 0.7,
                    fillColor: "#3b82f6",
                    fillOpacity: 0.1,
                });
            }
        });
        currentlyHighlighted = null;
    }
}

function onPieceChangeFromDropdown(pieceNumber) {
    if (!pieceNumber) return;

    const pieceNumberStr = String(pieceNumber);
    const piece = currentPiecesData?.find(
        (p) => String(p.name) === pieceNumberStr,
    );

    if (!piece || !piece.centroid) {
        showError(`قطعه ${pieceNumber} یافت نشد`);
        return;
    }

    map.flyTo([piece.centroid[1], piece.centroid[0]], 18, {
        animate: true,
        duration: 2.0,
        easeLinearity: 0.25,
    });

    if (currentDistrictLayer) {
        let targetLayer = null;

        currentDistrictLayer.eachLayer((layer) => {
            if (layer.pieceNumber === pieceNumberStr) targetLayer = layer;
        });

        currentDistrictLayer.eachLayer(function (layer) {
            if (layer.setStyle) {
                layer.setStyle({
                    color: "#3b82f6",
                    weight: 2,
                    opacity: 0.7,
                    fillColor: "#3b82f6",
                    fillOpacity: 0.1,
                });
            }
        });

        if (targetLayer) {
            targetLayer.setStyle({
                color: "#ef4444",
                weight: 4,
                opacity: 1,
                fillColor: "#ef4444",
                fillOpacity: 0.3,
            });
            currentlyHighlighted = targetLayer;
            setTimeout(() => targetLayer.openPopup(), 500);
        }
    }

    const input = $("#pieceInput");
    const clearBtn = $("#pieceClearBtn");
    input.val(`قطعه ${pieceNumberStr}`);
    clearBtn.removeClass("hidden").addClass("visible");
}

function selectPieceFromMap(pieceNumber) {
    if (!pieceNumber) return;

    const pieceNumberStr = String(pieceNumber);

    if (currentDistrictLayer) {
        currentDistrictLayer.eachLayer(function (layer) {
            if (layer.setStyle) {
                layer.setStyle({
                    color: "#3b82f6",
                    weight: 2,
                    opacity: 0.7,
                    fillColor: "#3b82f6",
                    fillOpacity: 0.1,
                });
            }
        });
    }

    let targetLayer = null;

    if (currentDistrictLayer) {
        currentDistrictLayer.eachLayer(function (layer) {
            if (layer.pieceNumber === pieceNumberStr) {
                targetLayer = layer;
                layer.setStyle({
                    color: "#ef4444",
                    weight: 4,
                    opacity: 1,
                    fillColor: "#ef4444",
                    fillOpacity: 0.3,
                });
            }
        });
    }

    currentlyHighlighted = targetLayer;

    const piece = currentPiecesData?.find(
        (p) => String(p.name) === pieceNumberStr,
    );
    if (piece && piece.centroid) {
        map.flyTo([piece.centroid[1], piece.centroid[0]], 18, { duration: 1 });
    }

    if (targetLayer) {
        setTimeout(() => targetLayer.openPopup(), 500);
    }

    const input = $("#pieceInput");
    const clearBtn = $("#pieceClearBtn");
    input.val(`قطعه ${pieceNumberStr}`);
    clearBtn.removeClass("hidden").addClass("visible");
}

function clearDistrictFromMap() {
    if (currentDistrictLayer) {
        map.removeLayer(currentDistrictLayer);
        currentDistrictLayer = null;
    }

    if (currentlyHighlighted) {
        currentlyHighlighted = null;
    }

    currentPiecesData = [];
    currentDistrictId = null;

    hidePiecesDropdown();

    const input = $("#districtInput");
    const clearBtn = $("#districtClearBtn");
    if (input.length) {
        input.val("");
        clearBtn.addClass("hidden").removeClass("visible");
    }

    showLoading(true, "در حال بازگشت به نمای اصلی...");
    
    // Use cached data if available
    if (districtsCache.all && isCacheValid()) {
        console.log("📦 Using cached data for return to main view");
        allDistrictsData = districtsCache.all;
        renderDistrictsOnMap(allDistrictsData);
        
        const bounds = getDistrictsBounds(allDistrictsData);
        if (bounds) {
            map.flyToBounds(bounds, { 
                padding: [50, 50],
                duration: 2.5
            });
        }
        setTimeout(() => {
            showLoading(false);
        }, 500);
    } else {
        loadAllDistricts().then(() => {
            const bounds = getDistrictsBounds(allDistrictsData);
            if (bounds) {
                map.flyToBounds(bounds, { 
                    padding: [50, 50],
                    duration: 2.5
                });
            }
            setTimeout(() => {
                showLoading(false);
            }, 1000);
        });
    }

    console.log("↩️ برگشت به حالت نمایش همه نواحی");
}

window.copyToClipboard = function (text) {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            showToast("✅ مختصات کپی شد!", "success");
        })
        .catch(() => {
            showToast("❌ خطا در کپی", "error");
        });
};

function showToast(message, type = "success") {
    $(".toast-message").remove();

    const bgColor = type === "success" ? "bg-emerald-500" : "bg-red-500";
    const toast = $(`
        <div class="toast-message fixed bottom-5 left-1/2 -translate-x-1/2 ${bgColor} text-white px-5 py-2.5 rounded-lg z-[3000] font-vazir text-sm shadow-md whitespace-nowrap">
            ${message}
        </div>
    `);

    $("body").append(toast);
    setTimeout(() => toast.remove(), 2000);
}

function showError(message) {
    showToast(message, "error");
}

$(document).ready(function () {
    initializeMap();
});