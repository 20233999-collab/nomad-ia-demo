# Context — NOMAD-IA Demo Hub

## Project Context
The NOMAD-IA project is an EdTech ecosystem designed for offline, low-connectivity rural schools in Peru (Hackathon MINEDU).
The Demo Hub consists of three key frontends (Hub index, AprenderIA minigame, EducarIA teacher dashboard) served by an offline Node.js backend.

## Design Identity: Mondrian Visual Style
Piet Mondrian neo-plasticism art style:
- Grid layout with thick dark borders (`4px` to `6px` solid `#000000`).
- Primary color palette:
  - Red: `#E52521` (or `#D32F2F`)
  - Blue: `#004586` (or `#1976D2`)
  - Yellow: `#F7D000` (or `#FBC02D`)
  - Backgrounds: Off-white/Beige `#F6F4EE`, pure White `#FFFFFF`
  - Text & Accents: Pure Black `#000000`
- Asymmetric rectangular containers, clean typography, high contrast for visibility under rural sunlight.

## Technical Parameters
- Stack: Node.js, Express, HTML5, CSS3, Vanilla JavaScript.
- Network: Localhost only (Port 3000), 100% offline, zero external CDN dependencies.
- Semáforo Logic:
  - `VERDE` (Green): `errors_count == 0` AND `time_elapsed_ms < 20000` AND `rage_clicks == 0`
  - `AMARILLO` (Yellow): `errors_count == 1` OR (`time_elapsed_ms >= 20000` AND `time_elapsed_ms <= 40000`)
  - `ROJO` (Red): `errors_count > 1` OR `time_elapsed_ms > 40000` OR `rage_clicks > 2`

## Key File Locations
- Root directory: `/home/laptop/Documentos/mvp-hackaton-minedu`
- Working directory: `/home/laptop/Documentos/mvp-hackaton-minedu/.agents/orchestrator`
