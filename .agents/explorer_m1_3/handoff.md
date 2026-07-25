# Handoff Report: Telemetry Data Flow, Semáforo Classification & Verification Specs

**Agent**: Explorer 3 (Milestone 1)  
**Working Directory**: `/home/laptop/Documentos/mvp-hackaton-minedu/.agents/explorer_m1_3`  
**Target Milestone**: Milestone 1 (Exploration & Specifications)  
**Date**: 2026-07-24  

---

## 1. Observation

Direct evidence inspected from project specification documents:

### A. From `PROJECT.md` (`/home/laptop/Documentos/mvp-hackaton-minedu/.agents/orchestrator/PROJECT.md`):
- **Lines 10-12**: "`POST /api/telemetry`: Endpoint receiving JSON telemetry payloads from AprenderIA minigame. `GET /api/telemetry`: Endpoint returning stored telemetry records for EducarIA dashboard. In-memory array storage for telemetry data (`[]`)."
- **Lines 20-23**: "AprenderIA Minigame Prototype... 2 interactive STEAM quiz/puzzle interactions... Real-time cognitive telemetry tracking: `time_elapsed_ms`, `errors_count`, `rage_clicks`, `student_name`, `timestamp`. Silent async background fetch sending payload via `POST /api/telemetry` on game completion."
- **Lines 28-32**: "EducarIA Teacher Dashboard Prototype... Automatic polling/fetching from `GET /api/telemetry` every 3-5 seconds... Dynamic Semáforo status table: 🟢 **Verde** (Riesgo Bajo): Low completion time, 0 errors. 🟡 **Amarillo** (Riesgo Medio): Moderate completion time or 1-2 errors. 🔴 **Rojo** (Riesgo Alto): High completion time or >2 errors / high rage clicks."
- **Lines 35-40**: "`verify.js`: Standalone Node.js script. Sends mock telemetry JSON payload via HTTP POST to `http://localhost:3000/api/telemetry`. Fetches telemetry via HTTP GET. Verifies HTTP 200 responses, data payload structure, and correctness. Exits with status code 0 on success, non-zero on failure."
- **Lines 70-115**: Interface contracts for `POST /api/telemetry` and `GET /api/telemetry` detailing request body fields and response structure containing `semaforo`.

### B. From `PRD_NOMAD_IA.md` (`/home/laptop/Documentos/mvp-hackaton-minedu/PRD_NOMAD_IA.md`):
- **Section 3.2 (Lines 35-38)**: "El tutor utiliza telemetría oculta (ej. Hover Time, Latencia de Acción, Tasa de Errores) para calcular la Carga Cognitiva Estimada (ECL)."
- **Section 4.3 (Lines 63-65)**: "Ambos juegos recopilan silenciosamente el `time_to_first_interaction_ms`, tiempo total, tasa de clics erróneos (Rage Clicking) y solicitud de pistas. Los datos se agrupan en un JSON `telemetry_data` y se envían asíncronamente."
- **Section 5.2 (Lines 72-76)**: "Semáforo de Riesgo Predictivo: Categoriza a los alumnos en 🟢 Verde (Riesgo bajo), 🟡 Amarillo (Riesgo medio - requiere monitoreo), 🔴 Rojo (Riesgo alto - intervención inmediata)."

### C. From `implementation_plan.md` (`/home/laptop/Documentos/mvp-hackaton-minedu/implementation_plan.md`):
- **Lines 24-29**: "El Núcleo (Telemetría en Tiempo Real): Mientras el usuario juega, un script en segundo plano estará midiendo métricas ocultas: Latencia Cognitiva, Rage Clicks, Árbol Lógico."

---

## 2. Logic Chain

From these observations, we trace the step-by-step design logic for all telemetry contracts, classification algorithms, client JS interactions, dashboard polling, and automated testing:

1. **Telemetry Contract Definition**:
   - The JSON payload requires 6 key input parameters from the client: `student_name`, `game_id`, `time_elapsed_ms`, `errors_count`, `rage_clicks`, `status`, and `timestamp`.
   - The backend server enriches this record with an auto-incremented numeric `id`, a calculated `student_id` (if not supplied), and server-computed `semaforo` rating (`VERDE`, `AMARILLO`, `ROJO`).

2. **Semáforo Classification Algorithm Derivation**:
   - The algorithm evaluates cognitive risk using a deterministic priority cascade based on `errors_count`, `rage_clicks`, and `time_elapsed_ms`:
     - **🔴 ROJO (High Risk)**: Severe difficulty or high frustration (`errors_count >= 3` OR `rage_clicks >= 4` OR (`time_elapsed_ms > 45000` AND `errors_count >= 2`) OR (`errors_count >= 2` AND `rage_clicks >= 2`)).
     - **🟡 AMARILLO (Medium Risk)**: Moderate difficulty or mild hesitation (`errors_count` 1–2 OR `rage_clicks` 1–3 OR `time_elapsed_ms > 30000`).
     - **🟢 VERDE (Low Risk)**: Mastery (`errors_count == 0` AND `rage_clicks == 0` AND `time_elapsed_ms <= 30000`).

3. **AprenderIA Game Interactions Strategy**:
   - **Interaction 1 (Circuito Eléctrico)**: Multiple choice option buttons where incorrect options increment `errors_count` and trigger Tutor IA hints.
   - **Interaction 2 (Algoritmo Mars Rover)**: Code block sequencing options. Correct answer completes the minigame.
   - **Rage Click Tracking**: A window-level click listener tracking click timestamps. If 3+ clicks occur within a 500ms window, `rage_clicks` increments.
   - **Latency Tracking**: Measured from game start (`startTime = Date.now()`) to game completion (`time_elapsed_ms = Date.now() - startTime`).
   - **Silent Background Submit**: `fetch('/api/telemetry', { method: 'POST', body: JSON.stringify(payload) })` called asynchronously without blocking the victory screen UI.

4. **EducarIA Teacher Dashboard Auto-Polling Strategy**:
   - Polling loop runs via `setInterval(fetchTelemetry, 3000)`.
   - Fetches `GET /api/telemetry`, updates 3 metric cards (Total Evaluated, Average Latency, Risk Breakdown), and re-renders the HTML data table with color-coded status badges.

5. **Programmatic Verification (`verify.js`) Strategy**:
   - A standalone Node.js script using native `fetch` (or `http` module).
   - Performs POST test payload -> checks 200/201 response -> performs GET -> verifies record presence and Semáforo calculation accuracy -> exits with code 0 on success, code 1 on failure.

---

## 3. Caveats

1. **In-Memory Volatility**: The backend telemetry array stored in `server.js` resets on server restart. For hackathon demo purposes, the server can be initialized with pre-seeded dummy records.
2. **Rage Click Threshold**: Rage click tracking uses a 500ms sliding window with a 3-click threshold. Double-clicking quickly for button selection will not trigger rage clicks.
3. **Timestamp Normalization**: The client provides ISO 8601 string (`new Date().toISOString()`). The backend falls back to server time if the client timestamp is missing or malformed.
4. **Offline Fetch Failure**: If the backend is unreachable during minigame submit, the client catches the fetch error gracefully, displaying local victory results without crashing the game.

---

## 4. Conclusion & Technical Specifications

### A. Telemetry Data Contracts

#### POST `/api/telemetry`
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
- **Response `200 OK` (or `201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Telemetry recorded successfully",
    "data": {
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
  }
  ```

#### GET `/api/telemetry`
- **Response `200 OK`**:
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

---

### B. Semáforo Classification Logic (`server.js` helper)

```javascript
/**
 * Calculates Semáforo risk classification based on cognitive telemetry metrics.
 * @param {Object} telemetry - Telemetry record
 * @returns {'VERDE' | 'AMARILLO' | 'ROJO'}
 */
function calculateSemaforo(telemetry) {
  const errors = Number(telemetry.errors_count) || 0;
  const rageClicks = Number(telemetry.rage_clicks) || 0;
  const timeMs = Number(telemetry.time_elapsed_ms) || 0;

  // Priority 1: ROJO (High Risk)
  if (
    errors >= 3 ||
    rageClicks >= 4 ||
    (timeMs > 45000 && errors >= 2) ||
    (errors >= 2 && rageClicks >= 2)
  ) {
    return 'ROJO';
  }

  // Priority 2: AMARILLO (Medium Risk)
  if (errors >= 1 || rageClicks >= 1 || timeMs > 30000) {
    return 'AMARILLO';
  }

  // Priority 3: VERDE (Low Risk / Mastery)
  return 'VERDE';
}
```

---

### C. AprenderIA Minigame Telemetry Implementation (`public/aprender-ia/game.js`)

```javascript
// State tracking
let startTime = 0;
let errorsCount = 0;
let rageClicksCount = 0;
let clickHistory = [];

// Setup rage click listener
window.addEventListener('click', (e) => {
  const now = Date.now();
  clickHistory.push(now);
  // Keep only clicks within last 500ms
  clickHistory = clickHistory.filter(t => now - t <= 500);
  if (clickHistory.length >= 3) {
    rageClicksCount++;
    clickHistory = []; // Reset window after recording a rage click event
    showTutorCalmFeedback();
  }
});

function startGame(studentNameInput) {
  startTime = Date.now();
  errorsCount = 0;
  rageClicksCount = 0;
  // Render Question 1
}

function handleOptionSelect(isCorrect) {
  if (!isCorrect) {
    errorsCount++;
    showTutorHint();
  } else {
    advanceToNextStep();
  }
}

function completeGame(studentName) {
  const timeElapsedMs = Math.max(1000, Date.now() - startTime);
  const payload = {
    student_id: `est_${Date.now().toString(36)}`,
    student_name: studentName || 'Mateo Rossi',
    game_id: 'aprender_ia_steam',
    time_elapsed_ms: timeElapsedMs,
    errors_count: errorsCount,
    rage_clicks: rageClicksCount,
    status: 'completed',
    timestamp: new Date().toISOString()
  };

  // Silent Async POST submit
  fetch('/api/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(err => console.warn('Offline telemetry queue fallback:', err));

  showVictoryScreen(payload);
}
```

---

### D. EducarIA Dashboard Telemetry Auto-Polling (`public/educar-ia/dashboard.js`)

```javascript
let telemetryData = [];

function fetchTelemetry() {
  fetch('/api/telemetry')
    .then(res => res.json())
    .then(res => {
      if (res.success && Array.isArray(res.data)) {
        telemetryData = res.data;
        renderSummaryCards(telemetryData);
        renderTelemetryTable(telemetryData);
      }
    })
    .catch(err => console.error('Error fetching telemetry:', err));
}

// Auto-polling every 3 seconds
setInterval(fetchTelemetry, 3000);
document.addEventListener('DOMContentLoaded', fetchTelemetry);

function renderSummaryCards(data) {
  const total = data.length;
  const avgTime = total ? Math.round(data.reduce((acc, r) => acc + (r.time_elapsed_ms || 0), 0) / total / 1000) : 0;
  const verde = data.filter(r => r.semaforo === 'VERDE').length;
  const amarillo = data.filter(r => r.semaforo === 'AMARILLO').length;
  const rojo = data.filter(r => r.semaforo === 'ROJO').length;

  document.getElementById('card-total').innerText = total;
  document.getElementById('card-avg-time').innerText = `${avgTime}s`;
  document.getElementById('card-risk-breakdown').innerText = `🟢 ${verde} | 🟡 ${amarillo} | 🔴 ${rojo}`;
}

function renderTelemetryTable(data) {
  const tbody = document.getElementById('telemetry-tbody');
  if (!tbody) return;
  tbody.innerHTML = data.map(row => `
    <tr class="semaforo-row-${row.semaforo.toLowerCase()}">
      <td><strong>${escapeHtml(row.student_name)}</strong><br><small>${row.student_id}</small></td>
      <td>${row.game_id}</td>
      <td>${(row.time_elapsed_ms / 1000).toFixed(1)}s</td>
      <td>${row.errors_count}</td>
      <td>${row.rage_clicks}</td>
      <td><span class="badge badge-${row.semaforo.toLowerCase()}">${row.semaforo}</span></td>
      <td>${new Date(row.timestamp).toLocaleTimeString()}</td>
    </tr>
  `).join('');
}
```

---

### E. Programmatic Verification Script (`verify.js`)

```javascript
/**
 * verify.js - Programmatic Verification Script for NOMAD-IA Telemetry API
 */
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runVerification() {
  console.log(`🔍 Starting verification against ${BASE_URL}...`);

  const mockPayload = {
    student_id: 'verify_test_01',
    student_name: 'Estudiante Prueba Verify',
    game_id: 'aprender_ia_steam',
    time_elapsed_ms: 18500,
    errors_count: 1,
    rage_clicks: 0,
    status: 'completed',
    timestamp: new Date().toISOString()
  };

  // Step 1: Send POST Telemetry
  console.log('📡 [1/3] Testing POST /api/telemetry...');
  const postRes = await fetch(`${BASE_URL}/api/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockPayload)
  });

  if (postRes.status !== 200 && postRes.status !== 201) {
    throw new Error(`POST /api/telemetry returned status ${postRes.status}`);
  }

  const postData = await postRes.json();
  if (!postData.success || !postData.data) {
    throw new Error('POST /api/telemetry response invalid structure');
  }

  const expectedSemaforo = 'AMARILLO'; // 1 error -> AMARILLO
  if (postData.data.semaforo !== expectedSemaforo) {
    throw new Error(`Semáforo calculation failed: expected ${expectedSemaforo}, got ${postData.data.semaforo}`);
  }
  console.log('  ✅ POST successful. Computed Semáforo:', postData.data.semaforo);

  // Step 2: Send GET Telemetry
  console.log('📡 [2/3] Testing GET /api/telemetry...');
  const getRes = await fetch(`${BASE_URL}/api/telemetry`);
  if (getRes.status !== 200) {
    throw new Error(`GET /api/telemetry returned status ${getRes.status}`);
  }

  const getData = await getRes.json();
  if (!getData.success || !Array.isArray(getData.data)) {
    throw new Error('GET /api/telemetry response invalid structure');
  }
  console.log(`  ✅ GET successful. Records count: ${getData.count}`);

  // Step 3: Assert Record Match
  console.log('🔎 [3/3] Asserting test record presence...');
  const match = getData.data.find(r => r.student_id === mockPayload.student_id);
  if (!match) {
    throw new Error('Posted telemetry record not found in GET response');
  }

  if (match.student_name !== mockPayload.student_name || match.semaforo !== expectedSemaforo) {
    throw new Error('Record verification mismatch');
  }

  console.log('🎉 ✅ ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runVerification().catch(err => {
  console.error('❌ VERIFICATION FAILED:', err.message);
  process.exit(1);
});
```

---

## 5. Verification Method

Once `server.js` is implemented in Milestone 2:

1. **Start the server**:
   ```bash
   node server.js
   ```
2. **Execute programmatic test runner**:
   ```bash
   node verify.js
   ```
   *Expected Output*: Exit code `0`, log `🎉 ✅ ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!`.

3. **Manual cURL Verification**:
   ```bash
   # Test POST
   curl -X POST http://localhost:3000/api/telemetry \
     -H "Content-Type: application/json" \
     -d '{"student_name":"Elena Huamán","game_id":"aprender_ia_steam","time_elapsed_ms":42000,"errors_count":3,"rage_clicks":5}'

   # Test GET
   curl http://localhost:3000/api/telemetry
   ```
   *Expected Output*: Returned record includes `"semaforo": "ROJO"`.
