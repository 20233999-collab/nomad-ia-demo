# Handoff Report — Challenger 1 (Milestone 2 Backend & Telemetry Stress Testing)

## 1. Observation
Empirical stress tests were performed on the running Node.js Express server (`server.js` listening on `http://localhost:3000`) using automated Node.js test harness `/tmp/stress_test.js`.

### A. Semáforo Calculation & Boundary Testing
- Tested `time_elapsed_ms` values: `0`, `24999`, `25000`, `25001`, `44999`, `45000`, `45001`.
  - Results:
    - `0`ms .. `25000`ms -> `VERDE` (100% PASS)
    - `25001`ms .. `45000`ms -> `AMARILLO` (100% PASS)
    - `45001`ms+ -> `ROJO` (100% PASS)
- Tested `errors_count` values: `0`, `1`, `2`, `3`, `100`.
  - Results:
    - `0` errors -> `VERDE` (100% PASS)
    - `1`, `2` errors -> `AMARILLO` (100% PASS)
    - `3`, `100` errors -> `ROJO` (100% PASS)
- Tested `rage_clicks` values: `0`, `1`, `2`, `3`, `50`.
  - Results:
    - `0` rage clicks -> `VERDE` (100% PASS)
    - `1`, `2` rage clicks -> `AMARILLO` (100% PASS)
    - `3`, `50` rage clicks -> `ROJO` (100% PASS)
- All 20 boundary matrix test cases passed with 100% accuracy matching `server.js:24-36` business rules.

### B. High-Volume Concurrency & Stability
- Executed 600 simultaneous concurrent HTTP requests (500 POST requests + 100 GET requests) via `Promise.all`.
- Command run: `node /tmp/stress_test.js`
- Test Output metrics:
  ```json
  {
    "totalPosts": 500,
    "totalGets": 100,
    "durationMs": 513,
    "reqPerSec": 1169.59,
    "post200Count": 500,
    "get200Count": 100,
    "finalStoreCount": 500,
    "hasDuplicateIds": false
  }
  ```
- **0 dropped requests** (500/500 POST 200 OK, 100/100 GET 200 OK).
- **0 duplicate record IDs** generated during concurrent writes (`server.js:79`).
- Throughput: **1,169.59 requests per second**.

### C. Malformed Payload & Input Validation Edge Cases
1. **Missing / Empty Required Fields**:
   - `student_name`, `game_id`, `time_elapsed_ms`, `errors_count` missing or whitespace-only -> Returns `HTTP 400 Bad Request` (`server.js:67-77`). (PASS)
2. **Stringified Numbers**:
   - `time_elapsed_ms: "15000"`, `errors_count: "1"` -> Parsed via `Number()` successfully, returns `HTTP 200 OK` and correctly assigns `AMARILLO`. (PASS)
3. **Invalid Data Types / Type Coercion Findings**:
   - `student_name: {}` (Object): `String({})` yields `"[object Object]"` which passes `String(student_name).trim() !== ''` check (`server.js:68`). Returns `HTTP 200 OK` saving `student_name: "[object Object]"`. (VULNERABILITY / EDGE CASE)
   - Negative numeric inputs (`time_elapsed_ms: -5000`, `errors_count: -5`): `isNaN(Number(-5000))` is `false`. Server stores negative values and classifies as `VERDE`. (EDGE CASE)
   - `rage_clicks: "xyz"`: `rage_clicks` is not in mandatory validation checks. `record.rage_clicks = Number("xyz")` results in `NaN`, which serializes as `null` in JSON output (`"rage_clicks": null`). (EDGE CASE)
4. **Error Handling Status Codes**:
   - Malformed JSON body (syntax error in POST request): Caught by Express global error handler (`server.js:128-134`) returning `HTTP 500` instead of standard `HTTP 400 Bad Request`.
   - Oversized JSON body (>100KB Express default body limit): Express throws `PayloadTooLargeError`, caught by global error handler returning `HTTP 500` instead of `HTTP 413 Payload Too Large`.

---

## 2. Logic Chain

1. **Semáforo Accuracy**:
   - `calculateSemaforo` in `server.js:24-36` evaluates thresholds:
     - `errors > 2 || rageClicks > 2 || timeMs > 45000` -> `ROJO`
     - `errors >= 1 || rageClicks >= 1 || timeMs > 25000` -> `AMARILLO`
     - Else -> `VERDE`
   - Empirical boundary tests evaluated exact transition points:
     - `time_elapsed_ms` at `25000` is `VERDE` (`25000 > 25000` is false). `25001` is `AMARILLO`.
     - `time_elapsed_ms` at `45000` is `AMARILLO` (`45000 > 45000` is false). `45001` is `ROJO`.
     - `errors_count` at `0` is `VERDE`, `1` and `2` are `AMARILLO`, `3` is `ROJO`.
     - `rage_clicks` at `0` is `VERDE`, `1` and `2` are `AMARILLO`, `3` is `ROJO`.
   - Empirical output in `/tmp/stress_results.json` proves 100% strict compliance with specified logic.

2. **Concurrency Safety**:
   - Synchronous execution of Express route handlers in Node's single-threaded event loop ensures `telemetryStore.push(record)` and `telemetryStore.length + 1` execute atomically per event tick.
   - Empirical test submitting 500 concurrent POSTs verified 500 unique incremental IDs (`1` to `500`), 0 race conditions, 0 dropped requests, and sustained >1,100 req/sec performance.

3. **Input Validation Deficiencies**:
   - Validation block in `server.js:67-77` uses `String(val).trim() === ''`. For objects (`{}`), JS string conversion produces `"[object Object]"` which is non-empty, bypassing validation.
   - Negative values pass `isNaN(Number(x))` check because negative numbers are valid numbers in JS, but invalid domain values for time/error counters.
   - Express JSON parsing errors pass through to the global error handler (`server.js:128`), which returns HTTP 500 because it lacks custom handling for `SyntaxError` / `entity.too.large`.

---

## 3. Caveats
- Storage is currently in-memory (`telemetryStore = []`). Memory usage under millions of records over extended operational periods was not tested, as in-memory array resets on server restart as designed for this offline MVP.
- Network bandwidth throttling was not simulated (local loopback `localhost:3000` used).

---

## 4. Conclusion
The backend server (`server.js`) is **STABLE**, **HIGHLY PERFORMANT** (>1,100 req/sec under heavy concurrency), and **100% ACCURATE** in its Semáforo risk classification calculations across all boundary conditions.

### Minor Recommended Fixes for Implementation Team:
1. **Validate JSON Body Errors**: Add explicit check in global error handler (`server.js:128`) for `err.type === 'entity.too.large'` (return 413) and `err instanceof SyntaxError` (return 400).
2. **Strict Type & Boundary Validation**:
   - Ensure `typeof student_name === 'string'` to prevent `{}` object coercion.
   - Enforce non-negative checks: `time_elapsed_ms >= 0`, `errors_count >= 0`, `rage_clicks >= 0`.
   - Fallback `rage_clicks` parsing: `const rage = Number(rage_clicks); const safeRage = isNaN(rage) || rage < 0 ? 0 : rage;`.

---

## 5. Verification Method
To independently reproduce and verify these findings:

1. **Start/Ensure Server is Running**:
   ```bash
   node server.js
   ```
2. **Execute Empirical Stress Test Harness**:
   ```bash
   node /tmp/stress_test.js
   ```
3. **Inspect Output JSON**:
   ```bash
   cat /tmp/stress_results.json
   ```
4. **Invalidation Condition**:
   - Any boundary condition returning incorrect `semaforo` value.
   - Any HTTP POST failure or duplicate ID under 500 concurrent requests.
