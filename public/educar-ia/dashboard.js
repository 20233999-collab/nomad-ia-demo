/**
 * EducarIA Teacher Dashboard (`public/educar-ia/dashboard.js`)
 * Real-time cognitive telemetry monitoring, automatic polling, and alert semáforo.
 */

// State management
let telemetryData = [];
let activeFilter = 'TODOS';
let isFetching = false;

// DOM Elements
let tableBodyEl;
let lastUpdatedEl;
let btnRefreshEl;
let kpiTotalStudentsEl;
let kpiLowRiskEl;
let kpiMediumRiskEl;
let kpiHighRiskEl;
let kpiAvgTimeEl;
let filterButtons;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize DOM references
  tableBodyEl = document.getElementById('telemetry-table-body');
  lastUpdatedEl = document.getElementById('last-updated');
  btnRefreshEl = document.getElementById('btn-refresh');
  kpiTotalStudentsEl = document.getElementById('kpi-total-students');
  kpiLowRiskEl = document.getElementById('kpi-low-risk');
  kpiMediumRiskEl = document.getElementById('kpi-medium-risk');
  kpiHighRiskEl = document.getElementById('kpi-high-risk');
  kpiAvgTimeEl = document.getElementById('kpi-avg-time');
  filterButtons = document.querySelectorAll('.filter-btn');

  // Manual Refresh listener
  if (btnRefreshEl) {
    btnRefreshEl.addEventListener('click', () => {
      fetchTelemetry();
    });
  }

  // Filter buttons listeners
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterButtons.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      activeFilter = (e.currentTarget.getAttribute('data-filter') || 'TODOS').toUpperCase();
      renderTable();
    });
  });

  // Initial telemetry fetch
  fetchTelemetry();

  // Auto-polling every 3000 ms
  setInterval(fetchTelemetry, 3000);
});

/**
 * Fetches telemetry array from GET /api/telemetry
 */
async function fetchTelemetry() {
  if (isFetching) return;
  isFetching = true;

  try {
    const response = await fetch('/api/telemetry');
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const result = await response.json();

    if (result && Array.isArray(result.data)) {
      telemetryData = result.data;
    } else if (Array.isArray(result)) {
      telemetryData = result;
    } else {
      telemetryData = [];
    }

    updateLastUpdated();
    updateKPIs();
    renderTable();
  } catch (error) {
    console.error('Error fetching telemetry:', error);
    if (telemetryData.length === 0) {
      renderErrorState();
    }
  } finally {
    isFetching = false;
  }
}

/**
 * Updates the last updated timestamp indicator
 */
function updateLastUpdated() {
  if (lastUpdatedEl) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    lastUpdatedEl.textContent = `Última actualización: ${timeStr}`;
  }
}

/**
 * Recalculates and updates KPI card values
 */
function updateKPIs() {
  if (!telemetryData || telemetryData.length === 0) {
    if (kpiTotalStudentsEl) kpiTotalStudentsEl.textContent = '0';
    if (kpiLowRiskEl) kpiLowRiskEl.textContent = '0';
    if (kpiMediumRiskEl) kpiMediumRiskEl.textContent = '0';
    if (kpiHighRiskEl) kpiHighRiskEl.textContent = '0';
    if (kpiAvgTimeEl) kpiAvgTimeEl.textContent = '0.0s';
    return;
  }

  // Count unique student IDs / names
  const uniqueStudents = new Set(telemetryData.map(item => item.student_id || item.student_name)).size;

  const lowRiskCount = telemetryData.filter(item => (item.semaforo || '').toUpperCase() === 'VERDE').length;
  const mediumRiskCount = telemetryData.filter(item => (item.semaforo || '').toUpperCase() === 'AMARILLO').length;
  const highRiskCount = telemetryData.filter(item => (item.semaforo || '').toUpperCase() === 'ROJO').length;

  const totalTimeMs = telemetryData.reduce((sum, item) => sum + (Number(item.time_elapsed_ms) || 0), 0);
  const avgTimeSec = telemetryData.length > 0 ? (totalTimeMs / telemetryData.length / 1000).toFixed(1) : '0.0';

  if (kpiTotalStudentsEl) kpiTotalStudentsEl.textContent = uniqueStudents;
  if (kpiLowRiskEl) kpiLowRiskEl.textContent = lowRiskCount;
  if (kpiMediumRiskEl) kpiMediumRiskEl.textContent = mediumRiskCount;
  if (kpiHighRiskEl) kpiHighRiskEl.textContent = highRiskCount;
  if (kpiAvgTimeEl) kpiAvgTimeEl.textContent = `${avgTimeSec}s`;
}

/**
 * Renders filtered telemetry data into the table body
 */
function renderTable() {
  if (!tableBodyEl) return;

  if (!telemetryData || telemetryData.length === 0) {
    renderEmptyState();
    return;
  }

  const filteredData = telemetryData.filter(item => {
    if (activeFilter === 'TODOS') return true;
    return (item.semaforo || '').toUpperCase() === activeFilter;
  });

  if (filteredData.length === 0) {
    renderEmptyFilterState();
    return;
  }

  const rowsHtml = filteredData.map(item => {
    const studentName = escapeHtml(item.student_name || item.student_id || 'Estudiante');
    const studentId = escapeHtml(item.student_id || '-');
    const gameId = escapeHtml(item.game_id || '-');

    const timeMs = Number(item.time_elapsed_ms) || 0;
    const formattedTime = (timeMs / 1000).toFixed(1) + 's';

    const errorsCount = Number(item.errors_count) || 0;
    const rageClicks = Number(item.rage_clicks) || 0;

    const semaforoStatus = (item.semaforo || 'VERDE').toUpperCase();
    let badgeHtml = '';
    if (semaforoStatus === 'VERDE') {
      badgeHtml = '<span class="badge badge-verde">🟢 Verde</span>';
    } else if (semaforoStatus === 'AMARILLO') {
      badgeHtml = '<span class="badge badge-amarillo">🟡 Amarillo</span>';
    } else if (semaforoStatus === 'ROJO') {
      badgeHtml = '<span class="badge badge-rojo">🔴 Rojo</span>';
    } else {
      badgeHtml = `<span class="badge badge-verde">${escapeHtml(semaforoStatus)}</span>`;
    }

    let timestampStr = '-';
    if (item.timestamp) {
      try {
        const d = new Date(item.timestamp);
        if (!isNaN(d.getTime())) {
          timestampStr = d.toLocaleTimeString() + ' (' + d.toLocaleDateString() + ')';
        } else {
          timestampStr = escapeHtml(item.timestamp);
        }
      } catch (e) {
        timestampStr = escapeHtml(item.timestamp);
      }
    }

    return `
      <tr>
        <td><strong>${studentName}</strong></td>
        <td><code>${studentId}</code></td>
        <td>${gameId}</td>
        <td>${formattedTime}</td>
        <td>${errorsCount}</td>
        <td>${rageClicks}</td>
        <td>${badgeHtml}</td>
        <td style="font-size: 0.85rem;">${timestampStr}</td>
      </tr>
    `;
  }).join('');

  tableBodyEl.innerHTML = rowsHtml;
}

/**
 * Render empty state when telemetry store is empty
 */
function renderEmptyState() {
  if (tableBodyEl) {
    tableBodyEl.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 24px; font-weight: 700;">
          No hay datos de telemetría registrados aún.
        </td>
      </tr>
    `;
  }
}

/**
 * Render empty state when active risk filter produces zero matches
 */
function renderEmptyFilterState() {
  if (tableBodyEl) {
    tableBodyEl.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 24px; font-weight: 700;">
          No hay registros que coincidan con el filtro "${escapeHtml(activeFilter)}".
        </td>
      </tr>
    `;
  }
}

/**
 * Render error message state
 */
function renderErrorState() {
  if (tableBodyEl) {
    tableBodyEl.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 24px; font-weight: 700; color: var(--mondrian-red);">
          ⚠️ Error al conectar con la API de telemetría. Reintentando...
        </td>
      </tr>
    `;
  }
}

/**
 * HTML escape utility to prevent XSS
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
