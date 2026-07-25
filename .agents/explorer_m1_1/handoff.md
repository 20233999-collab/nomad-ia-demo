# Handoff Report: Milestone 1 - Express Backend & Project Specs

## 1. Observation

### 1.1 Project Directory & Environment Inspection
- **Project Root Path**: `/home/laptop/Documentos/mvp-hackaton-minedu`
- **Node.js Version**: `v22.23.1` (Supports native `node --watch` flag for zero-dependency live reload)
- **npm Version**: `10.9.8`
- **Existing Project Root Files**:
  - `PRD_NOMAD_IA.md` (8,943 bytes)
  - `implementation_plan.md` (4,339 bytes)
  - `CatA_Miniclub_Anexo5.pdf`, `enfoque_idea.md`, `estructura_idea.md`, `notebook_lm_sintesis.md`, `plan_estrategico_anterior.md`, multiple infographic files (`infografia_*.jpg`, `infografia_*.html`).
- **Existing `.agents/` Subdirectories**:
  - `.agents/orchestrator/PROJECT.md` (5,129 bytes)
  - `.agents/explorer_m1_1/` (Current Working Directory)
  - `.agents/explorer_m1_2/`, `.agents/explorer_m1_3/`, `.agents/sentinel/`

### 1.2 Key Specifications from PROJECT.md
- **Backend File Target**: `server.js` at project root (`/home/laptop/Documentos/mvp-hackaton-minedu/server.js`).
- **Static Assets Directory**: `public/` directory (serving Hub landing page, `aprender-ia/` minigame, `educar-ia/` dashboard).
- **Target Server Port**: `http://localhost:3000` (configurable via `process.env.PORT`).
- **API Contracts**:
  1. `POST /api/telemetry`:
     - Content-Type: `application/json`
     - Required Fields: `student_id`, `student_name`, `game_id`, `time_elapsed_ms`, `errors_count`
     - Optional Fields: `rage_clicks` (default 0), `status` (default "completed"), `timestamp` (ISO string default `new Date().toISOString()`)
     - Response (200 OK): `{ "success": true, "message": "Telemetry recorded successfully", "data": { ... } }`
  2. `GET /api/telemetry`:
     - Response (200 OK): `{ "success": true, "count": N, "data": [ { "id": 1, ... "semaforo": "VERDE" } ] }`

---

## 2. Logic Chain

1. **Dependency Minimization Strategy**:
   - The NOMAD-IA project targets an off-grid, low-resource local hardware setup (e.g., Raspberry Pi or Mini PC in rural Peruvian schools as specified in `PRD_NOMAD_IA.md` section 6.3).
   - Therefore, the Node.js backend should minimize external dependencies to run with near-zero overhead.
   - Node v22 provides native `--watch` mode, eliminating the need for `nodemon` as a development dependency.
   - Required runtime dependencies are strictly limited to `express` (v4.x) for routing/static serving and `cors` (v2.8.5) to allow cross-origin calls during testing/verification.

2. **Server Architecture Design (`server.js`)**:
   - **Module Format**: CommonJS (`require` syntax) is selected for simplicity, zero-transpilation execution, and immediate compatibility across Node.js environments.
   - **Static File Middleware**: `express.static(path.join(__dirname, 'public'))` should be mounted before fallback routes so static HTML/CSS/JS assets (`public/index.html`, `public/aprender-ia/`, `public/educar-ia/`) are served at high speed without overhead.
   - **Body Parsing**: `express.json()` middleware must be registered before API routes to automatically parse JSON payloads sent by `verify.js` and the `AprenderIA` frontend.
   - **Telemetry Risk Classification (`semaforo`) Logic**:
     - Rule evaluation sequence:
       - **🔴 ROJO (High Risk / Intervention Required)**: `errors_count > 2` OR `rage_clicks > 2` OR `time_elapsed_ms > 45000`.
       - **🟡 AMARILLO (Medium Risk / Attention Required)**: `errors_count >= 1` OR `rage_clicks >= 1` OR `time_elapsed_ms > 25000`.
       - **🟢 VERDE (Low Risk / Dominating)**: All other completion records.
   - **In-Memory Telemetry Storage**:
     - Maintained in a global array `let telemetryStore = [];`.
     - Seed data: Initialized as empty `[]`, with optional reset route `DELETE /api/telemetry` for test isolation.
   - **Error Handling**:
     - Validates payload structure in `POST /api/telemetry` and returns HTTP `400 Bad Request` if mandatory fields are missing.
     - Implements a catch-all 404 JSON handler for unknown `/api/*` endpoints.
     - Implements global error-handling middleware (`(err, req, res, next)`) to ensure all errors return a structured `{ success: false, error: string }` JSON response with HTTP 500.

---

## 3. Caveats

1. **In-Memory Volatility**:
   - Telemetry data is stored in RAM (`let telemetryStore = []`). Restarting the server resets the store. This is fully aligned with hackathon scope and `PROJECT.md` line 12.
2. **CORS in Production**:
   - `cors()` is enabled globally to facilitate testing across local IP addresses (e.g. mobile devices connected to local Wi-Fi hotspot during hackathon demo).
3. **Node Version Requirement**:
   - The dev script relies on `node --watch server.js` which requires Node.js v18.11.0+. Current environment has Node v22.23.1, so this is fully supported.

---

## 4. Conclusion & Recommended Specifications

### 4.1 Exact `package.json` Specification

```json
{
  "name": "nomad-ia-demo-hub",
  "version": "1.0.0",
  "description": "NOMAD-IA Demo Hub - Offline EdTech Ecosystem Web Application with Cognitive Telemetry & Early Warning Teacher Dashboard",
  "main": "server.js",
  "type": "commonjs",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js",
    "verify": "node verify.js"
  },
  "keywords": [
    "edtech",
    "offline",
    "telemetry",
    "express",
    "nomad-ia"
  ],
  "author": "NOMAD-IA Team",
  "license": "MIT",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.21.0"
  }
}
```

### 4.2 Exact `server.js` Architecture & Reference Implementation

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public/ directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory telemetry database
let telemetryStore = [];

/**
 * Calculates Semáforo risk status based on cognitive telemetry metrics.
 * @param {Object} data - Telemetry payload
 * @returns {string} "VERDE" | "AMARILLO" | "ROJO"
 */
function calculateSemaforo(data) {
  const errors = Number(data.errors_count) || 0;
  const rageClicks = Number(data.rage_clicks) || 0;
  const timeMs = Number(data.time_elapsed_ms) || 0;

  if (errors > 2 || rageClicks > 2 || timeMs > 45000) {
    return 'ROJO';
  }
  if (errors >= 1 || rageClicks >= 1 || timeMs > 25000) {
    return 'AMARILLO';
  }
  return 'VERDE';
}

// REST API Endpoints

// GET /api/telemetry - Retrieve all recorded telemetry data
app.get('/api/telemetry', (req, res) => {
  res.status(200).json({
    success: true,
    count: telemetryStore.length,
    data: telemetryStore
  });
});

// POST /api/telemetry - Record new telemetry data from AprenderIA minigame
app.post('/api/telemetry', (req, res) => {
  const {
    student_id,
    student_name,
    game_id,
    time_elapsed_ms,
    errors_count,
    rage_clicks,
    status,
    timestamp
  } = req.body;

  // Payload Validation
  if (!student_name || !game_id || time_elapsed_ms === undefined || errors_count === undefined) {
    return res.status(400).json({
      success: false,
      message: "Validation error: Missing required telemetry fields (student_name, game_id, time_elapsed_ms, errors_count)"
    });
  }

  const record = {
    id: telemetryStore.length + 1,
    student_id: student_id || `estudiante_${String(telemetryStore.length + 1).padStart(2, '0')}`,
    student_name: String(student_name).trim(),
    game_id: String(game_id).trim(),
    time_elapsed_ms: Number(time_elapsed_ms),
    errors_count: Number(errors_count),
    rage_clicks: Number(rage_clicks || 0),
    status: status || 'completed',
    timestamp: timestamp || new Date().toISOString(),
    semaforo: calculateSemaforo({ time_elapsed_ms, errors_count, rage_clicks })
  };

  telemetryStore.push(record);

  return res.status(200).json({
    success: true,
    message: "Telemetry recorded successfully",
    data: record
  });
});

// DELETE /api/telemetry - Clear telemetry store (for testing/verification reset)
app.delete('/api/telemetry', (req, res) => {
  telemetryStore = [];
  res.status(200).json({
    success: true,
    message: "Telemetry store reset successfully",
    count: 0
  });
});

// 404 Handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Fallback route serving public/index.html for client-side navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 NOMAD-IA Demo Hub server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
```

---

## 5. Verification Method

To verify the proposed implementation once created by Implementer:

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Server**:
   ```bash
   npm start
   # Or for development with live reload:
   npm run dev
   ```
3. **Test API Endpoints via HTTP**:
   - **POST Test**:
     ```bash
     curl -X POST http://localhost:3000/api/telemetry \
       -H "Content-Type: application/json" \
       -d '{"student_id":"estudiante_01","student_name":"Mateo Rossi","game_id":"aprender_ia_steam","time_elapsed_ms":14500,"errors_count":0,"rage_clicks":0,"status":"completed"}'
     ```
     *Expected Result*: HTTP 200 OK with `semaforo: "VERDE"`.
   - **GET Test**:
     ```bash
     curl -X GET http://localhost:3000/api/telemetry
     ```
     *Expected Result*: HTTP 200 OK with `count: 1` and array containing the recorded telemetry object.
   - **Static File Serving Test**:
     ```bash
     curl -I http://localhost:3000/
     ```
     *Expected Result*: HTTP 200 OK serving `public/index.html`.
4. **Programmatic Verification**:
   ```bash
   npm run verify
   ```
   *Expected Result*: `verify.js` executes POST and GET requests and exits with code 0.
