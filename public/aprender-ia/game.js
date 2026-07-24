/**
 * AprenderIA Minigame Prototype (`public/aprender-ia/game.js`)
 * Real-time telemetry tracking & interactive STEAM game logic.
 */

// Telemetry & Game State
let startTime = 0;
let errorsCount = 0;
let rageClicksCount = 0;
let clickHistory = [];
let currentStep = 1;
let selectedOption = null;
let seedsCount = 100;

// Challenge Definitions
const stepsData = {
  1: {
    title: "DESAFÍO STEAM: CIRCUITO ELECTRÓNICO",
    indicator: "1 / 2",
    progress: "50%",
    questionTitle: "¿Cómo evitas que el LED se queme?",
    questionDesc: "Selecciona el componente correcto para colocar entre la batería de 9V y el diodo LED.",
    diagramSchema: "[ Batería 9V ] ➔ [ ??? ] ➔ [ Diodo LED ]",
    correctOption: "resistencia",
    options: [
      { key: "resistencia", label: "Resistencia (220Ω)" },
      { key: "cable", label: "Cable Directo" },
      { key: "interruptor", label: "Interruptor Abierto" },
      { key: "condensador", label: "Condensador 100uF" }
    ],
    hints: {
      cable: "Sin resistencia, ¡demasiada corriente quemará el LED! 💥",
      interruptor: "Un interruptor abierto no permite el paso de corriente. 🔌",
      condensador: "El condensador almacena carga, pero no limita la corriente adecuadamente. 🔋",
      default: "Recuerda que necesitamos limitar el flujo de corriente para proteger el LED. ⚡"
    },
    tutorInitial: "¡Piensa bien en qué limita el flujo de corriente! ⚡"
  },
  2: {
    title: "DESAFÍO STEAM: ALGORITMO MARS ROVER",
    indicator: "2 / 2",
    progress: "100%",
    questionTitle: "¡Programando el Rover en Marte!",
    questionDesc: "El Mars Rover debe esquivar una roca. ¿Cuál secuencia de comandos lo llevará a la meta de forma segura?",
    diagramSchema: "[ Salida ] ➔ 🪨 [ Obstáculo ] ➔ 🏁 [ Meta ]",
    correctOption: "rover-correct",
    options: [
      { key: "rover-correct", label: "Avanzar 1 ➔ Derecha ➔ Avanzar 1 ➔ Izquierda ➔ Avanzar 1" },
      { key: "rover-crash", label: "Avanzar 2 Directo" },
      { key: "rover-back", label: "Girar 180° y Retroceder" },
      { key: "rover-stop", label: "Detener Motor" }
    ],
    hints: {
      "rover-crash": "¡El Rover chocaría directo contra la roca! 🪨",
      "rover-back": "¡El Rover se está alejando de la meta! 🗺️",
      "rover-stop": "¡El Rover se quedó detenido sin llegar a la meta! 🛑",
      default: "Prueba bordear el obstáculo girando a la derecha y luego a la izquierda. 🤖"
    },
    tutorInitial: "¡Analiza la ruta para rodear el obstáculo de forma segura! 🤖"
  }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initRageClickTracker();
  initGame();
  attachEventListeners();
});

/**
 * Real-time Rage Click Telemetry Tracker (Sliding window <= 500ms)
 */
function initRageClickTracker() {
  window.addEventListener('click', () => {
    const now = Date.now();
    clickHistory.push(now);
    // Keep only clicks within last 500ms
    clickHistory = clickHistory.filter(t => now - t <= 500);
    
    if (clickHistory.length >= 3) {
      rageClicksCount++;
      clickHistory = []; // Reset window after recording a rage click event
      showTutorCalmFeedback();
    }
  }, true);
}

/**
 * Start or reset game state
 */
function initGame() {
  startTime = Date.now();
  errorsCount = 0;
  rageClicksCount = 0;
  clickHistory = [];
  currentStep = 1;
  seedsCount = 100;
  selectedOption = null;

  updateSeedsDisplay();
  loadStep(1);
}

/**
 * Load UI for specific step
 */
function loadStep(stepNumber) {
  currentStep = stepNumber;
  selectedOption = null;
  const step = stepsData[stepNumber];

  document.getElementById('challenge-title').textContent = step.title;
  document.getElementById('step-indicator').textContent = step.indicator;
  document.getElementById('progress-bar').style.width = step.progress;
  document.getElementById('question-title').textContent = step.questionTitle;
  document.getElementById('question-desc').textContent = step.questionDesc;
  document.getElementById('diagram-schema').textContent = step.diagramSchema;

  const targetSlot = document.getElementById('target-slot');
  targetSlot.textContent = "Arrastra o toca un componente abajo";
  targetSlot.style.borderColor = "var(--mondrian-black)";

  // Render option tiles
  const optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';
  step.options.forEach(opt => {
    const tile = document.createElement('div');
    tile.className = 'game-tile';
    tile.dataset.option = opt.key;
    tile.textContent = opt.label;
    tile.addEventListener('click', () => {
      selectOption(opt.key, opt.label, tile);
    });
    optionsContainer.appendChild(tile);
  });

  showTutorMessage(step.tutorInitial);
}

/**
 * Option selection logic
 */
function selectOption(key, label, tileElem) {
  selectedOption = key;

  // Clear previous selections
  document.querySelectorAll('.game-tile').forEach(t => t.classList.remove('selected'));
  tileElem.classList.add('selected');

  // Update target slot display
  const targetSlot = document.getElementById('target-slot');
  targetSlot.textContent = `[ ${label} ]`;
  targetSlot.style.borderColor = "var(--mondrian-blue)";
}

/**
 * Attach global buttons and interaction listeners
 */
function attachEventListeners() {
  document.getElementById('btn-submit').addEventListener('click', () => {
    handleSubmitAnswer();
  });

  document.getElementById('btn-restart').addEventListener('click', () => {
    document.getElementById('results-overlay').style.display = 'none';
    initGame();
  });
}

/**
 * Answer submission handler
 */
function handleSubmitAnswer() {
  const step = stepsData[currentStep];

  if (!selectedOption) {
    showTutorMessage("¡Selecciona una opción antes de confirmar! 👆", true);
    return;
  }

  if (selectedOption === step.correctOption) {
    // Correct Answer
    seedsCount += 25;
    updateSeedsDisplay();

    if (currentStep === 1) {
      showTutorMessage("¡Excelente! 🎉 Siguiente nivel: Programa el Mars Rover. 🚀");
      setTimeout(() => {
        loadStep(2);
      }, 1000);
    } else {
      completeGame();
    }
  } else {
    // Wrong Answer
    errorsCount++;
    const hintText = step.hints[selectedOption] || step.hints.default;
    showTutorMessage(hintText, true);

    const targetSlot = document.getElementById('target-slot');
    targetSlot.style.borderColor = "var(--mondrian-red)";
  }
}

/**
 * Update seeds display
 */
function updateSeedsDisplay() {
  const seedsElem = document.getElementById('seeds-count');
  if (seedsElem) {
    seedsElem.textContent = seedsCount;
  }
}

/**
 * Tutor IA Message Display
 */
function showTutorMessage(text, isWarning = false) {
  const bubble = document.getElementById('tutor-bubble');
  if (!bubble) return;

  bubble.textContent = text;
  if (isWarning) {
    bubble.style.backgroundColor = "var(--status-yellow-bg)";
    bubble.style.borderColor = "var(--mondrian-red)";
  } else {
    bubble.style.backgroundColor = "var(--mondrian-white)";
    bubble.style.borderColor = "var(--mondrian-black)";
  }
}

/**
 * Special Tutor feedback on Rage Clicks
 */
function showTutorCalmFeedback() {
  showTutorMessage("¡Mantén la calma! Tómate un momento para analizar el problema. 🧘‍♂️", true);
}

/**
 * Local Semáforo calculator fallback (mirrors backend logic)
 */
function calculateLocalSemaforo(errors, rageClicks, timeMs) {
  if (errors > 2 || rageClicks > 2 || timeMs > 45000) return 'ROJO';
  if (errors >= 1 || rageClicks >= 1 || timeMs > 25000) return 'AMARILLO';
  return 'VERDE';
}

/**
 * Game Completion & Silent Async Telemetry Submission
 */
function completeGame() {
  const timeElapsedMs = Math.max(1000, Date.now() - startTime);
  const studentNameDisplay = document.getElementById('student-name-display');
  const studentName = studentNameDisplay ? studentNameDisplay.textContent.trim() || 'Mateo Rossi' : 'Mateo Rossi';

  const payload = {
    student_id: `est_${Date.now().toString(36)}`,
    student_name: studentName,
    game_id: 'aprender_ia_steam',
    time_elapsed_ms: timeElapsedMs,
    errors_count: errorsCount,
    rage_clicks: rageClicksCount,
    status: 'completed',
    timestamp: new Date().toISOString()
  };

  // Populate victory overlay values immediately
  document.getElementById('res-student-name').textContent = studentName;
  document.getElementById('res-time').textContent = `${(timeElapsedMs / 1000).toFixed(1)}s`;
  document.getElementById('res-errors').textContent = errorsCount;
  document.getElementById('res-rage').textContent = rageClicksCount;

  const telemetryStatusElem = document.getElementById('res-telemetry-status');
  telemetryStatusElem.textContent = 'Enviando a EducarIA...';
  telemetryStatusElem.style.color = 'var(--mondrian-gray-dark)';

  // Display victory screen overlay
  const resultsOverlay = document.getElementById('results-overlay');
  resultsOverlay.style.display = 'flex';

  // Silent Async POST submit to /api/telemetry
  fetch('/api/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    if (data.success && data.data) {
      const semaforo = data.data.semaforo || calculateLocalSemaforo(errorsCount, rageClicksCount, timeElapsedMs);
      updateSemaforoBadge(semaforo);
      telemetryStatusElem.textContent = 'Enviado a EducarIA ✔';
      telemetryStatusElem.style.color = 'var(--status-green-border)';
    } else {
      throw new Error('Invalid backend response');
    }
  })
  .catch(err => {
    console.warn('Offline telemetry fallback:', err);
    const fallbackSemaforo = calculateLocalSemaforo(errorsCount, rageClicksCount, timeElapsedMs);
    updateSemaforoBadge(fallbackSemaforo);
    telemetryStatusElem.textContent = 'Almacenado localmente (Offline) ⚠️';
    telemetryStatusElem.style.color = 'var(--status-yellow-text)';
  });
}

/**
 * Update Victory Overlay Semáforo Badge
 */
function updateSemaforoBadge(semaforo) {
  const badgeElem = document.getElementById('res-status-badge');
  if (!badgeElem) return;

  badgeElem.className = 'badge-semaforo';
  if (semaforo === 'ROJO') {
    badgeElem.classList.add('badge-rojo');
    badgeElem.textContent = '🔴 ROJO';
  } else if (semaforo === 'AMARILLO') {
    badgeElem.classList.add('badge-amarillo');
    badgeElem.textContent = '🟡 AMARILLO';
  } else {
    badgeElem.classList.add('badge-verde');
    badgeElem.textContent = '🟢 VERDE';
  }
}
