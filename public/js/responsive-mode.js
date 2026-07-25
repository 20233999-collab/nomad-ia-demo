// Sistema de Persistencia de Modo de Vista (Teléfono / Tablet / Pantalla Completa)
(function() {
  function applySavedMode() {
    const savedMode = localStorage.getItem('nomad_screen_mode') || 'phone';
    const body = document.body;
    const btn = document.getElementById('toggle-view-btn');

    body.classList.remove('mode-tablet', 'mode-fullscreen');

    if (savedMode === 'tablet') {
      body.classList.add('mode-tablet');
      if (btn) btn.innerHTML = '<span>📟 Modo: Tablet Mateo</span>';
    } else if (savedMode === 'fullscreen') {
      body.classList.add('mode-fullscreen');
      if (btn) btn.innerHTML = '<span>🖥️ Pantalla Completa</span>';
    } else {
      if (btn) btn.innerHTML = '<span>📱 Modo: Teléfono</span>';
    }
  }

  // Ejecuta al cargar la página
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applySavedMode);
  } else {
    applySavedMode();
  }

  // Función global para alternar y guardar en localStorage
  window.toggleScreenMode = function() {
    const currentMode = localStorage.getItem('nomad_screen_mode') || 'phone';
    let newMode = 'phone';

    if (currentMode === 'phone') {
      newMode = 'tablet';
    } else if (currentMode === 'tablet') {
      newMode = 'fullscreen';
    } else {
      newMode = 'phone';
    }

    localStorage.setItem('nomad_screen_mode', newMode);
    applySavedMode();
  };
})();
