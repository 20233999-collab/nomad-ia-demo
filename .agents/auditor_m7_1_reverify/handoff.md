# Forensic Audit Report: Milestone 7 Re-verification (Final Integrity Audit)

**Work Product**: NOMAD-IA Core Monorepo (`server.js`, `verify.js`, `public/educar-ia/dashboard.js`, `public/aprender-ia/game.js`, `public/index.html`, `public/styles/mondrian.css`)  
**Profile**: General Project / Development & Demo Integrity Standards  
**Verdict**: **CLEAN**

---

## 1. Observation

### Source Code Analysis
1. **`server.js` (lines 24–36, 54–119)**:
   - `calculateSemaforo({ time_elapsed_ms, errors_count, rage_clicks })` dynamically classifies risk:
     - Returns `'ROJO'` when `errors > 1 || timeMs > 40000 || rage > 2`.
     - Returns `'AMARILLO'` when `errors === 1 || (timeMs >= 20000 && timeMs <= 40000)`.
     - Returns `'VERDE'` otherwise.
   - `POST /api/telemetry` validates missing fields (returning `400 Bad Request`) and negative numbers (`timeMs < 0 || errors < 0 || rage < 0`), dynamically appends incoming records to `telemetryStore`, and computes `semaforo` per payload.
   - `telemetryStore` is initialized as empty array `[]` (no pre-populated or static mocks).

2. **`verify.js` (lines 11–294)**:
   - Contains 9 programmatic E2E test cases using native standard `fetch` over HTTP to `http://localhost:3000`.
   - Test 1 (VERDE boundary): `time=19999, errors=0, rage=0` -> Asserts HTTP 200 and `semaforo === 'VERDE'`.
   - Test 2 (AMARILLO lower boundary): `time=20000, errors=0` -> Asserts HTTP 200 and `semaforo === 'AMARILLO'`.
   - Test 3 (AMARILLO upper boundary): `time=40000, errors=0` -> Asserts HTTP 200 and `semaforo === 'AMARILLO'`.
   - Test 4 (ROJO time boundary): `time=40001, errors=0` -> Asserts HTTP 200 and `semaforo === 'ROJO'`.
   - Test 5 (ROJO errors boundary): `errors=2, time=5000` -> Asserts HTTP 200 and `semaforo === 'ROJO'`.
   - Test 6 (ROJO rage clicks boundary): `rage=3` -> Asserts HTTP 200 and `semaforo === 'ROJO'`.
   - Test 7 (Validation Error 1 - Missing fields) -> Asserts HTTP 400.
   - Test 8 (Validation Error 2 - Negative values) -> Asserts HTTP 400 and error message.
   - Test 9 (GET Telemetry & Static Endpoints `/`, `/aprender-ia/`, `/educar-ia/`) -> Asserts HTTP 200 and array output.
   - Script exits cleanly with exit code 0 when all tests pass, or 1 if any assertion fails. No mock short-circuiting.

3. **`public/educar-ia/dashboard.js` (lines 61–207)**:
   - `fetchTelemetry()` makes live HTTP GET requests to `/api/telemetry`.
   - Auto-polling every 3000ms via `setInterval(fetchTelemetry, 3000)`.
   - Dynamically updates KPIs (total unique students, low/medium/high risk counters, average completion time) and renders table rows dynamically using HTML escaping.
   - Handles empty states and error states without hardcoded records.

4. **`public/aprender-ia/game.js` (lines 73–86, 251–310)**:
   - Tracks `startTime` dynamically with `Date.now()`.
   - Tracks `errorsCount` on incorrect option submissions.
   - Tracks `rageClicksCount` in real time using a 500ms sliding window click listener (`window.addEventListener('click', ...)`).
   - Posts telemetry payload asynchronously to `/api/telemetry` via HTTP `fetch` and dynamically displays badge returned by server (`data.data.semaforo`).

5. **`public/index.html` & `public/styles/mondrian.css`**:
   - Clean HTML structure and Mondrian design system CSS. No embedded fake telemetry data or test stubs.

---

## 2. Logic Chain

1. **Hardcoding & Facade Checks**:
   - Inspection of `server.js` and `verify.js` confirms zero static stubs, fixed hardcoded output arrays, or bypass logic.
   - `calculateSemaforo` relies strictly on computed numerical parameters.

2. **Empirical Behavioral Verification**:
   - Running `node verify.js` against the live backend server resulted in 9 out of 9 tests passing cleanly with HTTP 200/400 assertions confirmed.
   - Running an independent suite of 10 boundary tests directly against `/api/telemetry` confirmed exact boundary transitions:
     - `timeMs = 19999` -> `VERDE` (HTTP 200)
     - `timeMs = 20000` -> `AMARILLO` (HTTP 200)
     - `timeMs = 40000` -> `AMARILLO` (HTTP 200)
     - `timeMs = 40001` -> `ROJO` (HTTP 200)
     - `errors = 1` -> `AMARILLO` (HTTP 200)
     - `errors = 2` -> `ROJO` (HTTP 200)
     - `rage = 2` -> `VERDE` (HTTP 200)
     - `rage = 3` -> `ROJO` (HTTP 200)
     - `timeMs = -500` -> HTTP 400 (Negative numeric rejected)
     - `student_name = ''` -> HTTP 400 (Missing required field rejected)

3. **Frontend & Telemetry Integration Verification**:
   - `dashboard.js` fetches live backend data from `/api/telemetry`, dynamically computes KPIs, and renders filterable rows.
   - `game.js` captures user interactions dynamically, measures elapsed time, detects rage clicks, and sends real-time HTTP requests to record telemetry.

---

## 3. Caveats

- Tests assume the local Express backend server is running on `http://localhost:3000`.
- In-memory `telemetryStore` resets whenever the Node process restarts.

---

## 4. Conclusion

**VERDICT**: **CLEAN**

No integrity violations, fake test stubs, hardcoded test outputs, or facade implementations were detected in any of the audited files (`server.js`, `verify.js`, `public/educar-ia/dashboard.js`, `public/aprender-ia/game.js`, `public/index.html`, `public/styles/mondrian.css`). Dynamic Semáforo computation, real-time telemetry tracking, live dashboard polling, and programmatic E2E testing in `verify.js` operate with 100% authenticity.

---

## 5. Verification Method

To independently reproduce and verify this audit verdict, execute the following commands in terminal:

```bash
cd /home/laptop/Documentos/mvp-hackaton-minedu

# 1. Run the E2E verification test suite
node verify.js

# 2. Run independent cURL / Fetch boundary test
node -e "
async function test() {
  const tests = [
    { p: { student_name: 'A', game_id: 'G', time_elapsed_ms: 19999, errors_count: 0, rage_clicks: 0 }, expected: 'VERDE', status: 200 },
    { p: { student_name: 'B', game_id: 'G', time_elapsed_ms: 20000, errors_count: 0, rage_clicks: 0 }, expected: 'AMARILLO', status: 200 },
    { p: { student_name: 'C', game_id: 'G', time_elapsed_ms: 40000, errors_count: 0, rage_clicks: 0 }, expected: 'AMARILLO', status: 200 },
    { p: { student_name: 'D', game_id: 'G', time_elapsed_ms: 40001, errors_count: 0, rage_clicks: 0 }, expected: 'ROJO', status: 200 },
    { p: { student_name: 'E', game_id: 'G', time_elapsed_ms: 1000, errors_count: 1, rage_clicks: 0 }, expected: 'AMARILLO', status: 200 },
    { p: { student_name: 'F', game_id: 'G', time_elapsed_ms: 1000, errors_count: 2, rage_clicks: 0 }, expected: 'ROJO', status: 200 },
    { p: { student_name: 'G', game_id: 'G', time_elapsed_ms: 1000, errors_count: 0, rage_clicks: 2 }, expected: 'VERDE', status: 200 },
    { p: { student_name: 'H', game_id: 'G', time_elapsed_ms: 1000, errors_count: 0, rage_clicks: 3 }, expected: 'ROJO', status: 200 },
    { p: { student_name: 'I', game_id: 'G', time_elapsed_ms: -500, errors_count: 0 }, expectedError: 'Numeric fields cannot be negative', status: 400 },
    { p: { student_name: '', game_id: 'G', time_elapsed_ms: 100, errors_count: 0 }, status: 400 }
  ];

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const res = await fetch('http://localhost:3000/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t.p)
    });
    const data = await res.json();
    if (res.status !== t.status) throw new Error('Status mismatch in case ' + (i+1));
    if (t.expected && data.data.semaforo !== t.expected) throw new Error('Semaforo mismatch in case ' + (i+1));
  }
  console.log('ALL INDEPENDENT BOUNDARY TESTS PASSED!');
}
test().catch(e => { console.error(e); process.exit(1); });
"
```
