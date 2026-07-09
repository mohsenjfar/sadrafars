#!/bin/bash

# ============================================
# اسکریپت کپی فایل‌های کلیدی به صورت فلت
# همه فایل‌ها در یک پوشه واحد کپی می‌شوند
# ============================================

# رنگ‌ها برای خروجی زیباتر
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# پوشه مقصد
DEST_DIR="project_flat_$(date +%Y%m%d_%H%M%S)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   کپی فایل‌های پروژه به صورت فلت     ${NC}"
echo -e "${BLUE}========================================${NC}"

# ایجاد پوشه مقصد
mkdir -p "$DEST_DIR"
echo -e "${GREEN}✓ پوشه مقصد ایجاد شد: $DEST_DIR${NC}"

# ============================================
# لیست فایل‌های مورد نیاز (همه در یک سطح)
# ============================================
echo -e "\n${YELLOW}📁 کپی فایل‌ها...${NC}"

# آرایه‌ای از فایل‌های مورد نیاز
FILES=(
    # فایل‌های اصلی اپلیکیشن
    "app/main.py"
    "app/api/routes_districts.py"
    "app/api/routes_tariff.py"
    "app/models/tariff_models.py"
    "app/services/tariff_calculator.py"
    
    # فایل‌های پیکربندی
    "requirements.txt"
    "requirements_helper.txt"
    "docker-compose.yml"
    "Dockerfile"
    "package.json"
    "package-lock.json"
    "tailwind.config.js"
    "postcss.config.js"
    ".gitignore"
    ".npmrc"
    
    # فایل‌های فرانت‌اند - HTML
    "templates/index.html"
    "templates/map_viewer.html"
    "templates/layouts/base.html"
    "templates/partials/_map_header.html"
    "templates/partials/_map_info_panel.html"
    "templates/partials/_map_legend.html"
    
    # فایل‌های فرانت‌اند - CSS
    "static/css/leaflet.css"
    "static/css/tailwind.css"
    "static/css/tailwind-input.css"
    
    # فایل‌های فرانت‌اند - JavaScript
    "static/js/map_viewer.js"
    "static/js/modal.js"
    "static/js/tools.js"
    "static/js/jquery.min.js"
    "static/js/leaflet.js"
    
    # فایل‌های کمکی
    "helpers/dxf2geojson.py"
    "helpers/add_boundary.py"
    "helpers/process_district.sh"
    "helpers/register_kernel.sh"
    "helpers/plot.ipynb"
    
    # نمونه دیتا (چند فایل مهم)
    "static/data/districts/14hectari.geojson"
    "static/data/districts/amoozesh_parvaresh.geojson"
    "static/data/districts/havabord.geojson"
    "static/data/districts/baharestan.geojson"
    "static/data/districts/shiraz_university.geojson"
    "static/data/districts/police.geojson"
    "static/data/districts/industrial.geojson"
)

# کپی فایل‌ها
COPIED=0
MISSING=0

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        # استخراج نام فایل بدون مسیر
        filename=$(basename "$file")
        # اگر فایل با نام تکراری وجود داشت، پیشوند اضافه کن
        if [ -f "$DEST_DIR/$filename" ]; then
            # اضافه کردن نام پوشه به فایل برای جلوگیری از تداخل
            dirname=$(dirname "$file" | sed 's|/|_|g')
            newname="${dirname}_${filename}"
            cp -v "$file" "$DEST_DIR/$newname" 2>/dev/null
            echo -e "${GREEN}  ✓ $file -> $newname${NC}"
        else
            cp -v "$file" "$DEST_DIR/" 2>/dev/null
            echo -e "${GREEN}  ✓ $file${NC}"
        fi
        ((COPIED++))
    else
        echo -e "${RED}  ✗ فایل وجود ندارد: $file${NC}"
        ((MISSING++))
    fi
done

echo -e "\n${GREEN}✓ کپی کامل شد!${NC}"
echo -e "  📄 کپی شده: $COPIED فایل"
echo -e "  ⚠️  وجود ندارد: $MISSING فایل"

# ============================================
# ایجاد فایل لیست فایل‌ها
# ============================================
echo -e "\n${YELLOW}📋 ایجاد لیست فایل‌ها...${NC}"

cat > "$DEST_DIR/00_FILE_LIST.txt" << 'EOF'
========================================
   لیست فایل‌های کپی شده
========================================

EOF

# اضافه کردن لیست فایل‌ها به صورت مرتب شده
ls -1 "$DEST_DIR" | grep -v "00_FILE_LIST.txt" | sort >> "$DEST_DIR/00_FILE_LIST.txt"

echo -e "${GREEN}✓ لیست فایل‌ها ایجاد شد${NC}"

# ============================================
# ایجاد فایل راهنما
# ============================================
echo -e "\n${YELLOW}📖 ایجاد فایل راهنما...${NC}"

cat > "$DEST_DIR/00_README.txt" << 'EOF'
========================================
   راهنمای فایل‌های پروژه
   Project Files Guide
========================================

این پوشه شامل فایل‌های کلیدی پروژه به صورت فلت (همه در یک سطح) است.

🔍 ترتیب مطالعه پیشنهادی:

1. فایل‌های پیکربندی (درک ساختار):
   - requirements.txt
   - docker-compose.yml
   - package.json

2. بک‌اند (درک منطق):
   - main.py
   - tariff_models.py
   - tariff_calculator.py
   - routes_districts.py
   - routes_tariff.py

3. فرانت‌اند (درک UI):
   - map_viewer.html
   - base.html
   - map_viewer.js
   - tools.js
   - tailwind.css

4. دیتا (درک ساختار داده):
   - 14hectari.geojson
   - havabord.geojson

5. ابزارهای کمکی:
   - dxf2geojson.py
   - add_boundary.py

========================================
📌 نکات مهم:
========================================

• فایل‌های GeoJSON حاوی داده‌های مکانی هستند
• main.py نقطه ورود اصلی برنامه است
• محاسبه تعرفه در tariff_calculator.py انجام می‌شود
• نقشه با Leaflet در map_viewer.js پیاده‌سازی شده

========================================
📅 تاریخ: $(date)
========================================
EOF

echo -e "${GREEN}✓ فایل راهنما ایجاد شد${NC}"

# ============================================
# نمایش نتیجه نهایی
# ============================================
echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✅ کپی فایل‌ها با موفقیت انجام شد!${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "\n📂 پوشه مقصد: ${YELLOW}$DEST_DIR${NC}"
echo -e "📊 تعداد فایل‌های کپی شده: ${GREEN}$(ls -1 "$DEST_DIR" | wc -l)${NC}"

echo -e "\n${YELLOW}📋 لیست فایل‌ها:${NC}"
ls -1 "$DEST_DIR" | head -20
if [ $(ls -1 "$DEST_DIR" | wc -l) -gt 20 ]; then
    echo -e "${YELLOW}... و $(($(ls -1 "$DEST_DIR" | wc -l) - 20)) فایل دیگر${NC}"
fi

echo -e "\n${YELLOW}برای مشاهده همه فایل‌ها:${NC}"
echo -e "  cd $DEST_DIR && ls -la"

echo -e "\n${YELLOW}برای ایجاد فشرده (برای ارسال):${NC}"
echo -e "  tar -czf ${DEST_DIR}.tar.gz $DEST_DIR/"
echo -e "  zip -r ${DEST_DIR}.zip $DEST_DIR/"

echo -e "\n${BLUE}========================================${NC}"