/* file_path: /static/js/map_viewer.js */

let map;
let currentDistrictLayer = null;
let currentPiecesData = [];
let currentlyHighlighted = null;
let currentDistrictId = null;

// ============================================================
// مقداردهی اولیه نقشه
// ============================================================
async function initializeMap() {
    console.log("🚀 [1] initializeMap شروع شد");
    
    map = L.map('map').setView([29.80421, 52.49931], 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 10
    }).addTo(map);
    
    console.log("🚀 [2] نقشه ساخته شد");
    await loadDistrictsList();
}

// ============================================================
// بارگذاری لیست نواحی
// ============================================================
async function loadDistrictsList() {
    console.log("📡 [3] در حال فراخوانی /api/districts");
    try {
        const response = await fetch('/api/districts');
        const data = await response.json();
        console.log("✅ [4] لیست نواحی دریافت شد:", data.districts.length, "ناحیه");
        
        populateDistrictDropdown(data.districts);
    } catch (error) {
        console.error('❌ [4] خطا:', error);
        showError('خطا در بارگذاری لیست نواحی');
    }
}

// ============================================================
// پر کردن dropdown نواحی
// ============================================================
function populateDistrictDropdown(districts) {
    console.log("🎨 [5] شروع populateDistrictDropdown");
    const dropdown = $('#districtSelect');
    
    const isSelect2Initialized = dropdown.hasClass('select2-hidden-accessible');
    
    dropdown.empty();
    dropdown.append('<option value="">-- انتخاب ناحیه --</option>');
    
    districts.forEach(district => {
        dropdown.append(`<option value="${district.id}">${district.name_fa}</option>`);
    });
    
    if (isSelect2Initialized) {
        dropdown.trigger('change');
        if (currentDistrictId) {
            dropdown.val(currentDistrictId).trigger('change.select2');
        }
    } else {
        // مقداردهی Select2 با تمپلیت سفارشی برای نمایش بهتر
        dropdown.select2({
            placeholder: 'جستجوی ناحیه...',
            allowClear: true,
            dir: 'rtl',
            language: 'fa',
            width: '250px',
            templateResult: formatDistrictResult,
            templateSelection: formatDistrictSelection
        });
        
        dropdown.off('change').on('change', function(e) {
            const districtId = e.target.value;
            console.log(`🔄 [6] رویداد change ناحیه: ${districtId}`);
            if (districtId && districtId !== currentDistrictId) {
                onDistrictChange(districtId);
            } else if (!districtId) {
                clearDistrictFromMap();
                hidePiecesDropdown();
                currentDistrictId = null;
            }
        });
    }
    
    if (currentDistrictId) {
        dropdown.val(currentDistrictId).trigger('change.select2');
    }
}

// فرمت کردن نمایش ناحیه در Select2
function formatDistrictResult(district) {
    if (district.loading) return district.text;
    if (!district.id || district.id === '') return district.text;
    
    return $('<span><i class="fas fa-map-marker-alt" style="margin-left: 8px;"></i> ' + district.text + '</span>');
}

function formatDistrictSelection(district) {
    if (!district.id || district.id === '') return district.text;
    return district.text;
}

// ============================================================
// تغییر ناحیه
// ============================================================
async function onDistrictChange(districtId) {
    console.log(`🌍 [7] onDistrictChange شروع: ${districtId}`);
    
    if (!districtId) return;
    
    showLoading(true);
    currentDistrictId = districtId;
    
    try {
        const url = `/api/districts/${districtId}/load`;
        console.log(`📡 [8] در حال فراخوانی: ${url}`);
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'خطا در بارگذاری');
        }
        
        console.log(`✅ [9] داده ناحیه دریافت شد`);
        console.log(`✅ [9.1] نام ناحیه: ${data.name_fa}`);
        console.log(`✅ [9.2] تعداد قطعات: ${data.pieces?.length || 0}`);
        
        currentPiecesData = data.pieces || [];
        window.currentPiecesData = currentPiecesData;
        
        populatePiecesDropdown(currentPiecesData);
        displayDistrictOnMap(data.geojson);
        
        if (data.center && data.center.length === 2) {
            map.flyTo([data.center[1], data.center[0]], 15, {
                animate: true,
                duration: 1.5
            });
        }
        
    } catch (error) {
        console.error('❌ [14] خطا:', error);
        showError('خطا در بارگذاری ناحیه');
        currentDistrictId = null;
    } finally {
        showLoading(false);
    }
}

// ============================================================
// نمایش ناحیه روی نقشه
// ============================================================
function displayDistrictOnMap(geojson) {
    if (currentDistrictLayer) {
        map.removeLayer(currentDistrictLayer);
    }
    
    const piecesDataForClosure = [...currentPiecesData];
    
    currentDistrictLayer = L.geoJSON(geojson, {
        // حذف style ثابت و改用 تابع style برای پشتیبانی از هایلایت
        style: function(feature) {
            const pieceNumber = feature.properties?.Name || feature.properties?.name;
            const isHighlighted = currentlyHighlighted && currentlyHighlighted.pieceNumber === String(pieceNumber);
            
            return {
                color: isHighlighted ? '#ef4444' : '#3b82f6',
                weight: isHighlighted ? 4 : 2,
                opacity: 0.7,
                fillColor: isHighlighted ? '#ef4444' : '#3b82f6',
                fillOpacity: isHighlighted ? 0.3 : 0.1
            };
        },
        onEachFeature: function(feature, layer) {
            const pieceNumber = feature.properties?.Name || feature.properties?.name;
            if (pieceNumber) {
                const pieceNumberStr = String(pieceNumber);
                const pieceData = piecesDataForClosure.find(p => String(p.number) === pieceNumberStr);
                layer.pieceNumber = pieceNumberStr;
                
                // کلیک روی قطعه
                layer.on('click', function() {
                    selectPieceFromMap(pieceNumberStr);
                });
                
                if (pieceData && pieceData.center) {
                    const centerText = `${pieceData.center[1]?.toFixed(6)} , ${pieceData.center[0]?.toFixed(6)}`;
                    layer.bindPopup(`
                        <div style="text-align: center; font-family: Vazirmatn; direction: rtl; min-width: 220px;">
                            <div style="font-size: 15px; font-weight: bold;">🏠 قطعه شماره ${pieceNumber}</div>
                            ${pieceData.area ? `<div>📐 مساحت: ${pieceData.area.toLocaleString()} متر مربع</div>` : ''}
                            <div style="background: #f1f5f9; padding: 8px; border-radius: 8px; margin-top: 8px;">
                                <code style="font-size: 11px;">${centerText}</code>
                                <button onclick="copyToClipboard('${centerText}')" style="margin-top: 6px; background: #2563eb; color: white; border: none; border-radius: 6px; padding: 4px 12px; cursor: pointer; width: 100%;">
                                    📋 کپی مختصات
                                </button>
                            </div>
                        </div>
                    `);
                } else {
                    layer.bindPopup(`<div style="text-align: center;"><strong>قطعه شماره ${pieceNumber}</strong></div>`);
                }
            }
        }
    }).addTo(map);
}

// ============================================================
// پر کردن dropdown قطعه با فرمت سفارشی
// ============================================================
function populatePiecesDropdown(pieces) {
    console.log("🎨 [18] populatePiecesDropdown شروع");
    
    const container = $('#pieceSelectContainer');
    const pieceSelect = $('#pieceSelect');
    
    if (!pieces || pieces.length === 0) {
        container.hide();
        return;
    }
    
    const isSelect2Initialized = pieceSelect.hasClass('select2-hidden-accessible');
    const previousValue = pieceSelect.val();
    
    pieceSelect.empty();
    pieceSelect.append('<option value="">-- انتخاب قطعه --</option>');
    
    const sortedPieces = [...pieces].sort((a, b) => {
        return parseFloat(a.number) - parseFloat(b.number);
    });
    
    sortedPieces.forEach(piece => {
        pieceSelect.append(`<option value="${piece.number}">قطعه ${piece.number}</option>`);
    });
    
    if (isSelect2Initialized) {
        // فقط آپدیت کن
        pieceSelect.trigger('change');
        if (previousValue && pieces.some(p => String(p.number) === String(previousValue))) {
            pieceSelect.val(previousValue).trigger('change.select2');
        }
    } else {
        // مقداردهی اولیه با فرمت سفارشی
        pieceSelect.select2({
            placeholder: 'جستجوی قطعه...',
            allowClear: true,
            dir: 'rtl',
            language: 'fa',
            width: '250px',
            templateResult: formatPieceResult,
            templateSelection: formatPieceSelection,
            // اضافه کردن جستجو
            matcher: function(params, data) {
                // جستجو بر اساس شماره قطعه
                if ($.trim(params.term) === '') {
                    return data;
                }
                
                const term = params.term.toString();
                const pieceNumber = data.text.replace('قطعه ', '');
                
                if (pieceNumber.indexOf(term) > -1) {
                    return data;
                }
                
                return null;
            }
        });
        
        pieceSelect.off('change').on('change', function(e) {
            const selectedValue = e.target.value;
            console.log(`🔄 [19] قطعه انتخاب شد: ${selectedValue}`);
            if (selectedValue) {
                onPieceChangeFromDropdown(selectedValue);
            } else {
                if (currentlyHighlighted && currentDistrictLayer) {
                    currentDistrictLayer.resetStyle(currentlyHighlighted);
                    currentlyHighlighted = null;
                }
            }
        });
    }
    
    container.show();
    console.log("✅ [20] dropdown قطعه نمایش داده شد");
    
    // تنظیم موقعیت ضربدر
    setTimeout(() => {
        $('.select2-selection__clear').css({
            'right': 'auto',
            'left': '25px'
        });
    }, 100);
}

// فرمت کردن نمایش قطعه در لیست
function formatPieceResult(piece) {
    if (piece.loading) return piece.text;
    if (!piece.id || piece.id === '') return piece.text;
    
    // استخراج شماره قطعه
    const pieceNumber = piece.text.replace('قطعه ', '');
    
    return $(`
        <div style="display: flex; justify-content: space-between; align-items: center; direction: rtl;">
            <span>🏠 ${piece.text}</span>
            <span style="font-size: 11px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 12px;">شماره ${pieceNumber}</span>
        </div>
    `);
}

// فرمت کردن نمایش قطعه انتخاب شده
function formatPieceSelection(piece) {
    if (!piece.id || piece.id === '') return piece.text;
    return piece.text;
}

// ============================================================
// مخفی کردن dropdown قطعه
// ============================================================
function hidePiecesDropdown() {
    const container = $('#pieceSelectContainer');
    container.hide();
    
    if (currentlyHighlighted && currentDistrictLayer) {
        currentDistrictLayer.resetStyle(currentlyHighlighted);
        currentlyHighlighted = null;
    }
}

// ============================================================
// انتخاب قطعه از dropdown
// ============================================================
function onPieceChangeFromDropdown(pieceNumber) {
    console.log("انتخاب از dropdown:", pieceNumber);
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
    console.log("کلیک روی قطعه:", pieceNumber);
    if (!pieceNumber) return;
    
    const pieceNumberStr = String(pieceNumber);
    
    // ========================================
    // 1. ریست کردن رنگ قطعه قبلی
    // ========================================
    if (currentDistrictLayer) {
        currentDistrictLayer.eachLayer(function(layer) {
            if (layer.setStyle) {
                // برگرداندن به رنگ آبی عادی
                layer.setStyle({
                    color: '#3b82f6',
                    weight: 2,
                    opacity: 0.7,
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1
                });
            }
        });
    }
    
    // ========================================
    // 2. رنگ کردن قطعه جدید
    // ========================================
    let targetLayer = null;
    
    if (currentDistrictLayer) {
        currentDistrictLayer.eachLayer(function(layer) {
            if (layer.pieceNumber === pieceNumberStr) {
                targetLayer = layer;
                // تغییر رنگ به قرمز
                layer.setStyle({
                    color: '#ef4444',
                    weight: 4,
                    opacity: 1,
                    fillColor: '#ef4444',
                    fillOpacity: 0.3
                });
            }
        });
    }
    
    // ذخیره قطعه انتخاب شده
    currentlyHighlighted = targetLayer;
    
    // ========================================
    // 3. حرکت به مرکز قطعه
    // ========================================
    const piece = currentPiecesData?.find(p => String(p.number) === pieceNumberStr);
    if (piece && piece.center) {
        map.flyTo([piece.center[1], piece.center[0]], 18, { duration: 1 });
    }
    
    // ========================================
    // 4. باز کردن popup
    // ========================================
    if (targetLayer) {
        setTimeout(() => {
            targetLayer.openPopup();
        }, 500);
    }
    
    // ========================================
    // 5. همگام‌سازی dropdown
    // ========================================
    const pieceSelect = $('#pieceSelect');
    if (pieceSelect.length) {
        pieceSelect.val(pieceNumberStr).trigger('change');
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
    currentPiecesData = [];
    currentDistrictId = null;
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
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        z-index: 3000;
        font-family: Vazirmatn, sans-serif;
        font-size: 13px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        white-space: nowrap;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

function showError(message) {
    showToast(message, 'error');
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
}

// شروع برنامه
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
});