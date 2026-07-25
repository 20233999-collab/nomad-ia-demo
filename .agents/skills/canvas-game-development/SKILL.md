---
name: canvas-game-development
description: Guidelines and best practices for building lightweight 2D HTML5 Canvas arcade mini-games for educational web apps (EdTech, mobile-responsive, touch controls, 60fps performance, and telemetry integration).
---

# 🎮 2D Canvas Web Game Development Skill

## Overview
This skill defines standards for designing, architecture, and implementing responsive, high-performance 2D Canvas web mini-games tailored for students (10-13 years old) in low-resource and off-grid EdTech environments like **NOMAD-IA**.

---

## 🏛️ Core Architectural Pillars

### 1. Performance & Zero External Dependencies
- **Native HTML5 Canvas 2D API**: Avoid heavy game engines (Phaser, PixiJS, Unity WebGL) for 2D arcade mechanics to guarantee a tiny footprint (< 100KB total bundle).
- **60 FPS Animation Loop**: Driven strictly by `requestAnimationFrame` with frame-independent physics or controlled frame throttling.
- **Memory Safety & Object Pooling**: Re-use array slots for falling particles/elements to prevent Garbage Collection lag spikes on low-cost Android tablets.

---

### 2. Responsive Controls & Affordances
- **Dual Control System**:
  - **Mobile / Tablet Touch Controls**: Large, accessible touch buttons (`◀ IZQUIERDA`, `DERECHA ▶`, `SALTAR / ACCIÓN`) bound to `ontouchstart` / `ontouchend` with `e.preventDefault()`.
  - **Keyboard Bindings**: Arrow keys (`ArrowLeft`, `ArrowRight`, `Space`) and WASD keys.
  - **Pointer Dragging**: Support direct touch dragging tracking pointer X/Y coordinates clamped within screen bounds.

---

### 3. Visual & Aesthetic Guidelines (Cartoon Arcade Clean)
- **Responsive Clamped Canvas**: Render on fixed internal coordinate resolutions (e.g. `336x320` or `360x400`) scaled via CSS to fit mobile frames.
- **Vibrant & Accessible Visuals**:
  - Rounded sprites, bubbly physics, and thick crisp outlines (`ctx.lineWidth = 2.5`).
  - High-contrast HUD overlays (Score, Target Badge, Time Left, Level).
  - Micro-animations and particle explosions (stars, sparks, bubbles) on positive interactions.

---

### 4. Educational Scaffolding & Anti-Stress Mechanics
- **Anti-Stress Protocol**: Cero punitive "game over" sounds or stressful countdowns.
- **Chancay Metacognitive Hints**: When an error occurs, provide a brief 2-second pop-up hint explaining the core concept (e.g., *"¡Ups! El Sodio (Na) es un Metal Alcalino, no un Gas Noble"*).
- **Dynamic Goal Cycling**: Rotate mission targets every 15-20 seconds to maintain high engagement and reinforce classification concepts.

---

### 5. Telemetry & Offline Data Persistence
- Automatically package hidden cognitive telemetry upon game completion:
  ```json
  {
    "studentName": "Mateo Rossi",
    "gameId": "quimica-1",
    "timeSpentSec": 35,
    "errorsCount": 0,
    "rageClicks": 0,
    "score": 100,
    "statusBadge": "VERDE"
  }
  ```
- Send payload asynchronously to `POST /api/telemetry` with fallback to `localStorage` when offline.

---

## 🛠️ Step-by-Step Implementation Workflow

1. **Card & Portal Entry**: Register the game card in `public/aprender-ia/biblioteca.html` Arcade section with category badges, difficulty tags, and a 3D action button.
2. **Modal & Canvas Container**: Add a dedicated overlay modal containing the HUD bar, `<canvas>` viewport, and touch control buttons.
3. **Game Loop & State Machine**: Initialize player coordinates, target goals, item arrays, collision boxes, and requestAnimationFrame loop.
4. **Telemetry Dispatch**: On mission completion or target score, trigger telemetry submission and display positive accomplishment feedback.
