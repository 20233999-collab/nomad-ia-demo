#!/usr/bin/env node

/**
 * Standalone E2E Verification Script for NOMAD-IA Express Backend
 * Location: /home/laptop/Documentos/mvp-hackaton-minedu/verify.js
 *
 * Verifies telemetry endpoints, Semáforo boundary conditions, payload validation,
 * and static UI endpoints ('/', '/aprender-ia/', '/educar-ia/').
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function runVerification() {
  console.log(`\n======================================================`);
  console.log(`🚀 Starting Programmatic E2E Verification against ${BASE_URL}`);
  console.log(`======================================================\n`);

  const failures = [];

  function assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion Failed: ${message}`);
    }
  }

  // 1. Test VERDE boundary: time_elapsed_ms: 19999, errors_count: 0, rage_clicks: 0 -> VERDE
  try {
    console.log(`[TEST 1] POST /api/telemetry (VERDE Boundary: time=19999, errors=0, rage=0)...`);
    const payloadVerde = {
      student_id: "test_v1",
      student_name: "Verde Boundary Test",
      game_id: "aprender_ia_steam",
      time_elapsed_ms: 19999,
      errors_count: 0,
      rage_clicks: 0,
      status: "completed"
    };

    const res1 = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadVerde)
    });

    assert(res1.status === 200, `Expected HTTP status 200 OK, received ${res1.status}`);
    const data1 = await res1.json();
    assert(data1.success === true, `Expected success to be true, received ${data1.success}`);
    assert(data1.data && data1.data.semaforo === 'VERDE', `Expected semaforo 'VERDE', received '${data1.data?.semaforo}'`);

    console.log(`  ✅ Passed: VERDE boundary verified (semaforo === 'VERDE')\n`);
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}\n`);
    failures.push(`Test 1 (VERDE boundary): ${err.message}`);
  }

  // 2. Test AMARILLO boundary (lower): time_elapsed_ms: 20000, errors_count: 0 -> AMARILLO
  try {
    console.log(`[TEST 2] POST /api/telemetry (AMARILLO Boundary Lower: time=20000, errors=0)...`);
    const payloadAmarilloLow = {
      student_id: "test_a_low",
      student_name: "Amarillo Low Boundary Test",
      game_id: "aprender_ia_steam",
      time_elapsed_ms: 20000,
      errors_count: 0,
      rage_clicks: 0
    };

    const res2 = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadAmarilloLow)
    });

    assert(res2.status === 200, `Expected HTTP status 200 OK, received ${res2.status}`);
    const data2 = await res2.json();
    assert(data2.success === true, `Expected success to be true, received ${data2.success}`);
    assert(data2.data && data2.data.semaforo === 'AMARILLO', `Expected semaforo 'AMARILLO', received '${data2.data?.semaforo}'`);

    console.log(`  ✅ Passed: AMARILLO lower boundary verified (semaforo === 'AMARILLO')\n`);
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}\n`);
    failures.push(`Test 2 (AMARILLO lower boundary): ${err.message}`);
  }

  // 3. Test AMARILLO boundary (upper): time_elapsed_ms: 40000, errors_count: 0 -> AMARILLO
  try {
    console.log(`[TEST 3] POST /api/telemetry (AMARILLO Boundary Upper: time=40000, errors=0)...`);
    const payloadAmarilloHigh = {
      student_id: "test_a_high",
      student_name: "Amarillo High Boundary Test",
      game_id: "aprender_ia_steam",
      time_elapsed_ms: 40000,
      errors_count: 0
    };

    const res3 = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadAmarilloHigh)
    });

    assert(res3.status === 200, `Expected HTTP status 200 OK, received ${res3.status}`);
    const data3 = await res3.json();
    assert(data3.success === true, `Expected success to be true, received ${data3.success}`);
    assert(data3.data && data3.data.semaforo === 'AMARILLO', `Expected semaforo 'AMARILLO', received '${data3.data?.semaforo}'`);

    console.log(`  ✅ Passed: AMARILLO upper boundary verified (semaforo === 'AMARILLO')\n`);
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}\n`);
    failures.push(`Test 3 (AMARILLO upper boundary): ${err.message}`);
  }

  // 4. Test ROJO boundary (time): time_elapsed_ms: 40001, errors_count: 0 -> ROJO
  try {
    console.log(`[TEST 4] POST /api/telemetry (ROJO Boundary Time: time=40001, errors=0)...`);
    const payloadRojoTime = {
      student_id: "test_r_time",
      student_name: "Rojo Time Boundary Test",
      game_id: "aprender_ia_steam",
      time_elapsed_ms: 40001,
      errors_count: 0
    };

    const res4 = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadRojoTime)
    });

    assert(res4.status === 200, `Expected HTTP status 200 OK, received ${res4.status}`);
    const data4 = await res4.json();
    assert(data4.success === true, `Expected success to be true, received ${data4.success}`);
    assert(data4.data && data4.data.semaforo === 'ROJO', `Expected semaforo 'ROJO', received '${data4.data?.semaforo}'`);

    console.log(`  ✅ Passed: ROJO time boundary verified (semaforo === 'ROJO')\n`);
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}\n`);
    failures.push(`Test 4 (ROJO time boundary): ${err.message}`);
  }

  // 5. Test ROJO boundary (errors): errors_count: 2, time_elapsed_ms: 5000 -> ROJO
  try {
    console.log(`[TEST 5] POST /api/telemetry (ROJO Boundary Errors: errors=2, time=5000)...`);
    const payloadRojoErrors = {
      student_id: "test_r_errors",
      student_name: "Rojo Errors Boundary Test",
      game_id: "aprender_ia_steam",
      time_elapsed_ms: 5000,
      errors_count: 2
    };

    const res5 = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadRojoErrors)
    });

    assert(res5.status === 200, `Expected HTTP status 200 OK, received ${res5.status}`);
    const data5 = await res5.json();
    assert(data5.success === true, `Expected success to be true, received ${data5.success}`);
    assert(data5.data && data5.data.semaforo === 'ROJO', `Expected semaforo 'ROJO', received '${data5.data?.semaforo}'`);

    console.log(`  ✅ Passed: ROJO errors boundary verified (semaforo === 'ROJO')\n`);
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}\n`);
    failures.push(`Test 5 (ROJO errors boundary): ${err.message}`);
  }

  // 6. Test ROJO boundary (rage clicks): rage_clicks: 3 -> ROJO
  try {
    console.log(`[TEST 6] POST /api/telemetry (ROJO Boundary Rage Clicks: rage=3)...`);
    const payloadRojoRage = {
      student_id: "test_r_rage",
      student_name: "Rojo Rage Clicks Boundary Test",
      game_id: "aprender_ia_steam",
      time_elapsed_ms: 10000,
      errors_count: 0,
      rage_clicks: 3
    };

    const res6 = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadRojoRage)
    });

    assert(res6.status === 200, `Expected HTTP status 200 OK, received ${res6.status}`);
    const data6 = await res6.json();
    assert(data6.success === true, `Expected success to be true, received ${data6.success}`);
    assert(data6.data && data6.data.semaforo === 'ROJO', `Expected semaforo 'ROJO', received '${data6.data?.semaforo}'`);

    console.log(`  ✅ Passed: ROJO rage clicks boundary verified (semaforo === 'ROJO')\n`);
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}\n`);
    failures.push(`Test 6 (ROJO rage clicks boundary): ${err.message}`);
  }

  // 7. Test Validation Error 1: missing required fields -> HTTP 400
  try {
    console.log(`[TEST 7] POST /api/telemetry (Validation Error 1: Missing Required Fields)...`);
    const payloadMissing = {
      student_name: "Incomplete Payload"
    };

    const res7 = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadMissing)
    });

    assert(res7.status === 400, `Expected HTTP status 400 Bad Request, received ${res7.status}`);
    const data7 = await res7.json();
    assert(data7.success === false, `Expected success to be false for missing fields`);
    assert(Boolean(data7.error), `Expected error message in response for missing fields`);

    console.log(`  ✅ Passed: Missing required fields rejected with HTTP 400\n`);
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}\n`);
    failures.push(`Test 7 (Validation Error - Missing Fields): ${err.message}`);
  }

  // 8. Test Validation Error 2: negative time_elapsed_ms: -100 -> HTTP 400
  try {
    console.log(`[TEST 8] POST /api/telemetry (Validation Error 2: Negative time_elapsed_ms)...`);
    const payloadNegative = {
      student_id: "test_neg",
      student_name: "Negative Value Student",
      game_id: "aprender_ia_steam",
      time_elapsed_ms: -100,
      errors_count: 0
    };

    const res8 = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadNegative)
    });

    assert(res8.status === 400, `Expected HTTP status 400 Bad Request, received ${res8.status}`);
    const data8 = await res8.json();
    assert(data8.success === false, `Expected success to be false for negative values`);
    assert(data8.error === 'Numeric fields cannot be negative', `Expected error 'Numeric fields cannot be negative', received '${data8.error}'`);

    console.log(`  ✅ Passed: Negative time_elapsed_ms rejected with HTTP 400 & expected error message\n`);
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}\n`);
    failures.push(`Test 8 (Validation Error - Negative Values): ${err.message}`);
  }

  // 9. Test GET telemetry & static endpoints ('/', '/aprender-ia/', '/educar-ia/')
  try {
    console.log(`[TEST 9] GET /api/telemetry & Static Endpoints ('/', '/aprender-ia/', '/educar-ia/')...`);

    // 9a. GET /api/telemetry
    const resTelemetry = await fetch(`${BASE_URL}/api/telemetry`);
    assert(resTelemetry.status === 200, `Expected GET /api/telemetry HTTP 200 OK, received ${resTelemetry.status}`);
    const dataTelemetry = await resTelemetry.json();
    assert(dataTelemetry.success === true, `Expected success to be true for GET /api/telemetry`);
    assert(Array.isArray(dataTelemetry.data), `Expected telemetry data to be an Array`);
    assert(dataTelemetry.count > 0, `Expected telemetry count > 0`);

    // 9b. Static Endpoints
    const staticEndpoints = [
      { url: '/', name: 'Root Hub Index' },
      { url: '/aprender-ia/', name: 'AprenderIA Minigame' },
      { url: '/educar-ia/', name: 'EducarIA Teacher Dashboard' }
    ];

    for (const endpoint of staticEndpoints) {
      const resStatic = await fetch(`${BASE_URL}${endpoint.url}`);
      assert(resStatic.status === 200, `Expected GET ${endpoint.url} HTTP 200 OK for ${endpoint.name}, received ${resStatic.status}`);
    }

    console.log(`  ✅ Passed: GET /api/telemetry (count=${dataTelemetry.count}) and static endpoints ('/', '/aprender-ia/', '/educar-ia/') returned HTTP 200 OK\n`);
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}\n`);
    failures.push(`Test 9 (GET Telemetry & Static Endpoints): ${err.message}`);
  }

  // Report Summary & Exit Code
  console.log(`======================================================`);
  if (failures.length === 0) {
    console.log(`🎉 ALL PROGRAMMATIC E2E VERIFICATION TESTS PASSED!`);
    console.log(`======================================================\n`);
    process.exit(0);
  } else {
    console.error(`❌ VERIFICATION FAILED WITH ${failures.length} FAILURE(S):`);
    failures.forEach((failure, index) => {
      console.error(`  ${index + 1}. ${failure}`);
    });
    console.log(`======================================================\n`);
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error(`Fatal Verification Script Error:`, err);
  process.exit(1);
});
