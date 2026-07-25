## 2026-07-23T23:22:24-05:00

You are Worker 6 for Milestone 6 (Programmatic E2E Verification Script).

Working Directory: /home/laptop/Documentos/mvp-hackaton-minedu/.agents/worker_m6_1
Project Root: /home/laptop/Documentos/mvp-hackaton-minedu

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Task:
Implement `verify.js` at the project root (`/home/laptop/Documentos/mvp-hackaton-minedu/verify.js`).

Requirements:
1. `verify.js` must be a standalone executable Node.js script.
2. The script must execute programmatic HTTP end-to-end verification against the running Express backend at `http://localhost:3000`:
   a. **POST Telemetry Test 1 (Verde)**:
      - Send HTTP POST `http://localhost:3000/api/telemetry` with payload:
        ```json
        {
          "student_id": "est_v1",
          "student_name": "Valeria E2E",
          "game_id": "aprender_ia_steam",
          "time_elapsed_ms": 12000,
          "errors_count": 0,
          "rage_clicks": 0,
          "status": "completed",
          "timestamp": "2026-07-24T04:22:00.000Z"
        }
        ```
      - Assert HTTP status `200 OK`.
      - Assert JSON response `{ success: true, message: ..., data: ... }`.
      - Assert `data.semaforo === 'VERDE'`.

   b. **POST Telemetry Test 2 (Rojo Edge Case)**:
      - Send HTTP POST `http://localhost:3000/api/telemetry` with payload:
        ```json
        {
          "student_id": "est_v2",
          "student_name": "Carlos Alert",
          "game_id": "aprender_ia_steam",
          "time_elapsed_ms": 45000,
          "errors_count": 3,
          "rage_clicks": 4,
          "status": "completed",
          "timestamp": "2026-07-24T04:22:05.000Z"
        }
        ```
      - Assert HTTP status `200 OK`.
      - Assert `data.semaforo === 'ROJO'`.

   c. **GET Verification Test**:
      - Send HTTP GET `http://localhost:3000/api/telemetry`.
      - Assert HTTP status `200 OK`.
      - Assert JSON response structure contains `{ success: true, count: N, data: [...] }`.
      - Assert both submitted records exist in `data` array.

   d. **Static Endpoint Availability Tests**:
      - Fetch `http://localhost:3000/` -> assert HTTP 200.
      - Fetch `http://localhost:3000/aprender-ia/` -> assert HTTP 200.
      - Fetch `http://localhost:3000/educar-ia/` -> assert HTTP 200.

3. Exit Code:
   - If all assertions pass, print success banner and call `process.exit(0)`.
   - If any assertion fails, print error message and call `process.exit(1)`.

4. Execute `node verify.js` to run the test and verify that it exits with code `0`!

Document your implementation and verification in `/home/laptop/Documentos/mvp-hackaton-minedu/.agents/worker_m6_1/handoff.md`.
Send message back to parent when complete.
