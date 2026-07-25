# Project: NOMAD-IA Demo Hub

## Architecture
NOMAD-IA is a 100% offline local EdTech ecosystem web application built with a lightweight Node.js/Express backend server and a Mondrian-styled responsive frontend.

### Component Overview
1. **Backend Server (`server.js`)**:
   - Built with Node.js and Express.
   - Serves static assets from `public/` directory (Hub, AprenderIA, EducarIA).
   - `POST /api/telemetry`: Endpoint receiving JSON telemetry payloads from AprenderIA minigame.
   - `GET /api/telemetry`: Endpoint returning stored telemetry records for EducarIA dashboard.
   - In-memory array storage for telemetry data (`[]`), pre-seeded or reset on server start.
   - Runs on `http://localhost:3000`.

2. **Mondrian Hub Frontend (`public/index.html`, `public/styles/mondrian.css`)**:
   - Piet Mondrian style visual layout (Red `#E52521`, Blue `#004586`, Yellow `#F7D000`, Beige `#F6F4EE`, thick black borders `4-6px #000000`).
   - Portal cautivo / landing index page providing direct links to AprenderIA minigame (`/aprender-ia/`) and EducarIA dashboard (`/educar-ia/`).

3. **AprenderIA Minigame Prototype (`public/aprender-ia/index.html`, `public/aprender-ia/game.js`)**:
   - Mobile frame view (360x640px styled container centered or responsive).
   - 2 interactive STEAM quiz/puzzle interactions (e.g. Circuito Eléctrico / Cadena Trófica / Algoritmo).
   - Real-time cognitive telemetry tracking: `time_elapsed_ms`, `errors_count`, `rage_clicks`, `student_name`, `timestamp`.
   - Silent async background fetch sending payload via `POST /api/telemetry` on game completion.
   - Result screen showing performance feedback.

4. **EducarIA Teacher Dashboard Prototype (`public/educar-ia/index.html`, `public/educar-ia/dashboard.js`)**:
   - Desktop view for teacher monitoring.
   - Automatic polling/fetching from `GET /api/telemetry` every 3-5 seconds (plus manual Refresh button).
   - Dynamic Semáforo status table:
     - 🟢 **Verde** (Riesgo Bajo): Low completion time, 0 errors.
     - 🟡 **Amarillo** (Riesgo Medio): Moderate completion time or 1-2 errors.
     - 🔴 **Rojo** (Riesgo Alto): High completion time or >2 errors / high rage clicks.
   - Summary statistics cards (Total Students Played, Average Latency, Risk Breakdown).

5. **Programmatic Verification Script (`verify.js`)**:
   - Standalone Node.js script.
   - Sends mock telemetry JSON payload via HTTP POST to `http://localhost:3000/api/telemetry`.
   - Fetches telemetry via HTTP GET from `http://localhost:3000/api/telemetry`.
   - Verifies HTTP 200 responses, data payload structure, and correctness.
   - Exits with status code 0 on success, non-zero on failure.

## Code Layout
```
/home/laptop/Documentos/mvp-hackaton-minedu/
├── package.json
├── server.js
├── verify.js
├── public/
│   ├── index.html
│   ├── styles/
│   │   └── mondrian.css
│   ├── aprender-ia/
│   │   ├── index.html
│   │   └── game.js
│   └── educar-ia/
│       ├── index.html
│       └── dashboard.js
└── .agents/
    └── orchestrator/
        ├── ORIGINAL_REQUEST.md
        ├── BRIEFING.md
        ├── PROJECT.md
        ├── plan.md
        ├── progress.md
        └── context.md
```

## Interface Contracts

### POST /api/telemetry
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "student_id": "estudiante_01",
  "student_name": "Mateo Rossi",
  "game_id": "aprender_ia_steam",
  "time_elapsed_ms": 14500,
  "errors_count": 0,
  "rage_clicks": 0,
  "status": "completed",
  "timestamp": "2026-07-24T04:00:00.000Z"
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Telemetry recorded successfully",
  "data": { ... }
}
```

### GET /api/telemetry
- **Response**: `200 OK`
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "student_id": "estudiante_01",
      "student_name": "Mateo Rossi",
      "game_id": "aprender_ia_steam",
      "time_elapsed_ms": 14500,
      "errors_count": 0,
      "rage_clicks": 0,
      "status": "completed",
      "timestamp": "2026-07-24T04:00:00.000Z",
      "semaforo": "VERDE"
    }
  ]
}
```

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Specs | Review code structure, define specs and dependencies | None | DONE |
| 2 | Backend Server | Express backend with GET/POST /api/telemetry and static file serving | M1 | DONE |
| 3 | Mondrian UI System & Hub | Mondrian CSS theme, main Hub page index.html | M1 | DONE |
| 4 | AprenderIA Minigame | Mobile minigame view, telemetry tracking & silent POST submit | M2, M3 | DONE |
| 5 | EducarIA Dashboard | Desktop teacher dashboard, telemetry GET polling & Semáforo table | M2, M3 | DONE |
| 6 | Programmatic E2E Verification | verify.js automated test script for backend integration | M2, M4, M5 | DONE |
| 7 | Final E2E Audit & Hardening | Full end-to-end testing, review, challenge, and forensic audit | M1-M6 | DONE |
