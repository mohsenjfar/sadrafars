/* file_path: /static/js/map_viewer.js */

let map;
let currentDistrictLayer = null;
let currentPiecesData = [];
let currentlyHighlighted = null;
let currentDistrictId = null;
let allDistrictsLayer = null;
let allDistrictsData = []; // ذخیره داده‌های کامل همه نواحی
let districtsData = [];

// ============================================================
// پالت رنگی برای نواحی
// ============================================================
const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#FF8A5C', '#A29BFE', '#FD79A8', '#00B894',
    '#E17055', '#74B9FF', '#55EFC4', '#FDCB6E', '#E84393',
    '#6C5CE7', '#00CEC9', '#FD79A8'
];

function getDistrictColor(index) {
    return COLORS[index % COLORS.length];
}

// ============================================================
// مقداردهی اولیه نقشه
// ============================================================
async function initializeMap() {
    map = L.map("map").setView([29.80421, 52.49931], 13);

    const layerStreet = L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        maxZoom: 20,
        minZoom: 10,
        attribution: 'Google Maps'
    });

    const layerSatellite = L.tileLayer("https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        maxZoom: 20,
        minZoom: 10,
        attribution: 'Google Maps'
    });

    const layerHybrid = L.tileLayer("https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        maxZoom: 20,
        minZoom: 10,
        attribution: 'Google Maps'
    });

    layerStreet.addTo(map);

    const baseMaps = {
        "🗺️ معمولی": layerStreet,
        "🛰️ ماهواره‌ای": layerSatellite,
        "🌍 ترکیبی": layerHybrid
    };

    L.control.layers(baseMaps, null, {
        position: 'bottomright'
    }).addTo(map);

    await loadDistrictsList();
    await loadAllDistricts();
}

// ============================================================
// بارگذاری لیست نواحی (فقط برای دراپ‌داون)
// ============================================================
async function loadDistrictsList() {
    try {
        const response = await fetch("/api/districts");
        const data = await response.json();
        districtsData = data.districts;
        populateDistrictDropdown(districtsData);
    } catch (error) {
        showError("خطا در بارگذاری لیست نواحی");
    }
}

// ============================================================
// بارگذاری کامل همه نواحی با یک درخواست
// ============================================================
async function loadAllDistricts() {
    // حذف لایه قبلی اگر وجود دارد
    if (allDistrictsLayer) {
        map.removeLayer(allDistrictsLayer);
        allDistrictsLayer = null;
    }

    allDistrictsData = [];
    
    try {
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
        
        // ذخیره داده‌های همه نواحی
        allDistrictsData = districts;
        
        // ایجاد FeatureGroup
        const featureGroup = L.featureGroup();
        
        districts.forEach((district, index) => {
            const color = getDistrictColor(index);
            const boundary = district.boundary || [];
            const centroid = district.centroid || [0, 0];
            const name = district.name || district.id;
            
            // رسم مرز ناحیه
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
                
                // رویداد کلیک روی ناحیه
                polygon.on('click', function(e) {
                    zoomToDistrict(district.id);
                });
                
                // اضافه کردن اسم ناحیه
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
        
        // زوم روی محدوده همه نواحی
        const bounds = getDistrictsBounds(allDistrictsData);
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
        
        console.log(`✅ ${allDistrictsData.length} ناحیه روی نقشه نمایش داده شد`);
        
    } catch (error) {
        console.error("❌ خطا در بارگذاری همه نواحی:", error);
        showError("خطا در بارگذاری نواحی");
    }
}

// ============================================================
// محاسبه محدوده همه نواحی
// ============================================================
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

// ============================================================
// زوم روی یک ناحیه خاص
// ============================================================
function zoomToDistrict(districtId) {
    // پیدا کردن ناحیه در داده‌های بارگذاری شده
    const district = allDistrictsData.find(d => d.id === districtId);
    if (!district) {
        showError("ناحیه یافت نشد");
        return;
    }
    
    // محاسبه محدوده ناحیه برای زوم مناسب
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
    
    // پس از زوم، قطعات ناحیه را نمایش بده
    setTimeout(() => {
        // حذف لایه همه نواحی
        if (allDistrictsLayer) {
            map.removeLayer(allDistrictsLayer);
            allDistrictsLayer = null;
        }
        
        // بارگذاری قطعات ناحیه (با استفاده از داده‌های ذخیره شده)
        showDistrictPieces(district);
    }, 800);
}

// ============================================================
// نمایش قطعات یک ناحیه (بدون درخواست جدید)
// ============================================================
function showDistrictPieces(district) {
    currentDistrictId = district.id;
    currentPiecesData = district.pieces || [];
    window.currentPiecesData = currentPiecesData;
    
    // پر کردن dropdown قطعه
    populatePiecesDropdown(currentPiecesData);
    
    // ساخت GeoJSON برای نمایش قطعات
    const geojson = {
        "type": "FeatureCollection",
        "features": []
    };
    
    // برای ساخت GeoJSON نیاز به فایل اصلی داریم
    // پس یک درخواست برای دریافت GeoJSON کامل می‌زنیم
    fetchDistrictGeoJSON(district.id);
}

// ============================================================
// دریافت GeoJSON کامل یک ناحیه (برای نمایش قطعات)
// ============================================================
async function fetchDistrictGeoJSON(districtId) {
    try {
        const response = await fetch(`/api/districts/${districtId}/load`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || "خطا در بارگذاری");
        }
        
        displayDistrictOnMap(data.geojson);
        
        // زوم روی centroid ناحیه
        if (data.centroid && data.centroid.length === 2) {
            map.flyTo([data.centroid[1], data.centroid[0]], 15, {
                animate: true,
                duration: 1.5,
            });
        }
    } catch (error) {
        showError("خطا در بارگذاری قطعات");
    }
}

// ============================================================
// پر کردن dropdown ناحیه
// ============================================================
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

// ============================================================
// تغییر ناحیه (از دراپ‌داون وقتی در حالت قطعات هستیم)
// ============================================================
async function onDistrictChange(districtId) {
    if (!districtId) return;

    showLoading(true);
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

// ============================================================
// نمایش ناحیه روی نقشه (قطعات)
// ============================================================
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

// ============================================================
// پر کردن dropdown قطعه
// ============================================================
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

// ============================================================
// مخفی کردن dropdown قطعه
// ============================================================
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

// ============================================================
// انتخاب قطعه از dropdown
// ============================================================
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

// ============================================================
// انتخاب قطعه از نقشه
// ============================================================
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

// ============================================================
// پاک کردن ناحیه از نقشه (برگشت به حالت اولیه)
// ============================================================
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

    loadAllDistricts();

    console.log("↩️ برگشت به حالت نمایش همه نواحی");
}

// ============================================================
// کپی کردن
// ============================================================
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

// ============================================================
// توست
// ============================================================
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

function showLoading(show) {
    const loading = $("#loading");
    if (loading.length) {
        loading.toggleClass("show", show);
    }
}

// شروع برنامه
$(document).ready(function () {
    initializeMap();
});