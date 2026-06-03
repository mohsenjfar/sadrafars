import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

current_dir = os.path.dirname(os.path.realpath(__file__))
static_dir_path = os.path.join(current_dir, "static")

app.mount("/static", StaticFiles(directory=static_dir_path), name="static")

@app.get("/")
async def read_index():
    index_path = os.path.join(static_dir_path, "index.html")
    return FileResponse(index_path)

@app.get("/api/hello")
async def hello_api():
    return {"message": "Hello from ARA API"}
