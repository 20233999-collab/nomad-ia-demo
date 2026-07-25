const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function postTelemetry(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runAdversarialSuite() {
  console.log("=== Challenger 2 Adversarial Edge Case Suite ===");
  const results = [];

  // Helper assertion
  function recordResult(testName, passed, details) {
    results.push({ testName, passed, details });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName}: ${details}`);
  }

  // 1. Negative time payload: time_elapsed_ms: -100
  try {
    const res = await postTelemetry({
      student_id: 'adv_neg_1',
      student_name: 'Negative Time Student',
      game_id: 'aprender_ia_steam',
      time_elapsed_ms: -100,
      errors_count: 0,
      rage_clicks: 0
    });
    const passed = res.status === 400 && res.body.success === false && res.body.error === 'Numeric fields cannot be negative';
    recordResult('1. Negative time payload (-100)', passed, `Status: ${res.status}, Error msg: "${res.body.error}"`);
  } catch (err) {
    recordResult('1. Negative time payload (-100)', false, err.message);
  }

  // 2a. Boundary 19999ms (VERDE)
  try {
    const res = await postTelemetry({
      student_id: 'adv_b_19999',
      student_name: 'Boundary 19999',
      game_id: 'aprender_ia_steam',
      time_elapsed_ms: 19999,
      errors_count: 0,
      rage_clicks: 0
    });
    const passed = res.status === 200 && res.body.data && res.body.data.semaforo === 'VERDE';
    recordResult('2a. Boundary 19999ms -> VERDE', passed, `Status: ${res.status}, Semáforo: "${res.body.data?.semaforo}"`);
  } catch (err) {
    recordResult('2a. Boundary 19999ms -> VERDE', false, err.message);
  }

  // 2b. Boundary 20000ms (AMARILLO)
  try {
    const res = await postTelemetry({
      student_id: 'adv_b_20000',
      student_name: 'Boundary 20000',
      game_id: 'aprender_ia_steam',
      time_elapsed_ms: 20000,
      errors_count: 0,
      rage_clicks: 0
    });
    const passed = res.status === 200 && res.body.data && res.body.data.semaforo === 'AMARILLO';
    recordResult('2b. Boundary 20000ms -> AMARILLO', passed, `Status: ${res.status}, Semáforo: "${res.body.data?.semaforo}"`);
  } catch (err) {
    recordResult('2b. Boundary 20000ms -> AMARILLO', false, err.message);
  }

  // 2c. Boundary 40000ms (AMARILLO)
  try {
    const res = await postTelemetry({
      student_id: 'adv_b_40000',
      student_name: 'Boundary 40000',
      game_id: 'aprender_ia_steam',
      time_elapsed_ms: 40000,
      errors_count: 0,
      rage_clicks: 0
    });
    const passed = res.status === 200 && res.body.data && res.body.data.semaforo === 'AMARILLO';
    recordResult('2c. Boundary 40000ms -> AMARILLO', passed, `Status: ${res.status}, Semáforo: "${res.body.data?.semaforo}"`);
  } catch (err) {
    recordResult('2c. Boundary 40000ms -> AMARILLO', false, err.message);
  }

  // 2d. Boundary 40001ms (ROJO)
  try {
    const res = await postTelemetry({
      student_id: 'adv_b_40001',
      student_name: 'Boundary 40001',
      game_id: 'aprender_ia_steam',
      time_elapsed_ms: 40001,
      errors_count: 0,
      rage_clicks: 0
    });
    const passed = res.status === 200 && res.body.data && res.body.data.semaforo === 'ROJO';
    recordResult('2d. Boundary 40001ms -> ROJO', passed, `Status: ${res.status}, Semáforo: "${res.body.data?.semaforo}"`);
  } catch (err) {
    recordResult('2d. Boundary 40001ms -> ROJO', false, err.message);
  }

  // 2e. 2 errors (ROJO)
  try {
    const res = await postTelemetry({
      student_id: 'adv_err_2',
      student_name: 'Two Errors',
      game_id: 'aprender_ia_steam',
      time_elapsed_ms: 5000,
      errors_count: 2,
      rage_clicks: 0
    });
    const passed = res.status === 200 && res.body.data && res.body.data.semaforo === 'ROJO';
    recordResult('2e. 2 errors -> ROJO', passed, `Status: ${res.status}, Semáforo: "${res.body.data?.semaforo}"`);
  } catch (err) {
    recordResult('2e. 2 errors -> ROJO', false, err.message);
  }

  // 2f. 3 rage clicks (ROJO)
  try {
    const res = await postTelemetry({
      student_id: 'adv_rage_3',
      student_name: 'Three Rage Clicks',
      game_id: 'aprender_ia_steam',
      time_elapsed_ms: 10000,
      errors_count: 0,
      rage_clicks: 3
    });
    const passed = res.status === 200 && res.body.data && res.body.data.semaforo === 'ROJO';
    recordResult('2f. 3 rage clicks -> ROJO', passed, `Status: ${res.status}, Semáforo: "${res.body.data?.semaforo}"`);
  } catch (err) {
    recordResult('2f. 3 rage clicks -> ROJO', false, err.message);
  }

  // 3a. Missing student_name field
  try {
    const res = await postTelemetry({
      game_id: 'aprender_ia_steam',
      time_elapsed_ms: 5000,
      errors_count: 0
    });
    const passed = res.status === 400 && res.body.success === false;
    recordResult('3a. Missing student_name field', passed, `Status: ${res.status}, Error msg: "${res.body.error}"`);
  } catch (err) {
    recordResult('3a. Missing student_name field', false, err.message);
  }

  // 3b. Missing game_id field
  try {
    const res = await postTelemetry({
      student_name: 'Test Student',
      time_elapsed_ms: 5000,
      errors_count: 0
    });
    const passed = res.status === 400 && res.body.success === false;
    recordResult('3b. Missing game_id field', passed, `Status: ${res.status}, Error msg: "${res.body.error}"`);
  } catch (err) {
    recordResult('3b. Missing game_id field', false, err.message);
  }

  // 3c. Missing time_elapsed_ms field
  try {
    const res = await postTelemetry({
      student_name: 'Test Student',
      game_id: 'aprender_ia_steam',
      errors_count: 0
    });
    const passed = res.status === 400 && res.body.success === false;
    recordResult('3c. Missing time_elapsed_ms field', passed, `Status: ${res.status}, Error msg: "${res.body.error}"`);
  } catch (err) {
    recordResult('3c. Missing time_elapsed_ms field', false, err.message);
  }

  // 3d. Missing errors_count field
  try {
    const res = await postTelemetry({
      student_name: 'Test Student',
      game_id: 'aprender_ia_steam',
      time_elapsed_ms: 5000
    });
    const passed = res.status === 400 && res.body.success === false;
    recordResult('3d. Missing errors_count field', passed, `Status: ${res.status}, Error msg: "${res.body.error}"`);
  } catch (err) {
    recordResult('3d. Missing errors_count field', false, err.message);
  }

  // 4. Negative errors_count (-1)
  try {
    const res = await postTelemetry({
      student_name: 'Test Student',
      game_id: 'aprender_ia_steam',
      time_elapsed_ms: 5000,
      errors_count: -1
    });
    const passed = res.status === 400 && res.body.success === false && res.body.error === 'Numeric fields cannot be negative';
    recordResult('4. Negative errors_count (-1)', passed, `Status: ${res.status}, Error msg: "${res.body.error}"`);
  } catch (err) {
    recordResult('4. Negative errors_count (-1)', false, err.message);
  }

  // 5. Negative rage_clicks (-5)
  try {
    const res = await postTelemetry({
      student_name: 'Test Student',
      game_id: 'aprender_ia_steam',
      time_elapsed_ms: 5000,
      errors_count: 0,
      rage_clicks: -5
    });
    const passed = res.status === 400 && res.body.success === false && res.body.error === 'Numeric fields cannot be negative';
    recordResult('5. Negative rage_clicks (-5)', passed, `Status: ${res.status}, Error msg: "${res.body.error}"`);
  } catch (err) {
    recordResult('5. Negative rage_clicks (-5)', false, err.message);
  }

  const allPassed = results.every(r => r.passed);
  console.log("\nSummary:", allPassed ? "ALL ADVERSARIAL TESTS PASSED" : "SOME TESTS FAILED");
  process.exit(allPassed ? 0 : 1);
}

runAdversarialSuite();
