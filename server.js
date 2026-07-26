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
 * POST /api/chat - Interactive AI Tutor endpoint for Chancay Assistant
 */
app.post('/api/chat', (req, res) => {
  const { message, student_name } = req.body;
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Validation error: message parameter is required'
    });
  }

  const query = message.toLowerCase().trim();
  let reply = '';
  let pose = 'default';
  let badge = 'SABIDURÍA';
  let suggestedTopic = '¿Qué son los Gases Nobles?';
  let audioUrl = null;

  if (query.includes('gas') || query.includes('noble') || query.includes('quimic') || query.includes('element') || query.includes('lab') || query.includes('vaso')) {
    reply = "¡Excelente pregunta científica! 🧪 Los Gases Nobles (como el Helio, Neón y Argón) son elementos con su última capa electrónica completa, por lo que casi no reaccionan con otros. ¡Son los más estables de la tabla periódica!";
    pose = "vaso";
    badge = "QUÍMICA";
    suggestedTopic = "¿Qué son los Metales Alcalinos?";
    audioUrl = "/chancay/audio/gases-nobles.mp3";
  } else if (query.includes('ia') || query.includes('inteligencia') || query.includes('robot') || query.includes('nomad') || query.includes('tecnolog')) {
    reply = "¡La Inteligencia Artificial es como un superpoder para aprender! 🤖 En el ecosistema NOMAD-IA, procesamos todo de forma local y offline en la maleta tecnológica para ayudarte a resolver dudas sin internet.";
    pose = "emocionado";
    badge = "TECNOLOGÍA";
    suggestedTopic = "¿Cómo funciona el modo offline?";
    audioUrl = "/chancay/audio/inteligencia-artificial.mp3";
  } else if (query.includes('hola') || query.includes('buen') || query.includes('saludo') || query.includes('chancay') || query.includes('quien eres')) {
    reply = "¡Hola Mateo! ¡Qué alegría verte por aquí! 🐹🇵🇪 Soy Chancay, tu tutor virtual de MINEDU. Puedes preguntarme sobre tus tareas, experimentos o sobre tus minijuegos favoritos.";
    pose = "coqueto";
    badge = "SALUDO";
    suggestedTopic = "¿Por qué la ciencia es divertida?";
    audioUrl = "/chancay/audio/saludo.mp3";
  } else if (query.includes('mate') || query.includes('calcul') || query.includes('triangul') || query.includes('area') || query.includes('num')) {
    reply = "¡Las matemáticas son pura magia! 📐 Por ejemplo, para calcular el área de un triángulo usas: (Base × Altura) ÷ 2. Si la base es 10 cm y la altura 6 cm, ¡el área es 30 cm²!";
    pose = "thinking";
    badge = "MATEMÁTICA";
    suggestedTopic = "¿Dame un acertijo matemático?";
  } else if (query.includes('peru') || query.includes('historia') || query.includes('inca') || query.includes('cultur') || query.includes('lima')) {
    reply = "¡El Perú es un país milenario increíble! 🇵🇪 Desde Caral (la civilización más antigua de América) hasta el imperio de los Incas y Machu Picchu, nuestra historia está llena de grandes inventos y saberes.";
    pose = "alegria";
    badge = "HISTORIA";
    suggestedTopic = "¿Quiénes construyeron Caral?";
  } else if (query.includes('felic') || query.includes('gane') || query.includes('puntos') || query.includes('bien') || query.includes('logro') || query.includes('dab')) {
    reply = "¡ESO ES TODO, CAMPEÓN! 🔥 ¡DAB PARA TI! Has demostrado una enorme concentración y curiosidad. ¡Sigue así y acumularás muchísimos Intis 🪙!";
    pose = "dab";
    badge = "LOGRO";
    suggestedTopic = "¿Cómo gano más Intis 🪙?";
    audioUrl = "/chancay/audio/felicitaciones.mp3";

  } else if (query.includes('triste') || query.includes('dificil') || query.includes('no puedo') || query.includes('error') || query.includes('mal')) {
    reply = "No te me desanimes, Mateo. 💙 En la ciencia y en la vida, los errores son solo los primeros pasos hacia un gran descubrimiento. ¡Respira profundo e inténtalo una vez más!";
    pose = "triste";
    badge = "ÁNIMO";
    suggestedTopic = "¿Qué hago si me equivoco en el juego?";
  } else {
    reply = `¡Qué interesante pregunta sobre "${message.trim()}"! 💡 Como tutor de NOMAD-IA, me encanta investigar contigo. Recuerda que la curiosidad es el motor del aprendizaje. ¡Hagamos otro experimento juntos!`;
    pose = "enamorado";
    badge = "EXPLORACIÓN";
    suggestedTopic = "¿Qué son los Gases Nobles?";
  }

  // Record Telemetry quietly for teacher dashboard
  telemetryStore.push({
    id: telemetryStore.length + 1,
    student_id: 'estudiante_01',
    student_name: student_name || 'Mateo Rossi',
    game_id: 'chat-chancay',
    time_elapsed_ms: 1200,
    errors_count: 0,
    rage_clicks: 0,
    status: 'completed',
    timestamp: new Date().toISOString(),
    semaforo: 'VERDE'
  });

  return res.status(200).json({
    success: true,
    data: {
      reply,
      pose,
      badge,
      suggestedTopic,
      audioUrl,
      studentName: student_name || 'Mateo Rossi',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
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

// Start Server if executed directly (Bound to 0.0.0.0 for Intranet Wi-Fi Access)
if (require.main === module) {
  const os = require('os');
  function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
    return '127.0.0.1';
  }

  app.listen(PORT, '0.0.0.0', () => {
    const localIp = getLocalIpAddress();
    console.log('\n==================================================================');
    console.log('📡 SERVIDOR INTRANET NOMAD-IA (MALETA TECNOLÓGICA OFFLINE)');
    console.log('==================================================================');
    console.log(` 💻 Servidor Laptop:  http://localhost:${PORT}`);
    console.log(` 📱 Acceso desde Tablet en la Intranet Wi-Fi (Sin Internet):`);
    console.log(`    👉 http://${localIp}:${PORT}/aprender-ia/index.html`);
    console.log('==================================================================\n');
  });
}

module.exports = app;

