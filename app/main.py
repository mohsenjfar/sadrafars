# file_path: app/main.py

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pathlib import Path
from datetime import datetime
from fastapi.templating import Jinja2Templates

from app.api.routes_tariff import router as tariff_router
from app.api.routes_districts import router as districts_router  # اضافه کن

app = FastAPI(
    title="Tariff 1405 API",
    version="1.0",
)

# مسیر پوشه static
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# سرو کردن فایل‌های استاتیک
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# تابع کمکی برای گرفتن timestamp
def get_timestamp():
    return int(datetime.now().timestamp())

# صفحه اصلی
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "timestamp": get_timestamp()
        }
    )

# صفحه نقشه قطعات و نواحی
@app.get("/map", response_class=HTMLResponse)
def map_viewer(request: Request):
    return templates.TemplateResponse(
        "map_viewer.html",
        {
            "request": request,
            "timestamp": get_timestamp()
        }
    )

# اضافه کردن APIها
app.include_router(tariff_router)
app.include_router(districts_router)