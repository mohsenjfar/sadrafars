# app/main.py
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pathlib import Path
from datetime import datetime
from fastapi.templating import Jinja2Templates

from app.api.routes_tariff import router as tariff_router
from app.api.routes_districts import router as districts_router
from app.api.routes_auth import router as auth_router

app = FastAPI(
    title="SadraFars",
    version="2.0"
)

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

def get_timestamp():
    return int(datetime.now().timestamp())


@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "timestamp": get_timestamp()}
    )

@app.get("/map", response_class=HTMLResponse)
def map_viewer(request: Request):
    return templates.TemplateResponse(
        "map_viewer.html",
        {"request": request, "timestamp": get_timestamp()}
    )

@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse(
        "login.html",
        {"request": request, "timestamp": get_timestamp()}
    )

@app.get("/register", response_class=HTMLResponse)
def register_page(request: Request):
    return templates.TemplateResponse(
        "register.html",
        {"request": request, "timestamp": get_timestamp()}
    )

@app.get("/dashboard", response_class=HTMLResponse)
def dashboard(request: Request):
    return templates.TemplateResponse(
        "dashboard.html",
        {"request": request, "timestamp": get_timestamp()}
    )

app.include_router(tariff_router)
app.include_router(districts_router)
app.include_router(auth_router)