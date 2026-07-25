/**
 * YACHAY - Motor de Juego Mondrian con Mascot Chancay
 * Configurado estrictamente con Intis (Sol ☀️) en todas las pantallas.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado Global del Juego
  const state = {
    theme: localStorage.getItem('yachay_theme') || 'light',
    currentScreen: 'onboardStep1',
    onboardStep: 1,
    currentQuestionIndex: 0,
    intis: 120,
    streak: 3,
    errors: 0,
    startTime: null,
    selectedOption: null,
    questions: [
      {
        id: 'q1',
        type: 'science',
        chancayPose: '/images/chancay/CHANCAY DEFAULT 2.png',
        dialogue: '¡Hola! Para encender el faro del laboratorio sin quemar el LED, ¿qué componente necesitamos agregar al circuito?',
        title: 'Selecciona el componente eléctrico correcto:',
        options: [
          { id: 'opt_resistencia', mainText: 'Resistencia 220Ω', subText: 'Limita el flujo de corriente eléctrica', correct: true, icon: '⚡' },
          { id: 'opt_madera', mainText: 'Interruptor de Madera', subText: 'Material aislante de baja conducción', correct: false, icon: '🪵' },
          { id: 'opt_cable', mainText: 'Cable Desnudo', subText: 'Conduce corriente sin protección', correct: false, icon: '🔌' }
        ],
        explanation: '¡Excelente! La Resistencia limita el paso de la corriente y protege los componentes.'
      },
      {
        id: 'q2',
        type: 'math',
        chancayPose: '/images/chancay/CHANCAY EMOCIONADO.png',
        dialogue: '¡Ayúdame a calcular! El puente colgante soporta 150 kg máximo. Si Chancay pesa 15 kg, ¿cuántos sacos de Intis de 25 kg puede llevar?',
        title: 'Resuelve el cálculo de carga en el puente:',
        options: [
          { id: 'opt_5', mainText: '5 Sacos de Intis', subText: 'Carga total de 140 kg (Seguro)', correct: true, icon: '☀️' },
          { id: 'opt_7', mainText: '7 Sacos de Intis', subText: 'Carga total de 190 kg (Peligro)', correct: false, icon: '❌' },
          { id: 'opt_10', mainText: '10 Sacos de Intis', subText: 'Carga total de 265 kg (Exceso)', correct: false, icon: '💥' }
        ],
        explanation: '¡Gran cálculo! 15 kg + (5 × 25 kg) = 140 kg, perfectamente seguro bajo el límite de 150 kg.'
      },
      {
        id: 'q3',
        type: 'algorithm',
        chancayPose: '/images/chancay/CHANCAY DAB.png',
        dialogue: '¡Programación en marcha! Ayuda a Chancay a ordenar la secuencia lógica de exploración:',
        title: 'Ordena la secuencia del algoritmo:',
        options: [
          { id: 'opt_seq1', mainText: 'Avanzar ➔ Tomar Inti ➔ Regresar', subText: 'Secuencia óptima sin fallos', correct: true, icon: '☀️' },
          { id: 'opt_seq2', mainText: 'Girar ➔ Regresar ➔ Avanzar', subText: 'Secuencia desordenada', correct: false, icon: '🌀' }
        ],
        explanation: '¡Excelente lógica! La secuencia ordenada garantiza la exploración exitosa.'
      }
    ]
  };

  // Elementos DOM
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const btnCloseScreen = document.getElementById('btnCloseScreen');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressBarWrapper = document.getElementById('progressWrapper');
  const progressDetailText = document.getElementById('progressDetailText');

  // Pantallas
  const onboardStep1 = document.getElementById('onboardStep1');
  const onboardStep2 = document.getElementById('onboardStep2');
  const onboardStep3 = document.getElementById('onboardStep3');
  const onboardStep4 = document.getElementById('onboardStep4');
  const screenPath = document.getElementById('screenPath');
  const screenGame = document.getElementById('screenGame');
  const screenSummary = document.getElementById('screenSummary');

  // Botones Onboarding
  const btnOnboard1 = document.getElementById('btnOnboard1');
  const btnOnboard2 = document.getElementById('btnOnboard2');
  const btnOnboard3 = document.getElementById('btnOnboard3');
  const btnOnboard4 = document.getElementById('btnOnboard4');

  // Botones Juego
  const btnStartLesson = document.getElementById('btnStartLesson');
  const btnNode1 = document.getElementById('btnNode1');
  const btnNode2 = document.getElementById('btnNode2');
  const btnNode3 = document.getElementById('btnNode3');
  const btnNode4 = document.getElementById('btnNode4');
  const btnNodeChest = document.getElementById('btnNodeChest');
  const btnCheck = document.getElementById('btnCheck');
  const btnRestart = document.getElementById('btnRestart');

  // Componentes de Pregunta
  const chancayAvatar = document.getElementById('chancayAvatar');
  const speechBubbleText = document.getElementById('speechBubbleText');
  const questionTitle = document.getElementById('questionTitle');
  const optionsGrid = document.getElementById('optionsGrid');

  // Drawer
  const feedbackDrawer = document.getElementById('feedbackDrawer');
  const feedbackIcon = document.getElementById('feedbackIcon');
  const feedbackTitle = document.getElementById('feedbackTitle');
  const feedbackText = document.getElementById('feedbackText');
  const btnFeedbackNext = document.getElementById('btnFeedbackNext');

  // Badges Resumen
  const summaryIntis = document.getElementById('summaryIntis');
  const summaryAccuracy = document.getElementById('summaryAccuracy');
  const summaryTime = document.getElementById('summaryTime');

  // Aplicar Tema
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('yachay_theme', theme);
    btnThemeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
  }
  applyTheme(state.theme);

  btnThemeToggle.addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  // Mostrar Pantalla
  function showScreen(screenId) {
    state.currentScreen = screenId;
    [onboardStep1, onboardStep2, onboardStep3, onboardStep4, screenPath, screenGame, screenSummary].forEach(s => s.classList.remove('active'));

    if (screenId.startsWith('onboardStep')) {
      const stepNum = parseInt(screenId.replace('onboardStep', ''), 10);
      progressBarWrapper.style.visibility = 'visible';
      progressBarFill.style.width = `${(stepNum / 4) * 100}%`;
      progressDetailText.textContent = `PASO ${stepNum} DE 4`;
      const el = document.getElementById(screenId);
      if (el) el.classList.add('active');
    } else if (screenId === 'path') {
      screenPath.classList.add('active');
      progressBarWrapper.style.visibility = 'hidden';
    } else if (screenId === 'game') {
      screenGame.classList.add('active');
      progressBarWrapper.style.visibility = 'visible';
      loadQuestion(state.currentQuestionIndex);
    } else if (screenId === 'summary') {
      screenSummary.classList.add('active');
      progressBarWrapper.style.visibility = 'hidden';
      renderSummary();
    }
  }

  // Cargar Pregunta
  function loadQuestion(index) {
    const q = state.questions[index];
    state.selectedOption = null;

    chancayAvatar.src = q.chancayPose;
    speechBubbleText.textContent = q.dialogue;
    questionTitle.textContent = q.title;

    const currentStepNum = index + 1;
    const totalQuestions = state.questions.length;
    const progressPercent = Math.round((currentStepNum / totalQuestions) * 100);
    
    progressBarFill.style.width = `${progressPercent}%`;
    progressDetailText.textContent = `RETO ${currentStepNum} DE ${totalQuestions}`;

    optionsGrid.innerHTML = '';
    btnCheck.disabled = true;
    feedbackDrawer.classList.remove('active', 'correct', 'incorrect');

    q.options.forEach(opt => {
      const card = document.createElement('div');
      card.className = 'card-option-clean';
      card.dataset.id = opt.id;
      card.innerHTML = `
        <div class="option-icon-square blue">${opt.icon}</div>
        <div style="display: flex; flex-direction: column;">
          <span style="font-family: var(--font-heading); font-weight: 700; font-size: 1rem; color: var(--text-main);">${opt.mainText}</span>
          <span style="font-size: 0.82rem; color: var(--text-muted);">${opt.subText}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.card-option-clean').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        state.selectedOption = opt;
        btnCheck.disabled = false;
      });

      optionsGrid.appendChild(card);
    });
  }

  // Onboarding Step Flow
  btnOnboard1.addEventListener('click', () => showScreen('onboardStep2'));
  btnOnboard2.addEventListener('click', () => showScreen('onboardStep3'));
  btnOnboard3.addEventListener('click', () => showScreen('onboardStep4'));
  btnOnboard4.addEventListener('click', () => showScreen('path'));

  // Game Flow & Node Interactions
  btnStartLesson.addEventListener('click', startLesson);
  if (btnNode1) btnNode1.addEventListener('click', startLesson);
  if (btnNode2) btnNode2.addEventListener('click', startLesson);
  if (btnNode3) btnNode3.addEventListener('click', startLesson);
  if (btnNode4) btnNode4.addEventListener('click', startLesson);
  if (btnNodeChest) btnNodeChest.addEventListener('click', () => alert('📦 ¡Desbloqueaste +20 Intis del Cofre de Recompensas!'));

  function startLesson() {
    state.currentQuestionIndex = 0;
    state.errors = 0;
    state.startTime = Date.now();
    showScreen('game');
  }

  btnCloseScreen.addEventListener('click', () => {
    if (state.currentScreen === 'game') {
      showScreen('path');
    } else {
      window.location.href = '/aprender-ia/index.html';
    }
  });

  // Validar Respuesta
  btnCheck.addEventListener('click', () => {
    if (!state.selectedOption) return;

    const q = state.questions[state.currentQuestionIndex];
    const isCorrect = state.selectedOption.correct;

    feedbackDrawer.className = `feedback-sheet-clean active ${isCorrect ? 'correct' : 'incorrect'}`;

    if (isCorrect) {
      chancayAvatar.src = '/images/chancay/CHANCAY SALTANDO ALEGRIA.png';
      feedbackIcon.textContent = '🎉';
      feedbackTitle.textContent = '¡Excelente Trabajo!';
      feedbackText.textContent = q.explanation;
      state.intis += 10;
      document.getElementById('intisCount').textContent = state.intis;
    } else {
      chancayAvatar.src = '/images/chancay/CHANCAY TRISTE.png';
      state.errors += 1;
      feedbackIcon.textContent = '💡';
      feedbackTitle.textContent = '¡Casi lo logras!';
      feedbackText.textContent = `Pista: La respuesta sugerida es "${q.options.find(o => o.correct).mainText}".`;
    }
  });

  btnFeedbackNext.addEventListener('click', () => {
    feedbackDrawer.classList.remove('active');
    state.currentQuestionIndex++;

    if (state.currentQuestionIndex < state.questions.length) {
      loadQuestion(state.currentQuestionIndex);
    } else {
      showScreen('summary');
    }
  });

  // Resumen Final y Telemetría
  function renderSummary() {
    const elapsedSec = Math.max(1, Math.round((Date.now() - state.startTime) / 1000));
    const elapsedMs = elapsedSec * 1000;
    const accuracy = Math.max(0, Math.round(((state.questions.length - state.errors) / state.questions.length) * 100));

    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    const timeFormatted = mins > 0 ? `${mins}:${secs < 10 ? '0' : ''}${secs}` : `${elapsedSec}s`;

    summaryIntis.textContent = `+30`;
    summaryAccuracy.textContent = `${accuracy}%`;
    summaryTime.textContent = timeFormatted;

    const payload = {
      student_id: 'estudiante_01',
      student_name: 'Mateo Rossi',
      game_id: 'yachay_chancay_duolingo',
      time_elapsed_ms: elapsedMs,
      errors_count: state.errors,
      rage_clicks: 0,
      status: 'completed',
      timestamp: new Date().toISOString()
    };

    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(d => console.log('📡 Telemetría registrada en EducarIA:', d))
    .catch(e => console.error('⚠️ Error de telemetría:', e));
  }

  btnRestart.addEventListener('click', () => showScreen('path'));
});
