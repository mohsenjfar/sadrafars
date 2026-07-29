# AGENTS.md

## Workspace shape

This repository is a Python + Jinja + static frontend application with a FastAPI backend and a separate `frontend` asset tree.

- `backend/app/main.py`: application entrypoint, HTML route definitions, and mounted static assets.
- `backend/app/api/`: FastAPI routers.
- `backend/app/services/`: tariff and domain-specific business logic.
- `frontend/templates/`: Jinja HTML templates.
- `frontend/static/`: CSS, JS, images, and map data.

## Preferred commands

Use the backend virtual environment when running the API locally:

- `source backend/.venv/bin/activate`
- `cd backend && uvicorn app.main:app --port 8000`

For the frontend CSS pipeline:

- `cd frontend && npm run watch:css`
- `cd frontend && npm run build:css`

## Working conventions

- Treat `backend/app/main.py` as the central integration point for HTML pages, static mount paths, and API router registration.
- Keep API route additions in `backend/app/api/` and business logic in `backend/app/services/` rather than embedding logic directly in route modules.
- Preserve the existing split between Jinja HTML in `frontend/templates/` and static assets in `frontend/static/`.
- Avoid changing the dataset layout under `frontend/static/data/` unless the task explicitly requires new/updated map or tariff inputs.
- Prefer small, focused edits that fit the current server-rendered architecture; do not introduce a new frontend stack without clear need.

## Notes for agents

- The project serves HTML pages directly from FastAPI templates rather than a React/Vite frontend.
- The backend is the main runtime surface for routing and page composition.
- The frontend package is primarily a Tailwind/Leaflet asset build setup for server-rendered pages.
