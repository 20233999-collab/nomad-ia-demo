# Milestone 7 Handoff & Review Report — Backend & Telemetry E2E Review

**Reviewer**: Reviewer 2 (Milestone 7 - Final End-to-End System Review)  
**Working Directory**: `/home/laptop/Documentos/mvp-hackaton-minedu/.agents/reviewer_m7_2`  
**Project Root**: `/home/laptop/Documentos/mvp-hackaton-minedu`  
**Date**: 2026-07-24T04:23:45Z  

---

## Review Summary

**Verdict**: **FAIL / REQUEST_CHANGES**

The Node.js backend server (`server.js`) successfully sets up Express middleware, CORS, and static file serving. However, it contains **critical logic defects in the Semáforo risk classification algorithm** (`calculateSemaforo`) that violate the product specifications. Furthermore, `verify.js` suffers from **incomplete test coverage** and masks these backend defects by using extreme inputs without testing boundary values or the AMARILLO classification state.

---

## 1. Observation

### Observation 1: Semáforo Risk Classification Threshold Mismatch in `server.js`
In `server.js` (lines 24-36):
```javascript
24: function calculateSemaforo(data) {
25:   const errors = Number(data.errors_count) || 0;
26:   const rageClicks = Number(data.rage_clicks) || 0;
27:   const timeMs = Number(data.time_elapsed_ms) || 0;
28: 
29:   if (errors > 2 || rageClicks > 2 || timeMs > 45000) {
30:     return 'ROJO';
31:   }
32:   if (errors >= 1 || rageClicks >= 1 || timeMs > 25000) {
33:     return 'AMARILLO';
34:   }
35:   return 'VERDE';
36: }
```
**Specification Requirements vs. Implementation**:
- **VERDE Spec**: `errors == 0 AND time < 20000 AND rage_clicks == 0`
- **AMARILLO Spec**: `errors == 1 OR (time >= 20000 AND time <= 40000)`
- **ROJO Spec**: `errors > 1 OR time > 40000 OR rage_clicks > 2`

**Empirical Execution Results** (via `node -e` test against `http://localhost:3000/api/telemetry`):
- Test Case 1: `{ errors_count: 2, time_elapsed_ms: 10000, rage_clicks: 0 }`
  - Expected: `ROJO` (since `errors > 1`)
  - Returned: `AMARILLO` ❌ **FAIL** (`errors > 2` evaluated to false; `errors >= 1` evaluated to true)
- Test Case 2: `{ errors_count: 0, time_elapsed_ms: 42000, rage_clicks: 0 }`
  - Expected: `ROJO` (since `time > 40000`)
  - Returned: `AMARILLO` ❌ **FAIL** (`timeMs > 45000` evaluated to false; `timeMs > 25000` evaluated to true)
- Test Case 3: `{ errors_count: 0, time_elapsed_ms: 22000, rage_clicks: 0 }`
  - Expected: `AMARILLO` (since `20000 <= time <= 40000`)
  - Returned: `VERDE` ❌ **FAIL** (`timeMs > 25000` evaluated to false; fell through to `VERDE`)

### Observation 2: Incomplete & Self-Certifying Test Logic in `verify.js`
In `verify.js` (lines 28-94):
- Test 1 tests `time_elapsed_ms: 12000, errors_count: 0, rage_clicks: 0` (expects VERDE).
- Test 2 tests `time_elapsed_ms: 45000, errors_count: 3, rage_clicks: 4` (expects ROJO).
- No test exists for `AMARILLO`.
- No test exists for boundary values (`errors = 2`, `time = 20000..25000`, `time = 40000..45000`).
- No test exists for POST `/api/telemetry` payload validation errors (HTTP 400).
- No test exists for API 404 handling or `DELETE /api/telemetry`.

Because Test 2 uses `errors_count: 3` and `rage_clicks: 4`, `verify.js` passes despite `server.js` failing on all boundary conditions.

---

## 2. Logic Chain

1. **Step 1**: The project requirements mandate specific boundary rules for early warning risk classification (Semáforo):
   - `ROJO`: `errors > 1` (>=2 errors), `time > 40000` (>40 seconds), or `rage_clicks > 2` (>=3 clicks).
   - `AMARILLO`: `errors == 1` or `20000 <= time <= 40000`.
   - `VERDE`: `errors == 0`, `time < 20000`, and `rage_clicks == 0`.
2. **Step 2**: Direct inspection of `server.js` line 29 shows `if (errors > 2 || rageClicks > 2 || timeMs > 45000)` and line 32 shows `if (errors >= 1 || rageClicks >= 1 || timeMs > 25000)`.
3. **Step 3**: This produces three distinct classification errors:
   - Students with 2 errors are misclassified as AMARILLO instead of ROJO.
   - Students taking 41–45 seconds are misclassified as AMARILLO instead of ROJO.
   - Students taking 20–25 seconds are misclassified as VERDE instead of AMARILLO.
4. **Step 4**: `verify.js` only tests extreme values (0 errors / 12s vs 3 errors / 45s / 4 rage clicks), failing to exercise boundary conditions or the AMARILLO state.
5. **Conclusion**: `server.js` fails the Semáforo algorithm specification and `verify.js` fails the test completeness criteria.

---

## 3. Findings

### [Critical] Finding 1: Incorrect Semáforo Risk Classification Algorithm
- **Location**: `server.js`, lines 24–36 (`calculateSemaforo`)
- **Problem**:
  - `errors > 2` used instead of `errors > 1` for ROJO.
  - `timeMs > 45000` used instead of `timeMs > 40000` for ROJO.
  - `timeMs > 25000` used instead of `timeMs >= 20000` for AMARILLO.
- **Why**: Early warning intervention for struggling students will fail to trigger when a student makes 2 errors or takes >40 seconds, misclassifying high-risk students as medium-risk, and medium-risk students (20–25s) as low-risk.
- **Suggested Fix**:
  Update `calculateSemaforo(data)` in `server.js`:
  ```javascript
  function calculateSemaforo(data) {
    const errors = Number(data.errors_count) || 0;
    const rageClicks = Number(data.rage_clicks) || 0;
    const timeMs = Number(data.time_elapsed_ms) || 0;

    if (errors > 1 || timeMs > 40000 || rageClicks > 2) {
      return 'ROJO';
    }
    if (errors === 1 || (timeMs >= 20000 && timeMs <= 40000)) {
      return 'AMARILLO';
    }
    return 'VERDE';
  }
  ```

### [Major] Finding 2: Incomplete Test Suite & Self-Certifying Test Selection (`verify.js`)
- **Location**: `verify.js`, lines 26–94
- **Problem**: `verify.js` does not test AMARILLO telemetry payloads, boundary inputs (`errors: 2`, `time: 20000`, `time: 40000`), or validation failure cases (HTTP 400).
- **Why**: Allows defective business logic to pass verification silently.
- **Suggested Fix**: Expand `verify.js` with tests for:
  - AMARILLO classification (`errors: 1` or `time: 25000`).
  - ROJO boundary conditions (`errors: 2` or `time: 40001`).
  - VERDE upper boundary (`time: 19999`).
  - HTTP 400 validation error responses for missing required fields.

---

## 4. Verified Claims

- Express server configuration & static files (`express.json()`, `express.static('public')`, CORS): **VERIFIED (PASS)**
- GET `/api/telemetry` data structure compliance (`{ success: true, count: N, data: [...] }`): **VERIFIED (PASS)**
- POST `/api/telemetry` data structure compliance (`{ success: true, message: "...", data: {...} }`): **VERIFIED (PASS)**
- Error handling (Global 500 handler & API 404 handler): **VERIFIED (PASS)**
- Semáforo algorithm logic for extreme values: **VERIFIED (FAIL on boundaries)**
- `verify.js` test coverage: **VERIFIED (FAIL - incomplete)**

---

## 5. Coverage Gaps & Unverified Items

- **No caveats**. All components requested in the prompt were inspected, executed, and empirically verified.

---

## 6. Verification Method

To independently reproduce and verify this review:

1. **Verify Backend Execution & Algorithmic Bug**:
   Start server: `node server.js`
   Run test payload script:
   ```bash
   node -e '
   async function test() {
     const res = await fetch("http://localhost:3000/api/telemetry", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ student_name: "Test", game_id: "g1", time_elapsed_ms: 10000, errors_count: 2 })
     });
     const json = await res.json();
     console.log("Returned semaforo:", json.data.semaforo);
   }
   test();
   '
   ```
   **Invalidation Condition**: If `json.data.semaforo` returns `AMARILLO` instead of `ROJO`, the algorithm is defective.

2. **Verify Test Script Incompleteness**:
   Inspect `verify.js`. Check that no test exists for `AMARILLO` state or `errors_count: 2`.
