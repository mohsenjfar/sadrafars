/* file_path: /static/js/map_viewer.js */

let map;
let currentDistrictLayer = null;
let currentPiecesData = [];
let currentlyHighlighted = null;

// ============================================================
// مقداردهی اولیه نقشه
// ============================================================
async function initializeMap() {
    console.log("1. initializeMap شروع شد");
    
    map = L.map('map', {
        inertia: true,
        inertiaDeceleration: 3000,
        inertiaMaxSpeed: 1500,
        easeLinearity: 0.25,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 60,
        touchZoom: true,
        scrollWheelZoom: true
    }).setView([29.80421, 52.49931], 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 10
    }).addTo(map);
    
    console.log("2. نقشه ساخته شد، در حال بارگذاری لیست نواحی");
    await loadDistrictsList();
}

// ============================================================
// بارگذاری لیست نواحی
// ============================================================
async function loadDistrictsList() {
    try {
        console.log("3. در حال فراخوانی /api/districts");
        const response = await fetch('/api/districts');
        const data = await response.json();
        console.log("4. پاسخ دریافت شد:", data);
        
        populateDistrictDropdown(data.districts);
    } catch (error) {
        console.error('خطا:', error);
        showError('خطا در بارگذاری لیست نواحی');
    }
}

// ============================================================
// پر کردن dropdown نواحی
// ============================================================
function populateDistrictDropdown(districts) {
    console.log("5. پر کردن dropdown نواحی با", districts.length, "ناحیه");
    const dropdown = $('#districtSelect');
    
    dropdown.empty();
    dropdown.append('<option value="">-- انتخاب ناحیه --</option>');
    
    districts.forEach(district => {
        dropdown.append(`<option value="${district.id}">${district.name_fa}</option>`);
    });
    
    dropdown.select2({
        placeholder: 'جستجوی ناحیه...',
        allowClear: true,
        dir: 'rtl',
        language: 'fa',
        width: '250px'
    });
    
    dropdown.off('change').on('change', function(e) {
        console.log("6. ناحیه تغییر کرد، مقدار:", e.target.value);
        onDistrictChange(e);
    });
    
    console.log("7. dropdown نواحی آماده شد");
}

// ============================================================
// تغییر ناحیه
// ============================================================
async function onDistrictChange(event) {
    const districtId = event.target.value;
    console.log("8. onDistrictChange فراخوانی شد، districtId:", districtId);
    
    if (!districtId) {
        clearDistrictFromMap();
        hidePiecesDropdown();
        return;
    }
    
    showLoading(true);
    
    try {
        const url = `/api/districts/${districtId}/load`;
        console.log("9. در حال فراخوانی:", url);
        const response = await fetch(url);
        const data = await response.json();
        console.log("10. پاسخ ناحیه دریافت شد");
        console.log("10.1. تعداد قطعات:", data.pieces?.length);
        console.log("10.2. مرکز ناحیه:", data.center);
        
        if (!response.ok) {
            throw new Error(data.detail || 'خطا در بارگذاری');
        }
        
        // ذخیره داده قطعات در متغیر سراسری و window
        currentPiecesData = data.pieces;
        window.currentPiecesData = data.pieces; // برای دسترسی در onEachFeature
        console.log("11. currentPiecesData ذخیره شد با", currentPiecesData.length, "قطعه");
        
        // ابتدا dropdown قطعه را نمایش بده
        showAndPopulatePiecesDropdown(data.pieces);
        console.log("12. showAndPopulatePiecesDropdown اجرا شد");
        
        // سپس نقشه را نمایش بده (بعد از اینکه data.pieces در دسترس است)
        displayDistrictOnMap(data.geojson);
        console.log("13. displayDistrictOnMap اجرا شد");
        
        // حرکت به مرکز ناحیه
        map.flyTo([data.center[1], data.center[0]], 15, {
            animate: true,
            duration: 2.0,
            easeLinearity: 0.25
        });
        
    } catch (error) {
        console.error('خطا:', error);
        showError('خطا در بارگذاری ناحیه');
    } finally {
        showLoading(false);
    }
}

// ============================================================
// نمایش ناحیه روی نقشه
// ============================================================
function displayDistrictOnMap(geojson) {
    console.log("14. displayDistrictOnMap شروع شد");
    console.log("14.1. geojson features:", geojson.features?.length);
    console.log("14.2. currentPiecesData در شروع displayDistrictOnMap:", currentPiecesData?.length);
    console.log("14.3. window.currentPiecesData:", window.currentPiecesData?.length);
    
    if (currentDistrictLayer) {
        map.removeLayer(currentDistrictLayer);
    }
    
    // ذخیره یک کپی از داده قطعات برای استفاده در onEachFeature
    const piecesDataForClosure = [...currentPiecesData];
    
    currentDistrictLayer = L.geoJSON(geojson, {
        style: {
            color: '#3b82f6',
            weight: 2,
            opacity: 0.7,
            fillColor: '#3b82f6',
            fillOpacity: 0.1
        },
        onEachFeature: function(feature, layer) {
            const pieceNumber = feature.properties?.Name || feature.properties?.name;
            const area = feature.properties?.masahat;
            console.log("15. پردازش feature با شماره قطعه:", pieceNumber);
            
            if (pieceNumber) {
                // استفاده از piecesDataForClosure که در closure ذخیره شده
                const pieceData = piecesDataForClosure.find(p => String(p.number) === String(pieceNumber));
                console.log("15.1. pieceData یافت شد:", pieceData ? "بله" : "خیر");
                
                if (pieceData) {
                    const centerLat = pieceData.center?.[1]?.toFixed(6) || 'نامشخص';
                    const centerLng = pieceData.center?.[0]?.toFixed(6) || 'نامشخص';
                    const centerText = `${centerLat} , ${centerLng}`;
                    
                    let popupContent = `
                        <div style="text-align: center; font-family: Vazirmatn; direction: rtl; min-width: 200px;">
                            <div style="font-size: 15px; font-weight: bold; color: #1e293b; margin-bottom: 8px;">
                                🏠 قطعه شماره ${pieceNumber}
                            </div>
                            ${area ? `<div style="font-size: 12px; color: #475569; margin-bottom: 5px;">
                                📐 مساحت: <span dir="ltr" style="font-family: monospace;">${area.toLocaleString()}</span> متر مربع
                            </div>` : ''}
                            <div style="font-size: 12px; color: #475569; margin-bottom: 8px;">
                                📍 نقطه میانی:
                            </div>
                            <div style="background: #f8fafc; padding: 6px 10px; border-radius: 6px; font-size: 11px; direction: ltr; font-family: monospace; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                                <span style="color: #2563eb; font-weight: 500;">${centerText}</span>
                                <button onclick="copyToClipboard('${centerText}')" style="background: #e2e8f0; border: none; border-radius: 4px; padding: 2px 8px; cursor: pointer; font-size: 11px; font-family: monospace;">
                                    📋 کپی
                                </button>
                            </div>
                        </div>
                    `;
                    
                    layer.bindPopup(popupContent);
                    layer.pieceNumber = String(pieceNumber);
                    
                    layer.on('click', function(e) {
                        console.log("16. کلیک روی قطعه:", pieceNumber);
                        selectPieceFromMap(String(pieceNumber));
                    });
                } else {
                    console.log("15.2. خطا: pieceData برای قطعه", pieceNumber, "یافت نشد");
                    // پاپ‌آپ ساده بدون مختصات
                    let popupContent = `
                        <div style="text-align: center; font-family: Vazirmatn; direction: rtl;">
                            <strong>قطعه شماره ${pieceNumber}</strong>
                            ${area ? `<br><span style="font-size: 11px;">مساحت: ${area.toLocaleString()} متر مربع</span>` : ''}
                        </div>
                    `;
                    layer.bindPopup(popupContent);
                    layer.pieceNumber = String(pieceNumber);
                    
                    layer.on('click', function(e) {
                        selectPieceFromMap(String(pieceNumber));
                    });
                }
            }
        }
    }).addTo(map);
    
    console.log("17. لایه به نقشه اضافه شد");
}

// ============================================================
// نمایش dropdown قطعه
// ============================================================
function showAndPopulatePiecesDropdown(pieces) {
    console.log("18. showAndPopulatePiecesDropdown با", pieces.length, "قطعه");
    const container = $('#pieceSelectContainer');
    const pieceSelect = $('#pieceSelect');
    
    if (pieceSelect.data('select2')) {
        pieceSelect.select2('destroy');
    }
    
    pieceSelect.empty();
    pieceSelect.append('<option value="">-- انتخاب قطعه --</option>');
    
    const sortedPieces = [...pieces].sort((a, b) => {
        const numA = parseFloat(a.number);
        const numB = parseFloat(b.number);
        return numA - numB;
    });
    
    sortedPieces.forEach(piece => {
        pieceSelect.append(`<option value="${piece.number}">قطعه ${piece.number}</option>`);
    });
    
    pieceSelect.select2({
        placeholder: 'جستجوی قطعه...',
        allowClear: true,
        dir: 'rtl',
        language: 'fa',
        width: '250px'
    });
    
    // تنظیم موقعیت ضربدر
    setTimeout(() => {
        $('.select2-selection__clear').css({
            'right': 'auto',
            'left': '25px'
        });
    }, 100);
    
    pieceSelect.off('change').on('change', function(e) {
        const selectedValue = e.target.value;
        console.log("19. انتخاب از dropdown:", selectedValue);
        if (selectedValue) {
            onPieceChangeFromDropdown(selectedValue);
        }
    });
    
    container.show();
    console.log("20. dropdown قطعه نمایش داده شد");
}

// ============================================================
// مخفی کردن dropdown قطعه
// ============================================================
function hidePiecesDropdown() {
    const container = $('#pieceSelectContainer');
    const pieceSelect = $('#pieceSelect');
    
    if (pieceSelect.data('select2')) {
        pieceSelect.select2('destroy');
    }
    
    pieceSelect.empty();
    container.hide();
    currentPiecesData = [];
    window.currentPiecesData = [];
    if (currentlyHighlighted && currentDistrictLayer) {
        currentDistrictLayer.resetStyle(currentlyHighlighted);
        currentlyHighlighted = null;
    }
}

// ============================================================
// انتخاب قطعه از dropdown
// ============================================================
function onPieceChangeFromDropdown(pieceNumber) {
    console.log("21. onPieceChangeFromDropdown:", pieceNumber);
    if (!pieceNumber) return;
    
    // ========================================
    // مرحله 1: پیدا کردن قطعه در داده‌ها
    // ========================================
    const piece = currentPiecesData?.find(p => String(p.number) === String(pieceNumber));
    console.log("22. piece یافت شده:", piece ? "بله" : "خیر");
    
    if (!piece || !piece.center) {
        showError(`قطعه ${pieceNumber} یافت نشد`);
        return;
    }
    
    // ========================================
    // مرحله 2: حرکت نقشه به مرکز قطعه
    // ========================================
    map.flyTo([piece.center[1], piece.center[0]], 18, {
        animate: true,
        duration: 2.0,
        easeLinearity: 0.25
    });
    
    // ========================================
    // مرحله 3: هایلایت کردن قطعه روی نقشه
    // ========================================
    if (currentDistrictLayer) {
        let targetLayer = null;
        
        // پیدا کردن لایه مربوط به قطعه
        currentDistrictLayer.eachLayer(layer => {
            if (layer.pieceNumber === String(pieceNumber)) {
                targetLayer = layer;
            }
        });
        
        // ریست کردن هایلایت قبلی
        if (currentlyHighlighted) {
            currentDistrictLayer.resetStyle(currentlyHighlighted);
        }
        
        // هایلایت کردن قطعه جدید
        if (targetLayer) {
            targetLayer.setStyle({
                color: '#ef4444',
                weight: 4,
                opacity: 1,
                fillColor: '#ef4444',
                fillOpacity: 0.3
            });
            
            currentlyHighlighted = targetLayer;
            
            // باز کردن popup
            setTimeout(() => {
                targetLayer.openPopup();
            }, 500);
        }
    }
    
    // ========================================
    // مرحله 4: ✅ نمایش انتخاب در Select2
    // ========================================
    const pieceSelect = $('#pieceSelect');
    if (pieceSelect.length && pieceSelect.data('select2')) {
        // مقدار را در Select2 تنظیم کن
        pieceSelect.val(String(pieceNumber)).trigger('change.select2');
    } else if (pieceSelect.length) {
        // اگر Select2 فعال نیست، فقط مقدار dropdown را تنظیم کن
        pieceSelect.val(String(pieceNumber));
    }
}
// ============================================================
// انتخاب قطعه از نقشه
// ============================================================
function selectPieceFromMap(pieceNumber) {
    console.log("23. selectPieceFromMap:", pieceNumber);
    if (!pieceNumber) return;
    
    const piece = currentPiecesData?.find(p => String(p.number) === String(pieceNumber));
    console.log("24. piece یافت شده:", piece ? "بله" : "خیر");
    
    if (piece && piece.center) {
        map.flyTo([piece.center[1], piece.center[0]], 18, {
            animate: true,
            duration: 2.0,
            easeLinearity: 0.25
        });
        
        if (currentDistrictLayer) {
            let targetLayer = null;
            currentDistrictLayer.eachLayer(layer => {
                if (layer.pieceNumber === String(pieceNumber)) {
                    targetLayer = layer;
                }
            });
            
            if (targetLayer) {
                if (currentlyHighlighted) {
                    currentDistrictLayer.resetStyle(currentlyHighlighted);
                }
                
                targetLayer.setStyle({
                    color: '#ef4444',
                    weight: 4,
                    opacity: 1,
                    fillColor: '#ef4444',
                    fillOpacity: 0.3
                });
                
                currentlyHighlighted = targetLayer;
                
                setTimeout(() => {
                    targetLayer.openPopup();
                }, 500);
            }
        }
        
        // همگام‌سازی dropdown
        const pieceSelect = $('#pieceSelect');
        if (pieceSelect.length && pieceSelect.data('select2')) {
            pieceSelect.val(pieceNumber).trigger('change');
        }
    }
}

// ============================================================
// پاک کردن ناحیه از نقشه
// ============================================================
function clearDistrictFromMap() {
    if (currentDistrictLayer) {
        map.removeLayer(currentDistrictLayer);
        currentDistrictLayer = null;
    }
    if (currentlyHighlighted) {
        currentlyHighlighted = null;
    }
}

// ============================================================
// کپی کردن
// ============================================================
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ مختصات کپی شد!', 'success');
    }).catch(() => {
        showToast('❌ خطا در کپی', 'error');
    });
};

// ============================================================
// توست
// ============================================================
function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'toast-message';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '3000';
    toast.style.fontFamily = 'Vazirmatn, sans-serif';
    toast.style.fontSize = '13px';
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    toast.style.whiteSpace = 'nowrap';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#ef4444';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '2000';
    toast.style.fontFamily = 'Vazirmatn, sans-serif';
    toast.style.fontSize = '13px';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
});