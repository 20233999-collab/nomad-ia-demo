# Execution Plan — NOMAD-IA Demo Hub

## Overview
This plan breaks down the requirements R1-R5 and Acceptance Criteria into 7 milestones with verifiable subtasks.

---

## Milestone 1: Exploration & Setup
- [ ] Subtask 1.1: Explore project workspace and define package.json requirements (express, cors, etc.).
- [ ] Subtask 1.2: Establish clean directory structure (`public/`, `public/styles/`, `public/aprender-ia/`, `public/educar-ia/`).

## Milestone 2: Backend Node.js Server (`server.js`)
- [ ] Subtask 2.1: Initialize `package.json` with express dependency and start script `node server.js`.
- [ ] Subtask 2.2: Implement `server.js` with Express, CORS, `express.json()`, and static directory serving (`express.static('public')`).
- [ ] Subtask 2.3: Implement `POST /api/telemetry` endpoint with payload validation and automatic Semáforo calculation (`VERDE`, `AMARILLO`, `ROJO`).
- [ ] Subtask 2.4: Implement `GET /api/telemetry` endpoint returning the array of telemetry records.
- [ ] Subtask 2.5: Test backend server startup on port 3000 and confirm endpoints manually or via basic curl/fetch.

## Milestone 3: Mondrian Visual Design System & Hub Page
- [ ] Subtask 3.1: Create `public/styles/mondrian.css` implementing Piet Mondrian visual identity (Red `#E52521`, Blue `#004586`, Yellow `#F7D000`, Beige `#F6F4EE`, thick 4-6px black borders `#000000`, grid layouts).
- [ ] Subtask 3.2: Create `public/index.html` (Hub page) featuring a Mondrian grid layout with landing cards linking to `/aprender-ia/` and `/educar-ia/`.

## Milestone 4: AprenderIA Minigame Prototype
- [x] Subtask 4.1: Create `public/aprender-ia/index.html` with a mobile frame container (Mondrian styled).
- [x] Subtask 4.2: Implement 2 interactive STEAM challenges (e.g. Circuito Eléctrico / Cadena Trófica).
- [x] Subtask 4.3: Implement telemetry measurement in `public/aprender-ia/game.js` (time elapsed, error clicks, rage clicks).
- [x] Subtask 4.4: Implement silent submission (`POST /api/telemetry`) upon minigame completion and display summary screen.

## Milestone 5: EducarIA Teacher Dashboard Prototype
- [x] Subtask 5.1: Create `public/educar-ia/index.html` desktop layout with Mondrian visual identity.
- [x] Subtask 5.2: Implement `public/educar-ia/dashboard.js` polling `GET /api/telemetry` every 3 seconds.
- [x] Subtask 5.3: Render dynamic Semáforo table displaying student name, game ID, latency/time, errors, status, and colored badges (🟢 Verde, 🟡 Amarillo, 🔴 Rojo).
- [x] Subtask 5.4: Implement KPI summary statistics cards (Total Players, Avg Time, Risk Levels).

## Milestone 6: Programmatic E2E Verification Script (`verify.js`)
- [x] Subtask 6.1: Write `verify.js` standalone script that makes POST requests to `http://localhost:3000/api/telemetry` with test JSON data.
- [x] Subtask 6.2: Verify GET response contains the submitted telemetry record with valid status code 200.
- [x] Subtask 6.3: Ensure script exits with code 0 on success and non-zero on error.

## Milestone 7: Verification, Review & Forensic Audit
- [x] Subtask 7.1: Run full verification loop (Reviewers check code & functionality, Challengers stress test).
- [x] Subtask 7.2: Run Forensic Auditor (`teamwork_preview_auditor`) to ensure authentic implementation without dummy hardcoding.
- [x] Subtask 7.3: Submit victory report to Sentinel.
