from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from app.api.routes_tariff import router as tariff_router

app = FastAPI(
    title="Tariff 1405 API",
    version="1.0",
)

# مسیر پوشه static
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

# سرو کردن فایل‌های استاتیک
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# صفحه اصلی
@app.get("/")
def serve_index():
    return FileResponse(STATIC_DIR / "index.html")

# اضافه کردن API
app.include_router(tariff_router)
