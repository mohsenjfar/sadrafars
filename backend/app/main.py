# file_path: backend/app/main.py

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pathlib import Path
from datetime import datetime
from fastapi.templating import Jinja2Templates
import os

# ============================================================
# مسیرهای پروژه با ساختار جدید (backend + frontend)
# ============================================================

# ریشه پروژه (جایی که فایل‌های backend و frontend قرار دارند)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# مسیر بک‌اند
BACKEND_DIR = BASE_DIR / "backend"

# مسیر فرانت‌اند
FRONTEND_DIR = BASE_DIR / "frontend"

# مسیر فایل‌های استاتیک
STATIC_DIR = FRONTEND_DIR / "static"

# مسیر قالب‌های Jinja2
TEMPLATES_DIR = FRONTEND_DIR / "templates"

app = FastAPI(
    title="صدرافارس | سامانه جامع مهندسی ساختمان",
    version="2.0.0",
    description="سامانه محاسبه تعرفه‌های نقشه‌برداری و مهندسی ساختمان با سیستم احراز هویت",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


def get_timestamp() -> int:
    """دریافت timestamp برای جلوگیری از کش شدن فایل‌های استاتیک"""
    return int(datetime.now().timestamp())

def is_authenticated(request: Request) -> bool:
    """بررسی احراز هویت کاربر از طریق توکن (برای قالب‌ها)"""
    # این تابع در قالب‌ها برای نمایش/مخفی کردن المان‌ها استفاده می‌شود
    token = request.headers.get("Authorization")
    return bool(token and token.startswith("Bearer "))

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """صفحه اصلی سایت"""
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "timestamp": get_timestamp(),
            "is_authenticated": is_authenticated(request),
        }
    )

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    """صفحه داشبورد کاربری (نیاز به احراز هویت)"""
    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "timestamp": get_timestamp(),
            "is_authenticated": is_authenticated(request),
        }
    )

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """صفحه ورود"""
    return templates.TemplateResponse(
        "auth/login.html",
        {
            "request": request,
            "timestamp": get_timestamp(),
            "is_authenticated": is_authenticated(request),
        }
    )

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    """صفحه ثبت‌نام"""
    return templates.TemplateResponse(
        "auth/register.html",
        {
            "request": request,
            "timestamp": get_timestamp(),
            "is_authenticated": is_authenticated(request),
        }
    )

@app.get("/tools/tariff", response_class=HTMLResponse)
async def tariff_tool(request: Request):
    """ابزار محاسبه تعرفه نقشه‌برداری"""
    return templates.TemplateResponse(
        "tools/tariff.html",
        {
            "request": request,
            "timestamp": get_timestamp(),
            "is_authenticated": is_authenticated(request),
        }
    )

@app.get("/tools/engineering", response_class=HTMLResponse)
async def engineering_tool(request: Request):
    """ابزار محاسبه طراحی و نظارت"""
    return templates.TemplateResponse(
        "tools/engineering.html",
        {
            "request": request,
            "timestamp": get_timestamp(),
            "is_authenticated": is_authenticated(request),
        }
    )

@app.get("/tools/delay_penalty", response_class=HTMLResponse)
async def delay_penalty_tool(request: Request):
    """ابزار محاسبه هزینه تمدید نظارت"""
    return templates.TemplateResponse(
        "tools/delay_penalty.html",
        {
            "request": request,
            "timestamp": get_timestamp(),
            "is_authenticated": is_authenticated(request),
        }
    )

@app.get("/tools/map", response_class=HTMLResponse)
async def map_viewer(request: Request):
    """صفحه نقشه قطعات و نواحی"""
    return templates.TemplateResponse(
        "tools/map.html",
        {
            "request": request,
            "timestamp": get_timestamp(),
            "is_authenticated": is_authenticated(request),
        }
    )

from app.api.routes_auth import router as auth_router
from app.api.routes_districts import router as districts_router
from app.api.routes_tariff import router as tariff_router

# اضافه کردن روت‌های API با prefix
app.include_router(auth_router)
app.include_router(districts_router)
app.include_router(tariff_router)


@app.get("/health", tags=["System"])
async def health_check():
    """بررسی سلامت سرویس"""
    return {
        "status": "healthy",
        "version": app.version,
        "timestamp": datetime.now().isoformat(),
        "services": {
            "backend": "running",
            "static": str(STATIC_DIR.exists()),
            "templates": str(TEMPLATES_DIR.exists()),
        }
    }

@app.get("/api/health", tags=["System"])
async def api_health_check():
    """بررسی سلامت API"""
    return {
        "status": "healthy",
        "version": app.version,
        "timestamp": datetime.now().isoformat(),
    }

from fastapi import HTTPException
from fastapi.responses import JSONResponse

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """هندلر خطاهای HTTP"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code,
            "path": request.url.path,
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """هندلر خطاهای عمومی (برای دیباگ)"""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "خطای داخلی سرور",
            "error": str(exc) if os.getenv("DEBUG", "False").lower() == "true" else None,
            "path": request.url.path,
        }
    )


@app.on_event("startup")
async def startup_event():
    """کارهایی که در زمان شروع سرور انجام می‌شود"""
    print("🚀 سامانه صدرافارس راه‌اندازی شد!")
    print(f"📁 مسیر بک‌اند: {BACKEND_DIR}")
    print(f"📁 مسیر فرانت‌اند: {FRONTEND_DIR}")
    print(f"📁 مسیر استاتیک: {STATIC_DIR}")
    print(f"📁 مسیر قالب‌ها: {TEMPLATES_DIR}")
    print(f"📌 نسخه: {app.version}")
    print("-" * 50)

@app.on_event("shutdown")
async def shutdown_event():
    """کارهایی که در زمان توقف سرور انجام می‌شود"""
    print("🛑 سامانه صدرافارس متوقف شد!")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )