/* file_path: /static/js/map_viewer.js */

let map;
let currentDistrictLayer = null;
let currentPiecesData = [];
let currentlyHighlighted = null;
let currentDistrictId = null;

let districtsData = [];

// ============================================================
// مقداردهی اولیه نقشه
// ============================================================
async function initializeMap() {
    map = L.map('map').setView([29.80421, 52.49931], 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 10
    }).addTo(map);
    
    await loadDistrictsList();
}

// ============================================================
// بارگذاری لیست نواحی
// ============================================================
async function loadDistrictsList() {
    try {
        const response = await fetch('/api/districts');
        const data = await response.json();
        districtsData = data.districts;
        populateDistrictDropdown(districtsData);
    } catch (error) {
        showError('خطا در بارگذاری لیست نواحی');
    }
}

// ============================================================
// پر کردن dropdown ناحیه
// ============================================================
function populateDistrictDropdown(districts) {
    const input = $('#districtInput');
    const list = $('#districtList');
    const dropdown = $('#districtDropdown');
    const clearBtn = $('#districtClearBtn');
    
    if (!input.length || !list.length || !dropdown.length || !clearBtn.length) return;
    
    function renderList(filter = '') {
        list.empty();
        
        let filtered = districts;
        if (filter.trim() !== '') {
            filtered = districts.filter(d => d.name_fa.includes(filter));
        }
        
        if (filtered.length === 0) {
            list.append(`<div class="custom-dropdown-item text-gray-400 text-center" style="padding: 8px 14px; text-align: center; color: #94a3b8;">❌ ناحیه‌ای یافت نشد</div>`);
            return;
        }
        
        filtered.forEach(district => {
            let displayText = district.name_fa;
            if (filter.trim() !== '') {
                const regex = new RegExp(filter, 'gi');
                displayText = district.name_fa.replace(regex, match => `<span style="color: #2563eb; font-weight: bold;">${match}</span>`);
            }
            
            const item = $(`
                <div class="custom-dropdown-item" data-id="${district.id}" style="padding: 8px 14px; cursor: pointer; font-size: 13px; color: #1e293b; transition: background 0.15s; border-bottom: 1px solid #f1f5f9;">
                    ${displayText}
                </div>
            `);
            
            item.on('mouseenter', function() { $(this).css('background', '#f1f5f9'); });
            item.on('mouseleave', function() { $(this).css('background', 'transparent'); });
            item.on('click', function() {
                input.val(district.name_fa);
                list.empty();
                dropdown.removeClass('open');
                updateClearButtonVisibility(input, clearBtn);
                if (district.id !== currentDistrictId) {
                    onDistrictChange(district.id);
                }
            });
            
            list.append(item);
        });
    }
    
    function updateClearButtonVisibility(inputElement, buttonElement) {
        if (inputElement.val().trim() !== '') {
            buttonElement.addClass('visible');
        } else {
            buttonElement.removeClass('visible');
        }
    }
    
    clearBtn.off('click').on('click', function(e) {
        e.stopPropagation();
        input.val('');
        list.empty();
        dropdown.removeClass('open');
        $(this).removeClass('visible');
        clearDistrictFromMap();
        hidePiecesDropdown();
        currentDistrictId = null;
        input.focus();
    });
    
    input.off('click').on('click', function(e) {
        e.stopPropagation();
        if (dropdown.hasClass('open')) {
            dropdown.removeClass('open');
        } else {
            renderList('');
            dropdown.addClass('open');
        }
    });
    
    input.off('input').on('input', function() {
        updateClearButtonVisibility($(this), clearBtn);
        const val = $(this).val();
        if (val === '') {
            clearDistrictFromMap();
            hidePiecesDropdown();
            currentDistrictId = null;
            if (dropdown.hasClass('open')) {
                renderList('');
            }
        } else {
            renderList(val);
            if (!dropdown.hasClass('open')) {
                dropdown.addClass('open');
            }
        }
    });
    
    $(document).off('click.district').on('click.district', function(e) {
        if (!dropdown.is(e.target) && !dropdown.has(e.target).length) {
            dropdown.removeClass('open');
        }
    });
    
    input.off('keydown').on('keydown', function(e) {
        if (e.key === 'Enter') {
            const firstItem = list.find('.custom-dropdown-item').first();
            if (firstItem.length && firstItem.data('id')) {
                const district = districts.find(d => d.id === firstItem.data('id'));
                if (district && district.id !== currentDistrictId) {
                    input.val(district.name_fa);
                    list.empty();
                    dropdown.removeClass('open');
                    updateClearButtonVisibility(input, clearBtn);
                    onDistrictChange(district.id);
                }
            }
        }
    });
    
    if (currentDistrictId) {
        const district = districts.find(d => d.id === currentDistrictId);
        if (district) {
            input.val(district.name_fa);
            updateClearButtonVisibility(input, clearBtn);
        }
    }
}

// ============================================================
// تغییر ناحیه
// ============================================================
async function onDistrictChange(districtId) {
    if (!districtId) return;
    
    showLoading(true);
    currentDistrictId = districtId;
    
    try {
        const response = await fetch(`/api/districts/${districtId}/load`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'خطا در بارگذاری');
        }
        
        currentPiecesData = data.pieces || [];
        window.currentPiecesData = currentPiecesData;
        
        populatePiecesDropdown(currentPiecesData);
        displayDistrictOnMap(data.geojson);
        
        if (data.center && data.center.length === 2) {
            map.flyTo([data.center[1], data.center[0]], 15, { animate: true, duration: 1.5 });
        }
        
    } catch (error) {
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
// پر کردن dropdown قطعه
// ============================================================
function populatePiecesDropdown(pieces) {
    const container = $('#pieceSelectContainer');
    const input = $('#pieceInput');
    const list = $('#pieceList');
    const clearBtn = $('#pieceClearBtn');
    
    if (!container.length || !input.length || !list.length || !clearBtn.length) return;
    
    if (!pieces || pieces.length === 0) {
        container.addClass('hidden');
        return;
    }
    
    const sortedPieces = [...pieces].sort((a, b) => parseFloat(a.number) - parseFloat(b.number));
    
    function renderList(filter = '') {
        list.empty();
        
        let filtered = sortedPieces;
        if (filter.trim() !== '') {
            filtered = sortedPieces.filter(p => String(p.number).includes(filter));
        }
        
        if (filtered.length === 0) {
            list.append(`<div class="custom-dropdown-item text-gray-400 text-center" style="padding: 8px 14px; text-align: center; color: #94a3b8;">❌ قطعه‌ای یافت نشد</div>`);
            return;
        }
        
        filtered.forEach(piece => {
            let displayText = `قطعه ${piece.number}`;
            if (filter.trim() !== '') {
                const regex = new RegExp(filter, 'gi');
                displayText = `قطعه ${piece.number}`.replace(regex, match => `<span style="color: #2563eb; font-weight: bold;">${match}</span>`);
            }
            
            const item = $(`
                <div class="custom-dropdown-item" data-id="${piece.number}" style="padding: 8px 14px; cursor: pointer; font-size: 13px; color: #1e293b; transition: background 0.15s; border-bottom: 1px solid #f1f5f9;">
                    ${displayText}
                </div>
            `);
            
            item.on('mouseenter', function() { $(this).css('background', '#f1f5f9'); });
            item.on('mouseleave', function() { $(this).css('background', 'transparent'); });
            item.on('click', function() {
                input.val(`قطعه ${piece.number}`);
                list.empty();
                container.removeClass('open');
                updateClearButtonVisibility(input, clearBtn);
                onPieceChangeFromDropdown(piece.number);
            });
            
            list.append(item);
        });
    }
    
    function updateClearButtonVisibility(inputElement, buttonElement) {
        if (inputElement.val().trim() !== '') {
            buttonElement.addClass('visible');
        } else {
            buttonElement.removeClass('visible');
        }
    }
    
    clearBtn.off('click').on('click', function(e) {
        e.stopPropagation();
        input.val('');
        list.empty();
        container.removeClass('open');
        $(this).removeClass('visible');
        
        if (currentDistrictLayer) {
            currentDistrictLayer.eachLayer(function(layer) {
                if (layer.setStyle) {
                    layer.setStyle({ color: '#3b82f6', weight: 2, opacity: 0.7, fillColor: '#3b82f6', fillOpacity: 0.1 });
                }
            });
            currentlyHighlighted = null;
        }
        input.focus();
    });
    
    input.off('click').on('click', function(e) {
        e.stopPropagation();
        if (container.hasClass('open')) {
            container.removeClass('open');
        } else {
            renderList('');
            container.addClass('open');
        }
    });
    
    input.off('input').on('input', function() {
        updateClearButtonVisibility($(this), clearBtn);
        const val = $(this).val();
        if (val === '') {
            if (container.hasClass('open')) {
                renderList('');
            }
        } else {
            renderList(val);
            if (!container.hasClass('open')) {
                container.addClass('open');
            }
        }
    });
    
    $(document).off('click.piece').on('click.piece', function(e) {
        if (!container.is(e.target) && !container.has(e.target).length) {
            container.removeClass('open');
        }
    });
    
    input.off('keydown').on('keydown', function(e) {
        if (e.key === 'Enter') {
            const firstItem = list.find('.custom-dropdown-item').first();
            if (firstItem.length && firstItem.data('id')) {
                const pieceNumber = firstItem.data('id');
                input.val(`قطعه ${pieceNumber}`);
                list.empty();
                container.removeClass('open');
                updateClearButtonVisibility(input, clearBtn);
                onPieceChangeFromDropdown(pieceNumber);
            }
        }
    });
    
    container.removeClass('hidden');
}

// ============================================================
// مخفی کردن dropdown قطعه
// ============================================================
function hidePiecesDropdown() {
    const container = $('#pieceSelectContainer');
    const input = $('#pieceInput');
    const clearBtn = $('#pieceClearBtn');
    const list = $('#pieceList');
    
    container.addClass('hidden').removeClass('open');
    input.val('');
    clearBtn.removeClass('visible');
    list.empty();
    
    if (currentlyHighlighted && currentDistrictLayer) {
        currentDistrictLayer.eachLayer(function(layer) {
            if (layer.setStyle) {
                layer.setStyle({ color: '#3b82f6', weight: 2, opacity: 0.7, fillColor: '#3b82f6', fillOpacity: 0.1 });
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
    const piece = currentPiecesData?.find(p => String(p.number) === pieceNumberStr);
    
    if (!piece || !piece.center) {
        showError(`قطعه ${pieceNumber} یافت نشد`);
        return;
    }
    
    map.flyTo([piece.center[1], piece.center[0]], 18, { animate: true, duration: 2.0, easeLinearity: 0.25 });
    
    if (currentDistrictLayer) {
        let targetLayer = null;
        
        currentDistrictLayer.eachLayer(layer => {
            if (layer.pieceNumber === pieceNumberStr) targetLayer = layer;
        });
        
        currentDistrictLayer.eachLayer(function(layer) {
            if (layer.setStyle) {
                layer.setStyle({ color: '#3b82f6', weight: 2, opacity: 0.7, fillColor: '#3b82f6', fillOpacity: 0.1 });
            }
        });
        
        if (targetLayer) {
            targetLayer.setStyle({ color: '#ef4444', weight: 4, opacity: 1, fillColor: '#ef4444', fillOpacity: 0.3 });
            currentlyHighlighted = targetLayer;
            setTimeout(() => targetLayer.openPopup(), 500);
        }
    }
    
    const input = $('#pieceInput');
    const clearBtn = $('#pieceClearBtn');
    input.val(`قطعه ${pieceNumberStr}`);
    clearBtn.addClass('visible');
}

// ============================================================
// انتخاب قطعه از نقشه
// ============================================================
function selectPieceFromMap(pieceNumber) {
    if (!pieceNumber) return;
    
    const pieceNumberStr = String(pieceNumber);
    
    if (currentDistrictLayer) {
        currentDistrictLayer.eachLayer(function(layer) {
            if (layer.setStyle) {
                layer.setStyle({ color: '#3b82f6', weight: 2, opacity: 0.7, fillColor: '#3b82f6', fillOpacity: 0.1 });
            }
        });
    }
    
    let targetLayer = null;
    
    if (currentDistrictLayer) {
        currentDistrictLayer.eachLayer(function(layer) {
            if (layer.pieceNumber === pieceNumberStr) {
                targetLayer = layer;
                layer.setStyle({ color: '#ef4444', weight: 4, opacity: 1, fillColor: '#ef4444', fillOpacity: 0.3 });
            }
        });
    }
    
    currentlyHighlighted = targetLayer;
    
    const piece = currentPiecesData?.find(p => String(p.number) === pieceNumberStr);
    if (piece && piece.center) {
        map.flyTo([piece.center[1], piece.center[0]], 18, { duration: 1 });
    }
    
    if (targetLayer) {
        setTimeout(() => targetLayer.openPopup(), 500);
    }
    
    const input = $('#pieceInput');
    const clearBtn = $('#pieceClearBtn');
    input.val(`قطعه ${pieceNumberStr}`);
    clearBtn.addClass('visible');
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
    $('.toast-message').remove();
    
    const toast = $(`
        <div class="toast-message" style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background-color: ${type === 'success' ? '#10b981' : '#ef4444'}; color: white; padding: 10px 20px; border-radius: 8px; z-index: 3000; font-family: Vazirmatn, sans-serif; font-size: 13px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); white-space: nowrap;">
            ${message}
        </div>
    `);
    
    $('body').append(toast);
    setTimeout(() => toast.remove(), 2000);
}

function showError(message) {
    showToast(message, 'error');
}

function showLoading(show) {
    const loading = $('#loading');
    if (loading.length) {
        loading.toggleClass('show', show);
    }
}

// شروع برنامه
$(document).ready(function() {
    initializeMap();
});