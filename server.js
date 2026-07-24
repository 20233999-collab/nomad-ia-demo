const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public/ directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory telemetry database
let telemetryStore = [];

/**
 * Calculates Semáforo risk classification based on cognitive telemetry metrics.
 * @param {Object} data - Telemetry payload metrics
 * @returns {'VERDE' | 'AMARILLO' | 'ROJO'}
 */
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

// REST API Endpoints

/**
 * GET /api/telemetry - Retrieve all recorded telemetry data
 */
app.get('/api/telemetry', (req, res) => {
  res.status(200).json({
    success: true,
    count: telemetryStore.length,
    data: telemetryStore
  });
});

/**
 * POST /api/telemetry - Record new telemetry data from AprenderIA minigame
 */
app.post('/api/telemetry', (req, res) => {
  const {
    student_id,
    student_name,
    game_id,
    time_elapsed_ms,
    errors_count,
    rage_clicks,
    status,
    timestamp
  } = req.body;

  // Payload Validation: Missing required fields
  if (
    student_name === undefined || student_name === null || String(student_name).trim() === '' ||
    game_id === undefined || game_id === null || String(game_id).trim() === '' ||
    time_elapsed_ms === undefined || time_elapsed_ms === null || time_elapsed_ms === '' || isNaN(Number(time_elapsed_ms)) ||
    errors_count === undefined || errors_count === null || errors_count === '' || isNaN(Number(errors_count))
  ) {
    return res.status(400).json({
      success: false,
      error: 'Validation error: Missing required telemetry fields (student_name, game_id, time_elapsed_ms, errors_count)'
    });
  }

  const timeMs = Number(time_elapsed_ms);
  const errors = Number(errors_count);
  const rage = rage_clicks !== undefined && rage_clicks !== null ? Number(rage_clicks) : 0;

  if (isNaN(rage)) {
    return res.status(400).json({
      success: false,
      error: 'Validation error: rage_clicks must be a valid number'
    });
  }

  // Payload Validation: Check for negative numeric values
  if (timeMs < 0 || errors < 0 || rage < 0) {
    return res.status(400).json({
      success: false,
      error: 'Numeric fields cannot be negative'
    });
  }

  const recordId = telemetryStore.length + 1;
  const record = {
    id: recordId,
    student_id: student_id ? String(student_id).trim() : `estudiante_${String(recordId).padStart(2, '0')}`,
    student_name: String(student_name).trim(),
    game_id: String(game_id).trim(),
    time_elapsed_ms: timeMs,
    errors_count: errors,
    rage_clicks: rage,
    status: status ? String(status).trim() : 'completed',
    timestamp: timestamp ? String(timestamp).trim() : new Date().toISOString(),
    semaforo: calculateSemaforo({ time_elapsed_ms, errors_count, rage_clicks })
  };

  telemetryStore.push(record);

  return res.status(200).json({
    success: true,
    message: 'Telemetry recorded successfully',
    data: record
  });
});

/**
 * DELETE /api/telemetry - Reset telemetry store
 */
app.delete('/api/telemetry', (req, res) => {
  telemetryStore = [];
  res.status(200).json({
    success: true,
    message: 'Telemetry store reset successfully',
    count: 0
  });
});

// 404 Handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Fallback route serving public/index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Express Global Error Handler
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 NOMAD-IA Demo Hub server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
