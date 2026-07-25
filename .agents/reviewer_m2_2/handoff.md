# Milestone 2 (Backend Server) Review & Handoff Report

## 1. Observation

- **Inspected Files**:
  - `package.json` (`/home/laptop/Documentos/mvp-hackaton-minedu/package.json`, lines 1-25): Express `^4.21.0` and CORS `^2.8.5` dependencies, scripts `"start": "node server.js"` and `"dev": "node --watch server.js"`.
  - `server.js` (`/home/laptop/Documentos/mvp-hackaton-minedu/server.js`, lines 1-144): Node/Express server running on port 3000. In-memory `telemetryStore = []`.
  - `PROJECT.md` (`/home/laptop/Documentos/mvp-hackaton-minedu/.agents/orchestrator/PROJECT.md`, lines 70-116): Interface contract for `POST /api/telemetry` and `GET /api/telemetry`.
  - `PRD_NOMAD_IA.md` (`/home/laptop/Documentos/mvp-hackaton-minedu/PRD_NOMAD_IA.md`, Section 5): Telemetry & Semáforo alert specifications.

- **`calculateSemaforo` Risk Rating Implementation** (`server.js`, lines 24-36):
```javascript
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
```

- **Live HTTP Execution Results** (Executed against `http://localhost:3000`):
  - `GET /api/telemetry` (Empty Store): `HTTP 200 OK`, `count: 0`, `data: []`, `Access-Control-Allow-Origin: *`.
  - `POST /api/telemetry` (VERDE Case: 15s, 0 errors, 0 rage clicks): `HTTP 200 OK`, `semaforo: "VERDE"`, `id: 1`, `student_id: "estudiante_01"`.
  - `POST /api/telemetry` (AMARILLO Case: 28s, 1 error, 0 rage clicks): `HTTP 200 OK`, `semaforo: "AMARILLO"`, `id: 2`, `student_id: "estudiante_02"`.
  - `POST /api/telemetry` (ROJO Case: 50s, 3 errors, 3 rage clicks, missing student_id): `HTTP 200 OK`, `semaforo: "ROJO"`, `id: 3`, `student_id: "estudiante_03"` (auto-generated).
  - `POST /api/telemetry` (Validation Failure - missing student_name): `HTTP 400 Bad Request`, `message: "Validation error: Missing required telemetry fields..."`.
  - `GET /api/telemetry` (Populated Store): `HTTP 200 OK`, `count: 3`, `data` array length 3.
  - `DELETE /api/telemetry` (Reset Store): `HTTP 200 OK`, `message: "Telemetry store reset successfully"`, `count: 0`.
  - `GET /api/telemetry` (After Reset): `HTTP 200 OK`, `count: 0`, `data: []`.
  - `GET /api/nonexistent`: `HTTP 404 Not Found`, `error: "API endpoint GET /api/nonexistent not found"`.
  - `GET /some/frontend/route`: `HTTP 200 OK`, serves `public/index.html` (SPA fallback).

---

## 2. Logic Chain

1. **Specification Alignment**:
   - `PROJECT.md` specifies three risk levels: 🟢 Verde (low completion time, 0 errors), 🟡 Amarillo (moderate completion time 25s-45s or 1-2 errors), 🔴 Rojo (high completion time >45s or >2 errors / high rage clicks).
   - Direct inspection of `calculateSemaforo` in `server.js` lines 24-36 demonstrates exact threshold enforcement: `errors > 2 || rageClicks > 2 || timeMs > 45000` triggers `ROJO`; `errors >= 1 || rageClicks >= 1 || timeMs > 25000` triggers `AMARILLO`; otherwise `VERDE`.
   - Verified via live test cases 2, 3, and 4 which produced `"VERDE"`, `"AMARILLO"`, and `"ROJO"` respectively matching inputs.

2. **Concurrency & Race Conditions**:
   - `server.js` uses synchronous in-memory JavaScript array operations (`telemetryStore.push(record)`).
   - In Node.js single-threaded event loop, synchronous route execution guarantees serial record assignment and insertion without thread race conditions.

3. **Memory Leaks & State Mutations**:
   - `telemetryStore` is an unbounded array in RAM (`let telemetryStore = []`). For an offline MVP demo app, this is in accordance with `PROJECT.md` design.
   - `DELETE /api/telemetry` re-assigns `telemetryStore = []`, allowing instant clearing of memory.
   - `GET /api/telemetry` serializes array to JSON string via Express `res.json()`, preventing client-side reference mutation of server memory.

4. **Headers & CORS Compliance**:
   - `app.use(cors())` is placed prior to all route handlers (`server.js` line 9), successfully injecting CORS headers (`Access-Control-Allow-Origin: *`) on all endpoints and handling HTTP OPTIONS preflight requests.

5. **Adversarial Integrity Check**:
   - Evaluated source code for hardcoded test results, facade implementations, or fake mocks.
   - Confirmed `server.js` contains a functional Express server backed by live logic and state storage. No integrity violations detected.

---

## 3. Caveats

- **Unbounded Memory Limit**: In-memory `telemetryStore` array will grow indefinitely if Millions of requests are sent without calling `DELETE`. For local classroom/demo deployment this is acceptable, but for long-term production a upper bound limit (e.g. `telemetryStore.slice(-1000)`) or persistent DB (SQLite) could be added.
- **Data Hygiene Edge Case (Minor Finding)**:
  - In `server.js` line 87: `rage_clicks: Number(rage_clicks || 0)`.
  - When `rage_clicks` is supplied as a non-numeric string (e.g. `"invalid"`), `rage_clicks || 0` evaluates to `"invalid"`, and `Number("invalid")` returns `NaN`. `JSON.stringify(NaN)` outputs `null` in the stored record (`"rage_clicks": null`).
  - *Mitigation Suggestion*: Change line 87 to `rage_clicks: Number(rage_clicks) || 0`.

---

## 4. Conclusion & Verdict

**Verdict**: **PASS**

**Rationale**:
Milestone 2 (Backend Server) is correctly implemented and fully functional. The `calculateSemaforo` risk rating algorithm correctly satisfies all requirements in `PROJECT.md` and `PRD_NOMAD_IA.md`. Live HTTP requests confirmed `POST /api/telemetry` insertion, auto-generation of defaults, input validation, `GET /api/telemetry` retrieval, and `DELETE /api/telemetry` store clearing. CORS headers, static file serving, and 404/fallback routing behave as expected.

---

## 5. Verification Method

To independently verify this report:

1. **Start Backend Server**:
   ```bash
   node server.js
   ```
2. **Execute Test Script**:
   ```bash
   node -e "
   const http = require('http');
   function req(method, path, body) {
     return new Promise((resolve) => {
       const payload = body ? JSON.stringify(body) : null;
       const r = http.request({ hostname: 'localhost', port: 3000, path, method, headers: payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {} }, res => {
         let d = ''; res.on('data', chunk => d += chunk);
         res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
       });
       if (payload) r.write(payload);
       r.end();
     });
   }
   async function test() {
     console.log('1. POST Verde:', await req('POST', '/api/telemetry', { student_name: 'Test', game_id: 'g1', time_elapsed_ms: 10000, errors_count: 0 }));
     console.log('2. GET All:', await req('GET', '/api/telemetry'));
     console.log('3. DELETE Clear:', await req('DELETE', '/api/telemetry'));
     console.log('4. GET Empty:', await req('GET', '/api/telemetry'));
   }
   test();
   "
   ```
3. **Invalidation Conditions**:
   - Any HTTP endpoint failing to respond with `200 OK` for valid payloads or `400 Bad Request` for invalid payloads.
   - Failure of `calculateSemaforo` to assign correct risk colors based on telemetry bounds.
