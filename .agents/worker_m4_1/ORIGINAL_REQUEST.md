## 2026-07-23T23:15:50Z
<USER_REQUEST>
You are Worker 3 for Milestone 4 (AprenderIA Minigame Prototype) of NOMAD-IA Demo Hub.
Working Directory: /home/laptop/Documentos/mvp-hackaton-minedu/.agents/worker_m4_1
Project Root: /home/laptop/Documentos/mvp-hackaton-minedu
Scope Document: /home/laptop/Documentos/mvp-hackaton-minedu/.agents/orchestrator/PROJECT.md

Task:
1. Read Explorer 2 design specs (`/home/laptop/Documentos/mvp-hackaton-minedu/.agents/explorer_m1_2/mondrian_design_system.md` lines 582-681) and Explorer 3 telemetry specs (`/home/laptop/Documentos/mvp-hackaton-minedu/.agents/explorer_m1_3/handoff.md` lines 170-230).
2. Create directory `public/aprender-ia/` if it doesn't exist.
3. Create `public/aprender-ia/index.html` implementing:
   - Mobile frame shell container (`.mobile-frame-wrapper`, `.mobile-frame`, 360x640px simulation).
   - Game header bar with student profile name (input/display) and seeds counter.
   - Progress bar (`.mondrian-progress-container`, `.mondrian-progress-fill`).
   - STEAM interactive challenge area (Question 1: Circuito Electrónico LED, Question 2: Algoritmo Mars Rover).
   - Virtual Tutor IA Mascot widget (`.tutor-ia-widget`, `.tutor-ia-bubble`, `.tutor-ia-avatar`).
   - Results victory screen displaying seeds earned, elapsed time, errors count, and submission status.
   - `<script src="/aprender-ia/game.js"></script>`.
4. Create `public/aprender-ia/game.js` implementing:
   - Real-time telemetry tracking (`startTime`, `errorsCount`, `rageClicksCount`, `clickHistory` sliding window <= 500ms).
   - Interactive game state machine for Step 1 (Circuito LED) and Step 2 (Algoritmo Mars Rover).
   - Non-intrusive Tutor IA messages on wrong options or rage clicks.
   - Silent async background submit via `POST /api/telemetry` with payload (`student_id`, `student_name`, `game_id`, `time_elapsed_ms`, `errors_count`, `rage_clicks`, `status`, `timestamp`).
   - Display victory screen with calculated statistics upon completion.
5. Verify minigame execution by testing HTTP GET `/aprender-ia/` on running Express server, completing game interaction, and verifying that `POST /api/telemetry` receives telemetry and returns HTTP 200 OK with calculated `semaforo`.
6. Write your completion report in `/home/laptop/Documentos/mvp-hackaton-minedu/.agents/worker_m4_1/handoff.md`.
7. Send a message to the orchestrator with your results and handoff path.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
</USER_REQUEST>
