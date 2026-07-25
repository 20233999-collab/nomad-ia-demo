# Handoff Report — Challenger 2 (Milestone 7: Adversarial Edge Case & Security Tester)

**Working Directory**: `/home/laptop/Documentos/mvp-hackaton-minedu/.agents/challenger_m7_2`  
**Project Root**: `/home/laptop/Documentos/mvp-hackaton-minedu`  
**Date**: 2026-07-23  
**Final Verdict**: **FAIL** (18/22 tests passed, 4 test failures identified)

---

## Challenge Summary

**Overall risk assessment**: **MEDIUM**

An empirical adversarial test suite of 22 automated test cases was executed against the NOMAD-IA Demo Hub application (`server.js`). While static file serving, CORS preflight, 404 error routing, and basic missing/invalid payload validations passed, four significant edge-case and boundary vulnerabilities were discovered.

---

## 1. Observation

Directly observed results from executing `/home/laptop/Documentos/mvp-hackaton-minedu/.agents/challenger_m7_2/test_harness.py`:

- **Observation 1 (Negative Elapsed Time Validation)**:
  Sending `POST /api/telemetry` with `{"student_name": "Test", "game_id": "game1", "time_elapsed_ms": -100, "errors_count": 0}` returned HTTP `200 OK` with response:
  ```json
  {"success":true,"message":"Telemetry recorded successfully","data":{"id":1,"student_name":"Test","game_id":"game1","time_elapsed_ms":-100,"errors_count":0,"rage_clicks":0,"status":"completed","semaforo":"VERDE"}}
  ```
  Code in `/home/laptop/Documentos/mvp-hackaton-minedu/server.js` (lines 67-77):
  ```javascript
  if (
    student_name === undefined || student_name === null || String(student_name).trim() === '' ||
    game_id === undefined || game_id === null || String(game_id).trim() === '' ||
    time_elapsed_ms === undefined || time_elapsed_ms === null || isNaN(Number(time_elapsed_ms)) ||
    errors_count === undefined || errors_count === null || isNaN(Number(errors_count))
  ) { ... }
  ```

- **Observation 2 (Oversized Payload HTTP Status)**:
  Sending `POST /api/telemetry` with a ~120KB payload (`student_name` string of 120,000 characters) returned HTTP `500 Internal Server Error` with body:
  ```json
  {"success":false,"error":"request entity too large"}
  ```
  The server process did not crash (`Server Alive = True`), but returned status code `500` instead of `400 Bad Request` or `413 Payload Too Large`.
  Code in `/home/laptop/Documentos/mvp-hackaton-minedu/server.js` (lines 128-134):
  ```javascript
  app.use((err, req, res, next) => {
    console.error('[Server Error]:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  });
  ```

- **Observation 3 (Semáforo Boundary 20000ms)**:
  Sending `POST /api/telemetry` with `time_elapsed_ms: 20000`, `errors_count: 0`, `rage_clicks: 0` returned `semaforo: "VERDE"`. Specification expected `AMARILLO` (threshold >= 20000ms).
  Code in `/home/laptop/Documentos/mvp-hackaton-minedu/server.js` (lines 29-35):
  ```javascript
  if (errors >= 1 || rageClicks >= 1 || timeMs > 25000) {
    return 'AMARILLO';
  }
  ```

- **Observation 4 (Semáforo Boundary 40001ms)**:
  Sending `POST /api/telemetry` with `time_elapsed_ms: 40001`, `errors_count: 0`, `rage_clicks: 0` returned `semaforo: "AMARILLO"`. Specification expected `ROJO` (threshold > 40000ms).
  Code in `/home/laptop/Documentos/mvp-hackaton-minedu/server.js` (lines 29-31):
  ```javascript
  if (errors > 2 || rageClicks > 2 || timeMs > 45000) {
    return 'ROJO';
  }
  ```

- **Observation 5 (Passed Test Areas)**:
  - Missing fields (`student_name`, `game_id`, `time_elapsed_ms`, `errors_count`) -> HTTP `400 Bad Request`.
  - Non-numeric string data types (`"not_a_number"` for numbers) -> HTTP `400 Bad Request`.
  - Empty JSON payload `{}` -> HTTP `400 Bad Request`.
  - OPTIONS preflight (`OPTIONS /api/telemetry`) -> HTTP `204` with CORS header `Access-Control-Allow-Origin: *`.
  - Non-existent API endpoints (`GET /api/nonexistent`, `POST /api/unknown`) -> HTTP `404 JSON`.
  - `rage_clicks` 2 vs 3 -> `rage_clicks: 2` returns `AMARILLO`, `rage_clicks: 3` returns `ROJO`.
  - Static file serving -> `/styles/mondrian.css` (200, `text/css`), `/aprender-ia/game.js` (200, `application/javascript`), `/educar-ia/dashboard.js` (200, `application/javascript`), `/index.html` (200, `text/html`).

---

## 2. Logic Chain

1. **Negative Time Acceptance**:
   - `isNaN(Number(-100))` evaluates to `false` in JavaScript.
   - Because `server.js` lines 67-77 only check `isNaN()`, negative values pass validation.
   - `calculateSemaforo` evaluates `-100 > 25000` (`false`) and `-100 > 45000` (`false`), defaulting to `VERDE`.
   - Therefore, client applications can persist physically impossible negative elapsed times.

2. **Oversized Body HTTP Status Code**:
   - `express.json()` default payload limit is 100KB. When exceeded, `body-parser` creates a `PayloadTooLargeError` with `err.status = 413`.
   - In `server.js` lines 128-134, the global error middleware ignores `err.status` or `err.statusCode` and hardcodes `res.status(500)`.
   - Therefore, client errors (oversized requests) are misreported as internal server failures (500), breaking RFC 7231 HTTP status semantics.

3. **Semáforo Boundary Threshold Discrepancy (20000ms & 40001ms)**:
   - The project specification defines the boundary logic as:
     - < 20000ms: `VERDE`
     - 20000ms – 40000ms: `AMARILLO`
     - > 40000ms: `ROJO`
   - However, `server.js` hardcodes `25000` (line 32) and `45000` (line 29).
   - As a result:
     - 20000ms returns `VERDE` instead of `AMARILLO`.
     - 40001ms returns `AMARILLO` instead of `ROJO`.
   - Therefore, students taking 20–25s or 40–45s are classified into lower risk categories than specified.

---

## 3. Challenges

### [Medium] Challenge 1: Negative Numerical Telemetry Validation Missing
- **Assumption challenged**: Telemetry payload inputs are bounded positive physical quantities.
- **Attack scenario**: Sending negative time (`time_elapsed_ms: -100`) or negative errors (`errors_count: -5`).
- **Blast radius**: Low/Medium — corrupts telemetry metrics and dashboard analytics.
- **Mitigation**: Update `server.js` payload validation to require `Number(time_elapsed_ms) >= 0` and `Number(errors_count) >= 0`.

### [Medium] Challenge 2: Global Error Handler Hardcodes HTTP 500
- **Assumption challenged**: Express global error handler respects error status codes generated by middleware.
- **Attack scenario**: Submitting payloads larger than 100KB (`>100KB`).
- **Blast radius**: Low — client receives HTTP 500 error instead of 413 Payload Too Large / 400 Bad Request.
- **Mitigation**: Update error middleware in `server.js`: `res.status(err.status || err.statusCode || 500).json(...)`.

### [High] Challenge 3: Semáforo Time Boundary Threshold Mismatch (20000ms & 40001ms)
- **Assumption challenged**: `calculateSemaforo` matches the specified 20s and 40s cognitive risk thresholds.
- **Attack scenario**: Student elapsed time is exactly 20000ms (should trigger `AMARILLO`) or 40001ms (should trigger `ROJO`).
- **Blast radius**: High — direct failure of core business logic for pedagogical risk detection.
- **Mitigation**: Update `calculateSemaforo` in `server.js`:
  ```javascript
  if (errors > 2 || rageClicks > 2 || timeMs > 40000) {
    return 'ROJO';
  }
  if (errors >= 1 || rageClicks >= 1 || timeMs >= 20000) {
    return 'AMARILLO';
  }
  return 'VERDE';
  ```

---

## 4. Stress Test Results

| Test Scenario | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|
| Missing `student_name` | 400 Bad Request | 400 Bad Request | PASS |
| Missing `game_id` | 400 Bad Request | 400 Bad Request | PASS |
| Missing `time_elapsed_ms` | 400 Bad Request | 400 Bad Request | PASS |
| Missing `errors_count` | 400 Bad Request | 400 Bad Request | PASS |
| Invalid string for `time_elapsed_ms` (`"not_a_number"`) | 400 Bad Request | 400 Bad Request | PASS |
| Invalid string for `errors_count` (`"invalid_err"`) | 400 Bad Request | 400 Bad Request | PASS |
| Negative `time_elapsed_ms` (`-100`) | 400 Bad Request | 200 OK (`semaforo: VERDE`) | **FAIL** |
| Empty JSON payload (`{}`) | 400 Bad Request | 400 Bad Request | PASS |
| Oversized body (`~120KB`) | 400/413 Bad Request, Server Alive | 500 Error, Server Alive | **FAIL** |
| Preflight `OPTIONS /api/telemetry` | 200/204 with CORS header | 204 with CORS header | PASS |
| Non-existent route `GET /api/nonexistent` | 404 JSON | 404 JSON | PASS |
| Non-existent route `POST /api/unknown` | 404 JSON | 404 JSON | PASS |
| Semáforo 19999ms | `VERDE` | `VERDE` | PASS |
| Semáforo 20000ms | `AMARILLO` | `VERDE` | **FAIL** |
| Semáforo 40000ms | `AMARILLO` | `AMARILLO` | PASS |
| Semáforo 40001ms | `ROJO` | `AMARILLO` | **FAIL** |
| Semáforo `rage_clicks` 2 | `AMARILLO` | `AMARILLO` | PASS |
| Semáforo `rage_clicks` 3 | `ROJO` | `ROJO` | PASS |
| Static `/styles/mondrian.css` | 200 OK, `text/css` | 200 OK, `text/css; charset=UTF-8` | PASS |
| Static `/aprender-ia/game.js` | 200 OK, `application/javascript` | 200 OK, `application/javascript; charset=UTF-8` | PASS |
| Static `/educar-ia/dashboard.js` | 200 OK, `application/javascript` | 200 OK, `application/javascript; charset=UTF-8` | PASS |
| Static `/index.html` | 200 OK, `text/html` | 200 OK, `text/html; charset=UTF-8` | PASS |

---

## 5. Caveats

- **Load / Rate Limiting**: Concurrent stress testing (e.g. 1000 requests/sec) was not performed as it was out of scope for single-instance edge case verification.
- **No code modifications**: In accordance with the EMPIRICAL CHALLENGER role constraints, no changes were made to `server.js`.

---

## 6. Conclusion

The NOMAD-IA Demo Hub application successfully serves static assets, enforces CORS, handles missing/invalid telemetry fields, and routes 404 API requests correctly. However, the evaluation verdict is **FAIL** due to four failing edge cases:
1. Negative time values are accepted (`200 OK`).
2. Oversized payloads return `500` instead of `413` or `400`.
3. 20000ms threshold returns `VERDE` instead of `AMARILLO`.
4. 40001ms threshold returns `AMARILLO` instead of `ROJO`.

---

## 7. Verification Method

To independently reproduce and verify these findings:

```bash
# Run the adversarial test harness
python3 /home/laptop/Documentos/mvp-hackaton-minedu/.agents/challenger_m7_2/test_harness.py
```

**Expected output**:
```
TEST HARNESS SUMMARY: Total=22, Passed=18, Failed=4
```

**Invalidation conditions**:
If developers fix `server.js` (adding negative value check, handling `err.status` in error middleware, and updating semáforo thresholds to 20000/40000), re-running the test harness will yield `Passed=22, Failed=0`.
