# Review & Adversarial Audit Report — Milestone 4 (AprenderIA Telemetry & Integration)

**Reviewer**: Reviewer 2 (Critic & Quality Reviewer)  
**Date**: 2026-07-24  
**Target Files**: `public/aprender-ia/game.js`, `server.js`, `public/aprender-ia/index.html`  
**Verdict**: **FAIL / REQUEST_CHANGES**

---

## 1. Observation

### Observation 1.1: Telemetry Calculation & Async POST Submit in `public/aprender-ia/game.js`
- `time_elapsed_ms`: Line 92 initializes `startTime = Date.now();`. Line 255 computes `const timeElapsedMs = Math.max(1000, Date.now() - startTime);`.
- `errors_count`: Line 199 increments `errorsCount++` inside `handleSubmitAnswer()` when `selectedOption !== step.correctOption`.
- Timestamp: Line 267 sets `timestamp: new Date().toISOString()`.
- Async Submit: Lines 285–312 execute `fetch('/api/telemetry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })` in an asynchronous background promise.

### Observation 1.2: Rage Click Tracking & Event Propagation Interception (MAJOR DEFECT)
- `initRageClickTracker()` (lines 73–86) registers a `click` event listener on `window`:
  ```javascript
  73: function initRageClickTracker() {
  74:   window.addEventListener('click', () => {
  75:     const now = Date.now();
  76:     clickHistory.push(now);
  77:     // Keep only clicks within last 500ms
  78:     clickHistory = clickHistory.filter(t => now - t <= 500);
  79:     
  80:     if (clickHistory.length >= 3) {
  81:       rageClicksCount++;
  82:       clickHistory = []; // Reset window after recording a rage click event
  83:       showTutorCalmFeedback();
  84:     }
  85:   });
  86: }
  ```
- **However**, option tile creation in `loadStep()` (line 131) and button click handlers (lines 162 & 167) explicitly invoke `e.stopPropagation()`:
  ```javascript
  131: e.stopPropagation(); // prevent window rage click triggers on normal tiles if clicking fast
  ...
  162: e.stopPropagation();
  ...
  167: e.stopPropagation();
  ```
- Automated testing in Node/DOM mock confirmed:
  - 5 rapid clicks (<100ms) on `.game-tile` resulting `rageClicksCount`: `0`.
  - 5 rapid clicks (<100ms) on `#btn-submit` resulting `rageClicksCount`: `0`.
  - 5 rapid clicks (<100ms) on non-interactive window background resulting `rageClicksCount`: `1`.

### Observation 1.3: Backend Persistence & Retrieval (`server.js`)
- `POST /api/telemetry` (lines 54–100): Validates required fields (`student_name`, `game_id`, `time_elapsed_ms`, `errors_count`), assigns unique ID, calculates Semáforo classification (`calculateSemaforo`), and appends to in-memory array `telemetryStore`.
- `GET /api/telemetry` (lines 43–49): Returns HTTP 200 with `{ success: true, count: N, data: [...] }`.
- Execution test via Node HTTP server verified `POST` successfully stores record and subsequent `GET` retrieves full telemetry payload.

---

## 2. Logic Chain

1. **Rage Click Telemetry Intent**: Cognitive telemetry tracks user frustration (rage clicks) when a student repeatedly and rapidly clicks interactive controls (option tiles or submit buttons) due to confusion or failure.
2. **Impact of Event Interception**: Calling `e.stopPropagation()` on `.game-tile` elements and `#btn-submit` prevents `click` events from bubbling to `window`.
3. **Telemetry Failure**: Because `initRageClickTracker` listens solely on `window`, rapid repeated clicks on game tiles or submit buttons never reach the tracker. `rage_clicks` remains 0 even if a student clicks an option tile 10 times in half a second.
4. **Conclusion**: Rage click calculation is effectively neutralized for all core game interactions, causing inaccurate/false telemetry payloads to be sent to the backend.

---

## 3. Caveats

- **No Caveats**: All core game files, telemetry payload generation, backend server routes, and event propagation behaviors were directly inspected and programmatically executed.

---

## 4. Conclusion & Findings

### Findings Summary

| Severity | Category | Description | Location |
|---|---|---|---|
| **MAJOR** | Defect / Telemetry | `e.stopPropagation()` on tiles and submit buttons prevents rage clicks from reaching `window` listener. Rage click telemetry fails on primary game elements. | `public/aprender-ia/game.js`:131, 162 |
| **PASS** | Telemetry Logic | `time_elapsed_ms`, `errors_count`, and ISO timestamps are computed correctly. | `public/aprender-ia/game.js`:255–268 |
| **PASS** | Completion Flow | Silent async POST submit to `/api/telemetry` works as expected with proper offline fallback. | `public/aprender-ia/game.js`:285–312 |
| **PASS** | Backend Endpoint | `POST /api/telemetry` stores telemetry and `GET /api/telemetry` correctly retrieves all records. | `server.js`:43–100 |

### Recommended Action for Implementation Team
Remove `e.stopPropagation()` from tile click handlers (`game.js:131`) and button click handlers (`game.js:162`), OR attach the rage click listener at a level that captures tile/button events (e.g. delegated listener or document-level capturing phase `window.addEventListener('click', fn, true)`).

---

## 5. Verification Method

### Test Command 1: Backend Storage & Retrieval Verification
Run the following node command from project root:
```bash
node -e "
const app = require('./server.js');
const http = require('http');
const server = http.createServer(app);
server.listen(0, async () => {
  const port = server.address().port;
  const postRes = await fetch(\`http://localhost:\${port}/api/telemetry\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: 'est_test',
      student_name: 'Mateo Rossi',
      game_id: 'aprender_ia_steam',
      time_elapsed_ms: 12000,
      errors_count: 1,
      rage_clicks: 0,
      status: 'completed',
      timestamp: new Date().toISOString()
    })
  });
  const getRes = await fetch(\`http://localhost:\${port}/api/telemetry\`);
  const getJson = await getRes.json();
  console.log('GET count:', getJson.count);
  server.close();
});
"
```
*Expected Output*: `GET count: 1`

### Test Command 2: Rage Click Event Suppression Demonstration
```bash
node -e "
const fs = require('fs');
let code = fs.readFileSync('public/aprender-ia/game.js', 'utf8');
console.log('Contains stopPropagation on tiles:', code.includes('e.stopPropagation(); // prevent window rage click'));
"
```
*Expected Output*: `true`

---
*Report compiled by Reviewer 2 for M4 Telemetry Audit.*
