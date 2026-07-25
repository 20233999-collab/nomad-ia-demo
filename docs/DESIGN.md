# NOMAD-IA Mondrian Design System Specification

## 1. Visual Identity Overview & Design Philosophy

The visual identity of **NOMAD-IA** is directly inspired by Neo-Plasticism and the iconic de Stijl artwork of **Piet Mondrian**. This choice is both aesthetic and functional for offline rural education in Peru:
- **High Sun Visibility**: Thick black grid lines (`4-6px #000000`) and high-contrast primary colors (Red, Blue, Yellow on Beige/White) provide ultra-clear legibility on low-cost smartphone screens even under bright daylight.
- **Cognitive Clarity**: Asymmetric rectangular blocks isolate information intuitively, reducing visual fatigue for students and teachers.
- **Tactile Affordance**: Large primary-colored buttons with solid black borders and 3D offset hard shadows (`4px 4px 0px #000000`) signal clear touch targets on mobile devices.

---

## 2. Design Tokens & Color Palette

### 2.1 Primary Mondrian Palette
| Token Name | Hex Code | Role / Context | Contrast Ratio vs Beige |
|------------|----------|----------------|--------------------------|
| `--mondrian-red` | `#E52521` | High-priority blocks, alerts, lock states, primary hero headers | ~4.6:1 (AA) |
| `--mondrian-blue` | `#004586` | Secondary headers, "in-progress" states, interactive elements, teacher theme | ~8.1:1 (AAA) |
| `--mondrian-yellow` | `#F7D000` | Accent blocks, "completed" states, notifications, warning cards | ~1.4:1 (Requires dark text) |
| `--mondrian-beige` | `#F6F4EE` | Canvas background, off-white neutral base | Neutral base |
| `--mondrian-white` | `#FFFFFF` | Content card background, high contrast text containers | Clean white |
| `--mondrian-black` | `#000000` | Primary grid borders, titles, high-contrast text, shadows | 21:1 (AAA) |
| `--mondrian-gray-light`| `#E5E2D9` | Unlocked/empty grid areas, neutral card fill | Subtle neutral |
| `--mondrian-gray-dark` | `#333333` | Subtitles, muted telemetry details | Readability |

### 2.2 Pedagogical Semáforo Tokens (EducarIA)
| Token Name | Hex Code | Risk Level | Description |
|------------|----------|------------|-------------|
| `--status-green` | `#00875A` | Riesgo Bajo (Verde) | Fast completion, 0 errors, low latency |
| `--status-yellow` | `#F7D000` | Riesgo Medio (Amarillo)| Moderate time, 1-2 errors |
| `--status-red` | `#E52521` | Riesgo Alto (Rojo) | High latency, >2 errors or rage clicks |

---

## 3. CSS Architecture (`public/styles/mondrian.css`)

The CSS stylesheet is structured in 6 modular layers:
1. **Design Tokens & Root Variables**
2. **CSS Reset & Base Typography**
3. **Mondrian Grid Layout System**
4. **Core UI Components** (Buttons, Cards, Badges, Headers)
5. **AprenderIA Specific Views** (Mobile Frame, Tutor Mascot, Game Containers)
6. **EducarIA Specific Views** (KPI Cards, Data Table, Semáforo Badges)

```css
/* ==========================================================================
   NOMAD-IA - Piet Mondrian Design System CSS (`public/styles/mondrian.css`)
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. Design Tokens & Root Variables
   -------------------------------------------------------------------------- */
:root {
  /* Brand Palette */
  --mondrian-red: #E52521;
  --mondrian-blue: #004586;
  --mondrian-yellow: #F7D000;
  --mondrian-beige: #F6F4EE;
  --mondrian-white: #FFFFFF;
  --mondrian-black: #000000;
  --mondrian-gray-light: #E5E2D9;
  --mondrian-gray-dark: #333333;

  /* Semáforo Status Colors */
  --status-green-bg: #E3FCEF;
  --status-green-border: #00875A;
  --status-green-text: #006644;
  
  --status-yellow-bg: #FFFAE6;
  --status-yellow-border: #D9A000;
  --status-yellow-text: #826000;
  
  --status-red-bg: #FFEBE6;
  --status-red-border: #E52521;
  --status-red-text: #BF2600;

  /* Borders & Grids */
  --border-width-standard: 4px;
  --border-width-thick: 6px;
  --border-black: var(--border-width-standard) solid var(--mondrian-black);
  --border-black-thick: var(--border-width-thick) solid var(--mondrian-black);

  /* Tactile Hard Shadows */
  --shadow-hard-sm: 3px 3px 0px var(--mondrian-black);
  --shadow-hard-md: 5px 5px 0px var(--mondrian-black);
  --shadow-hard-lg: 8px 8px 0px var(--mondrian-black);

  /* Typography */
  --font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-family-mono: "Courier New", Courier, monospace;

  /* Spacing Scale */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
}

/* --------------------------------------------------------------------------
   2. Base Reset & Layout Base
   -------------------------------------------------------------------------- */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  background-color: var(--mondrian-beige);
  color: var(--mondrian-black);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--mondrian-black);
}

/* --------------------------------------------------------------------------
   3. Mondrian Grid Layout System
   -------------------------------------------------------------------------- */
.mondrian-canvas {
  background-color: var(--mondrian-black);
  padding: var(--border-width-standard);
  display: grid;
  gap: var(--border-width-standard);
}

/* Asymmetric 3-Column Mondrian Grid for Desktop / Hub */
.mondrian-grid-hub {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: auto auto auto;
  gap: var(--border-width-standard);
  background-color: var(--mondrian-black);
  border: var(--border-black-thick);
}

/* Mondrian Rectangular Block Base */
.mondrian-block {
  background-color: var(--mondrian-white);
  padding: var(--space-md);
  border: var(--border-black);
  position: relative;
  overflow: hidden;
}

/* Color Modifier Classes */
.bg-red { background-color: var(--mondrian-red); color: var(--mondrian-white); }
.bg-red h1, .bg-red h2, .bg-red h3, .bg-red p { color: var(--mondrian-white); }

.bg-blue { background-color: var(--mondrian-blue); color: var(--mondrian-white); }
.bg-blue h1, .bg-blue h2, .bg-blue h3, .bg-blue p { color: var(--mondrian-white); }

.bg-yellow { background-color: var(--mondrian-yellow); color: var(--mondrian-black); }
.bg-yellow h1, .bg-yellow h2, .bg-yellow h3, .bg-yellow p { color: var(--mondrian-black); }

.bg-beige { background-color: var(--mondrian-beige); }
.bg-white { background-color: var(--mondrian-white); }
.bg-black { background-color: var(--mondrian-black); color: var(--mondrian-white); }

/* --------------------------------------------------------------------------
   4. Core UI Components
   -------------------------------------------------------------------------- */
/* Mondrian Button Component */
.mondrian-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: 12px 24px;
  font-family: var(--font-family);
  font-size: 1rem;
  font-weight: 800;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--mondrian-black);
  background-color: var(--mondrian-white);
  border: var(--border-black);
  box-shadow: var(--shadow-hard-sm);
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  user-select: none;
}

.mondrian-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-md);
}

.mondrian-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0px var(--mondrian-black);
}

/* Button Variants */
.mondrian-btn-red { background-color: var(--mondrian-red); color: var(--mondrian-white); }
.mondrian-btn-blue { background-color: var(--mondrian-blue); color: var(--mondrian-white); }
.mondrian-btn-yellow { background-color: var(--mondrian-yellow); color: var(--mondrian-black); }
.mondrian-btn-full { width: 100%; }

/* Card Component */
.mondrian-card {
  border: var(--border-black);
  background-color: var(--mondrian-white);
  box-shadow: var(--shadow-hard-md);
  margin-bottom: var(--space-md);
}

.mondrian-card-header {
  padding: var(--space-sm) var(--space-md);
  border-bottom: var(--border-black);
  font-weight: 800;
}

.mondrian-card-body {
  padding: var(--space-md);
}

/* Header / Brand Banner */
.mondrian-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  background-color: var(--mondrian-white);
  border-bottom: var(--border-black-thick);
}

.mondrian-logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.mondrian-logo-icon {
  width: 36px;
  height: 36px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  border: 3px solid var(--mondrian-black);
}
.mondrian-logo-icon .sq1 { background: var(--mondrian-red); }
.mondrian-logo-icon .sq2 { background: var(--mondrian-yellow); }
.mondrian-logo-icon .sq3 { background: var(--mondrian-blue); }
.mondrian-logo-icon .sq4 { background: var(--mondrian-white); }

/* --------------------------------------------------------------------------
   5. AprenderIA Specific Layout & Components
   -------------------------------------------------------------------------- */
/* Mobile Frame Centering Container for Desktop Testing */
.mobile-frame-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: var(--space-md);
  background-color: var(--mondrian-beige);
}

/* 360x640 Mobile Viewport Simulation Container */
.mobile-frame {
  width: 100%;
  max-width: 380px;
  height: 680px;
  background-color: var(--mondrian-white);
  border: var(--border-black-thick);
  box-shadow: var(--shadow-hard-lg);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Game Header Bar */
.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  background-color: var(--mondrian-yellow);
  border-bottom: var(--border-black);
}

/* Progress Bar */
.mondrian-progress-container {
  height: 16px;
  background-color: var(--mondrian-white);
  border: var(--border-black);
  margin: var(--space-sm) 0;
  position: relative;
  overflow: hidden;
}

.mondrian-progress-fill {
  height: 100%;
  background-color: var(--mondrian-blue);
  width: 0%;
  transition: width 0.3s ease;
}

/* STEAM Game Option Tiles */
.game-options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.game-tile {
  padding: var(--space-md);
  background-color: var(--mondrian-white);
  border: var(--border-black);
  box-shadow: var(--shadow-hard-sm);
  text-align: center;
  font-weight: 700;
  cursor: pointer;
  user-select: none;
}

.game-tile:hover {
  background-color: var(--mondrian-beige);
}

.game-tile.selected {
  background-color: var(--mondrian-yellow);
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0px var(--mondrian-black);
}

/* Virtual Tutor IA Mascot Widget */
.tutor-ia-widget {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  z-index: 100;
}

.tutor-ia-bubble {
  background-color: var(--mondrian-white);
  border: var(--border-black);
  padding: 8px 12px;
  font-size: 0.8rem;
  font-weight: 700;
  max-width: 180px;
  box-shadow: var(--shadow-hard-sm);
  border-radius: 4px;
}

.tutor-ia-avatar {
  width: 48px;
  height: 48px;
  background-color: var(--mondrian-red);
  border: var(--border-black);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: var(--mondrian-white);
  box-shadow: var(--shadow-hard-sm);
}

/* --------------------------------------------------------------------------
   6. EducarIA Dashboard Components
   -------------------------------------------------------------------------- */
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
}

/* KPI Summary Cards Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.kpi-card {
  border: var(--border-black);
  padding: var(--space-md);
  box-shadow: var(--shadow-hard-md);
  background-color: var(--mondrian-white);
}

.kpi-title {
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--mondrian-gray-dark);
}

.kpi-value {
  font-size: 2.2rem;
  font-weight: 900;
  margin: var(--space-xs) 0;
}

/* Dynamic Semáforo Data Table */
.mondrian-table-container {
  border: var(--border-black-thick);
  background-color: var(--mondrian-black);
  box-shadow: var(--shadow-hard-lg);
  overflow-x: auto;
}

.mondrian-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--mondrian-white);
}

.mondrian-table th {
  background-color: var(--mondrian-blue);
  color: var(--mondrian-white);
  font-weight: 800;
  text-transform: uppercase;
  padding: 12px 16px;
  text-align: left;
  border-bottom: var(--border-black);
  border-right: 2px solid var(--mondrian-black);
}

.mondrian-table td {
  padding: 12px 16px;
  border-bottom: 2px solid var(--mondrian-black);
  border-right: 2px solid var(--mondrian-black);
  font-weight: 600;
}

.mondrian-table tr:hover {
  background-color: var(--mondrian-beige);
}

/* Semáforo Status Badges */
.badge-semaforo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 0.8rem;
  font-weight: 800;
  border: 2px solid var(--mondrian-black);
  text-transform: uppercase;
}

.badge-verde {
  background-color: var(--status-green-bg);
  color: var(--status-green-text);
  border-color: var(--status-green-border);
}

.badge-amarillo {
  background-color: var(--status-yellow-bg);
  color: var(--status-yellow-text);
  border-color: var(--status-yellow-border);
}

.badge-rojo {
  background-color: var(--status-red-bg);
  color: var(--status-red-text);
  border-color: var(--status-red-border);
}
```

---

## 4. HTML Structure Specifications & Templates

### 4.1 NOMAD-IA Hub Page (`public/index.html`)

The Hub serves as the captive portal landing index for rural students and teachers.

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NOMAD-IA | Hub Educativo Offline</title>
  <link rel="stylesheet" href="/styles/mondrian.css">
</head>
<body>
  <!-- Header / Navigation Bar -->
  <header class="mondrian-navbar">
    <div class="mondrian-logo">
      <div class="mondrian-logo-icon">
        <div class="sq1"></div>
        <div class="sq2"></div>
        <div class="sq3"></div>
        <div class="sq4"></div>
      </div>
      <div>
        <h1 style="font-size: 1.4rem; margin: 0;">NOMAD-IA</h1>
        <p style="font-size: 0.75rem; margin: 0; font-weight: 700;">Ecosistema Educativo Off-Grid</p>
      </div>
    </div>
    <div>
      <span class="badge-semaforo badge-verde">● Red Local Activa: NOMAD_AULA</span>
    </div>
  </header>

  <!-- Main Mondrian Grid Content -->
  <main style="max-width: 1100px; margin: 32px auto; padding: 0 16px;">
    <!-- Asymmetric Mondrian Grid Banner -->
    <div class="mondrian-block bg-red" style="margin-bottom: 24px;">
      <h2 style="font-size: 1.8rem; margin-bottom: 8px;">Bienvenido a la Escuela Rural Digital</h2>
      <p style="font-size: 1rem; max-width: 700px;">Plataforma de aprendizaje offline adaptativo impulsada por telemetría local e IA. Selecciona tu portal para ingresar.</p>
    </div>

    <!-- Portal Modules Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
      
      <!-- Module 1: AprenderIA -->
      <div class="mondrian-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="mondrian-card-header bg-yellow">
            <h3 style="margin: 0; font-size: 1.2rem;">APRENDER-IA</h3>
            <span style="font-size: 0.75rem; font-weight: 700;">Portal para Estudiantes</span>
          </div>
          <div class="mondrian-card-body">
            <p style="margin-bottom: 16px;">Accede a minijuegos interactivos STEAM, tutoría virtual adaptativa en Quechua/Español y acumulación de Semillas de Conocimiento.</p>
            <ul style="margin-left: 20px; font-size: 0.9rem; margin-bottom: 20px;">
              <li>Juego Cadena Trófica & Electrónica</li>
              <li>Tutor IA Guiado Anti-Estrés</li>
              <li>100% Funcional Sin Internet</li>
            </ul>
          </div>
        </div>
        <div style="padding: 0 16px 16px 16px;">
          <a href="/aprender-ia/" class="mondrian-btn mondrian-btn-red mondrian-btn-full">Ingresar a AprenderIA ➔</a>
        </div>
      </div>

      <!-- Module 2: EducarIA -->
      <div class="mondrian-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="mondrian-card-header bg-blue">
            <h3 style="margin: 0; font-size: 1.2rem;">EDUCAR-IA</h3>
            <span style="font-size: 0.75rem; font-weight: 700;">Dashboard para Docentes</span>
          </div>
          <div class="mondrian-card-body">
            <p style="margin-bottom: 16px;">Monitoreo en tiempo real con Semáforo de Alerta Temprana, analítica cognitiva y calificaciones automáticas SIAGIE.</p>
            <ul style="margin-left: 20px; font-size: 0.9rem; margin-bottom: 20px;">
              <li>Semáforo de Riesgo Predictivo</li>
              <li>Telemetría en Tiempo Real</li>
              <li>Evaluación Automática</li>
            </ul>
          </div>
        </div>
        <div style="padding: 0 16px 16px 16px;">
          <a href="/educar-ia/" class="mondrian-btn mondrian-btn-yellow mondrian-btn-full">Ingresar a EducarIA ➔</a>
        </div>
      </div>

    </div>
  </main>

  <!-- Footer -->
  <footer style="text-align: center; padding: 24px; font-weight: 700; font-size: 0.85rem; border-top: var(--border-black);">
    NOMAD-IA &copy; 2026 - Servidor Local Edge | MINEDU Hackathon MVP
  </footer>
</body>
</html>
```

---

### 4.2 AprenderIA Minigame Mobile Frame View (`public/aprender-ia/index.html`)

The AprenderIA interface features a mobile frame (360x640 simulation on desktop), hidden telemetry trackers, STEAM game screen, and the virtual tutor mascot.

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AprenderIA | Minijuego STEAM</title>
  <link rel="stylesheet" href="/styles/mondrian.css">
</head>
<body>
  <div class="mobile-frame-wrapper">
    <div class="mobile-frame" id="app-container">
      
      <!-- Top Game Header -->
      <header class="game-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 28px; height: 28px; background: var(--mondrian-red); border: 2px solid var(--mondrian-black); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem; color: #fff;">M</div>
          <span id="student-name-display" style="font-weight: 800; font-size: 0.85rem;">Mateo Rossi</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 0.8rem; font-weight: 800;">🌱 <span id="seeds-count">120</span></span>
        </div>
      </header>

      <!-- Progress Section -->
      <div style="padding: 8px 16px 0 16px; background: var(--mondrian-white);">
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 800;">
          <span>DESAFÍO STEAM: CIRCUITO ELECTRÓNICO</span>
          <span id="step-indicator">1 / 2</span>
        </div>
        <div class="mondrian-progress-container">
          <div class="mondrian-progress-fill" id="progress-bar" style="width: 50%;"></div>
        </div>
      </div>

      <!-- Main Interactive Game View -->
      <main style="padding: 16px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;" id="game-screen">
        
        <!-- Challenge Statement Container -->
        <div class="mondrian-block bg-yellow" style="margin-bottom: 12px;">
          <h3 style="font-size: 0.95rem; margin-bottom: 4px;">¿Cómo evitas que el LED se queme?</h3>
          <p style="font-size: 0.8rem; line-height: 1.3;">Selecciona el componente correcto para colocar entre la batería de 9V y el diodo LED.</p>
        </div>

        <!-- Interactive Diagram / Drop Target Area -->
        <div style="border: var(--border-black); background: var(--mondrian-beige); padding: 16px; text-align: center; margin-bottom: 12px;" id="circuit-diagram">
          <div style="font-weight: 800; font-size: 0.85rem; margin-bottom: 8px;">[ Batería 9V ] ➔ [ ??? ] ➔ [ Diodo LED ]</div>
          <div id="target-slot" style="border: 2px dashed var(--mondrian-black); background: #fff; padding: 12px; font-weight: 800; font-size: 0.85rem; color: var(--mondrian-gray-dark);">
            Arrastra o toca un componente abajo
          </div>
        </div>

        <!-- Answer Option Tiles -->
        <div class="game-options-grid" id="options-container">
          <div class="game-tile" data-option="resistencia">Resistencia (220Ω)</div>
          <div class="game-tile" data-option="cable">Cable Directo</div>
          <div class="game-tile" data-option="interruptor">Interruptor Abierto</div>
          <div class="game-tile" data-option="condensador">Condensador 100uF</div>
        </div>

        <!-- Action Button -->
        <div style="margin-top: 16px;">
          <button class="mondrian-btn mondrian-btn-red mondrian-btn-full" id="btn-submit">Confirmar Respuesta</button>
        </div>
      </main>

      <!-- Virtual Tutor Mascot Widget -->
      <div class="tutor-ia-widget">
        <div class="tutor-ia-bubble" id="tutor-bubble">
          ¡Piensa bien en qué limita el flujo de corriente! ⚡
        </div>
        <div class="tutor-ia-avatar" id="tutor-avatar">IA</div>
      </div>

      <!-- Result Feedback Overlay (Hidden by Default) -->
      <div id="results-overlay" style="display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.85); z-index: 200; padding: 24px; color: #fff; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <div class="mondrian-block bg-white" style="color: #000; width: 100%;">
          <h2 style="color: var(--mondrian-black); margin-bottom: 8px;">¡Desafío Completado! 🎉</h2>
          <p style="font-size: 0.9rem; margin-bottom: 12px;">Ganaste +50 Semillas de Conocimiento</p>
          <div style="background: var(--mondrian-beige); padding: 8px; border: var(--border-black); font-size: 0.8rem; margin-bottom: 16px; text-align: left;">
            <div><strong>Tiempo:</strong> <span id="res-time">14.5s</span></div>
            <div><strong>Errores:</strong> <span id="res-errors">0</span></div>
            <div><strong>Telemetría:</strong> <span style="color: var(--status-green-border); font-weight:800;">Enviada a EducarIA ✔</span></div>
          </div>
          <a href="/aprender-ia/" class="mondrian-btn mondrian-btn-yellow mondrian-btn-full">Jugar de Nuevo</a>
        </div>
      </div>

    </div>
  </div>

  <!-- Game Logic Script -->
  <script src="/aprender-ia/game.js"></script>
</body>
</html>
```

---

### 4.3 EducarIA Teacher Dashboard Desktop View (`public/educar-ia/index.html`)

The EducarIA teacher dashboard features dynamic KPI cards, automatic polling controls, and the Semáforo table.

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EducarIA | Dashboard de Alerta Temprana</title>
  <link rel="stylesheet" href="/styles/mondrian.css">
</head>
<body>
  <!-- Header / Navigation Bar -->
  <header class="mondrian-navbar">
    <div class="mondrian-logo">
      <div class="mondrian-logo-icon">
        <div class="sq1"></div>
        <div class="sq2"></div>
        <div class="sq3"></div>
        <div class="sq4"></div>
      </div>
      <div>
        <h1 style="font-size: 1.4rem; margin: 0;">EDUCAR-IA</h1>
        <p style="font-size: 0.75rem; margin: 0; font-weight: 700;">Dashboard de Monitoreo Docente</p>
      </div>
    </div>
    <div style="display: flex; gap: 12px; align-items: center;">
      <button class="mondrian-btn mondrian-btn-yellow" id="btn-refresh" style="padding: 6px 14px; font-size: 0.85rem;">🔄 Actualizar</button>
      <a href="/" class="mondrian-btn" style="padding: 6px 14px; font-size: 0.85rem;">← Volver al Hub</a>
    </div>
  </header>

  <main class="dashboard-container">
    
    <!-- Title & Auto-Polling Indicator -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div>
        <h2>Semáforo de Riesgo Predictivo</h2>
        <p style="font-size: 0.85rem; color: var(--mondrian-gray-dark); font-weight: 700;">Monitoreo en tiempo real de telemetría cognitiva por estudiante.</p>
      </div>
      <div>
        <span class="badge-semaforo badge-verde" id="polling-status">● Polling Activo (3s)</span>
      </div>
    </div>

    <!-- Summary KPI Cards Grid -->
    <div class="kpi-grid">
      
      <div class="kpi-card" style="border-top: 6px solid var(--mondrian-blue);">
        <div class="kpi-title">Estudiantes Evaluados</div>
        <div class="kpi-value" id="kpi-total-students">0</div>
        <div style="font-size: 0.75rem; font-weight: 700; color: var(--mondrian-gray-dark);">Registrados en la sesión</div>
      </div>

      <div class="kpi-card" style="border-top: 6px solid var(--status-green-border);">
        <div class="kpi-title">Riesgo Bajo (Verde)</div>
        <div class="kpi-value" style="color: var(--status-green-border);" id="kpi-verde-count">0</div>
        <div style="font-size: 0.75rem; font-weight: 700;">Excelente desempeño</div>
      </div>

      <div class="kpi-card" style="border-top: 6px solid var(--status-yellow-border);">
        <div class="kpi-title">Riesgo Medio (Amarillo)</div>
        <div class="kpi-value" style="color: var(--status-yellow-border);" id="kpi-amarillo-count">0</div>
        <div style="font-size: 0.75rem; font-weight: 700;">Requieren monitoreo</div>
      </div>

      <div class="kpi-card" style="border-top: 6px solid var(--mondrian-red);">
        <div class="kpi-title">Riesgo Alto (Rojo)</div>
        <div class="kpi-value" style="color: var(--mondrian-red);" id="kpi-rojo-count">0</div>
        <div style="font-size: 0.75rem; font-weight: 700;">Intervención pedagógica urgente</div>
      </div>

    </div>

    <!-- Filter Bar & Table Section -->
    <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: center;">
      <span style="font-weight: 800; font-size: 0.85rem;">FILTRAR POR RIESGO:</span>
      <button class="mondrian-btn" style="padding: 4px 10px; font-size: 0.75rem;">TODOS</button>
      <button class="mondrian-btn" style="padding: 4px 10px; font-size: 0.75rem; background: var(--status-green-bg);">VERDE</button>
      <button class="mondrian-btn" style="padding: 4px 10px; font-size: 0.75rem; background: var(--status-yellow-bg);">AMARILLO</button>
      <button class="mondrian-btn" style="padding: 4px 10px; font-size: 0.75rem; background: var(--status-red-bg);">ROJO</button>
    </div>

    <!-- Telemetry Semáforo Data Table -->
    <div class="mondrian-table-container">
      <table class="mondrian-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Estudiante</th>
            <th>Juego</th>
            <th>Tiempo (ms)</th>
            <th>Errores</th>
            <th>Rage Clicks</th>
            <th>Estado</th>
            <th>Semáforo de Riesgo</th>
          </tr>
        </thead>
        <tbody id="telemetry-table-body">
          <!-- Dynamically Populated via dashboard.js -->
          <tr>
            <td colspan="8" style="text-align: center; padding: 24px; font-weight: 700; color: var(--mondrian-gray-dark);">
              Cargando telemetría desde el servidor NOMAD...
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </main>

  <!-- Dashboard Polling Script -->
  <script src="/educar-ia/dashboard.js"></script>
</body>
</html>
```
