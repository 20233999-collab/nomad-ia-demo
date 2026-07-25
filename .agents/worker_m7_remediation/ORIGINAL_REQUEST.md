## 2026-07-23T23:25:07Z
You are Worker 7 for Milestone 7 Remediation (Fixing server.js Semáforo logic, payload validation, and verify.js boundary tests).

Working Directory: /home/laptop/Documentos/mvp-hackaton-minedu/.agents/worker_m7_remediation
Project Root: /home/laptop/Documentos/mvp-hackaton-minedu

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Task:
Fix `server.js` and update `verify.js` to address the findings of Reviewer 2 and Challenger 2.

Specific Instructions:

1. **Update `server.js`**:
   a. Correct `calculateSemaforo` function:
      ```javascript
      function calculateSemaforo({ time_elapsed_ms, errors_count, rage_clicks = 0 }) {
        const timeMs = Number(time_elapsed_ms) || 0;
        const errors = Number(errors_count) || 0;
        const rage = Number(rage_clicks) || 0;

        if (errors > 1 || timeMs > 40000 || rage > 2) {
          return 'ROJO';
        }
        if (errors === 1 || (timeMs >= 20000 && timeMs <= 40000)) {
          return 'AMARILLO';
        }
        return 'VERDE';
      }
      ```
   b. Enhance `POST /api/telemetry` payload validation:
      - Check that `time_elapsed_ms`, `errors_count`, and `rage_clicks` (if provided) are numbers >= 0.
      - If `time_elapsed_ms < 0` or `errors_count < 0` or `rage_clicks < 0`, return status 400 with `{ success: false, error: 'Numeric fields cannot be negative' }`.
   c. Express Global Error Handler:
      - Update global error handling middleware at bottom of `server.js`:
      ```javascript
      app.use((err, req, res, next) => {
        const status = err.status || err.statusCode || 500;
        res.status(status).json({
          success: false,
          error: err.message || 'Internal Server Error'
        });
      });
      ```

2. **Update `verify.js`**:
   - Enhance the test suite to include complete boundary and validation test cases:
     1. Test `VERDE` boundary: `time_elapsed_ms: 19999`, `errors_count: 0`, `rage_clicks: 0` -> `VERDE`.
     2. Test `AMARILLO` boundary (lower): `time_elapsed_ms: 20000`, `errors_count: 0` -> `AMARILLO`.
     3. Test `AMARILLO` boundary (upper): `time_elapsed_ms: 40000`, `errors_count: 0` -> `AMARILLO`.
     4. Test `ROJO` boundary (time): `time_elapsed_ms: 40001`, `errors_count: 0` -> `ROJO`.
     5. Test `ROJO` boundary (errors): `errors_count: 2`, `time_elapsed_ms: 5000` -> `ROJO`.
     6. Test `ROJO` boundary (rage clicks): `rage_clicks: 3` -> `ROJO`.
     7. Test Validation Error 1: missing required fields -> HTTP 400.
     8. Test Validation Error 2: negative `time_elapsed_ms: -100` -> HTTP 400.
     9. Test GET telemetry & static endpoints `/`, `/aprender-ia/`, `/educar-ia/` -> HTTP 200.

3. **Restart Backend Server & Run Tests**:
   - Restart backend server if running (`pkill -f "node server.js"` or kill process on port 3000, then start `node server.js &` or background task).
   - Run `node verify.js` and ensure all test cases pass with exit code 0!

Document all changes and test outputs in `/home/laptop/Documentos/mvp-hackaton-minedu/.agents/worker_m7_remediation/handoff.md`.
Send message back to parent when complete.
