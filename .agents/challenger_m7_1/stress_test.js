const http = require('http');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3000';
const GET_ENDPOINT = '/api/telemetry';
const POST_ENDPOINT = '/api/telemetry';

// Quantile calculation helper
function getPercentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

// HTTP Helper using native http module for maximum performance and socket control
function sendRequest({ method, path, headers = {}, body = null }) {
  return new Promise((resolve) => {
    const start = performance.now();
    const req = http.request(
      BASE_URL + path,
      {
        method,
        headers,
        agent: new http.Agent({ keepAlive: true, maxSockets: 100 })
      },
      (res) => {
        let responseBody = '';
        res.on('data', chunk => { responseBody += chunk; });
        res.on('end', () => {
          const duration = performance.now() - start;
          let parsed = null;
          try { parsed = JSON.parse(responseBody); } catch (_) {}
          resolve({
            statusCode: res.statusCode,
            duration,
            body: parsed,
            rawBody: responseBody,
            error: null
          });
        });
      }
    );

    req.on('error', (err) => {
      const duration = performance.now() - start;
      resolve({
        statusCode: 0,
        duration,
        body: null,
        rawBody: '',
        error: err.message
      });
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function runStressTest() {
  console.log('======================================================');
  console.log('🔥 NOMAD-IA Backend Empirical Stress Testing Harness');
  console.log('Target: http://localhost:3000');
  console.log('======================================================\n');

  // 0. Fetch initial telemetry count
  const initialGet = await sendRequest({ method: 'GET', path: GET_ENDPOINT });
  const initialCount = initialGet.body?.count || 0;
  console.log(`[INITIAL STATE] Current Telemetry Record Count: ${initialCount}\n`);

  // Phase 1: 600 Rapid HTTP GET Requests (Requirement: 500+)
  console.log('------------------------------------------------------');
  console.log('⚡ PHASE 1: 600 Concurrent/Rapid HTTP GET Requests');
  console.log('------------------------------------------------------');
  const NUM_GETS = 600;
  const CONCURRENCY_GET = 50; // 50 parallel request workers

  const getDurations = [];
  const getStatusCodes = {};
  let getErrorCount = 0;

  const phase1Start = performance.now();
  
  // Worker pool for GETs
  let getIndex = 0;
  async function getWorker() {
    while (true) {
      const current = getIndex++;
      if (current >= NUM_GETS) break;
      const res = await sendRequest({ method: 'GET', path: GET_ENDPOINT });
      getDurations.push(res.duration);
      getStatusCodes[res.statusCode] = (getStatusCodes[res.statusCode] || 0) + 1;
      if (res.statusCode !== 200 || res.error) {
        getErrorCount++;
      }
    }
  }

  const getWorkers = Array.from({ length: CONCURRENCY_GET }, () => getWorker());
  await Promise.all(getWorkers);
  const phase1Duration = performance.now() - phase1Start;
  const getThroughput = (NUM_GETS / (phase1Duration / 1000)).toFixed(2);
  const getMeanLatency = (getDurations.reduce((a, b) => a + b, 0) / getDurations.length).toFixed(2);
  const getP50 = getPercentile(getDurations, 50).toFixed(2);
  const getP90 = getPercentile(getDurations, 90).toFixed(2);
  const getP99 = getPercentile(getDurations, 99).toFixed(2);
  const getMin = Math.min(...getDurations).toFixed(2);
  const getMax = Math.max(...getDurations).toFixed(2);

  console.log(`Completed ${NUM_GETS} GET requests in ${(phase1Duration / 1000).toFixed(3)}s`);
  console.log(`Throughput: ${getThroughput} req/sec`);
  console.log(`Latency (ms) - Min: ${getMin}, Mean: ${getMeanLatency}, P50: ${getP50}, P90: ${getP90}, P99: ${getP99}, Max: ${getMax}`);
  console.log(`Status Codes: ${JSON.stringify(getStatusCodes)}`);
  console.log(`Error Count: ${getErrorCount} (${((getErrorCount / NUM_GETS) * 100).toFixed(2)}%)\n`);

  // Phase 2: 250 Concurrent HTTP POST Telemetry Payloads (Requirement: 200+)
  console.log('------------------------------------------------------');
  console.log('🚀 PHASE 2: 250 Concurrent HTTP POST Telemetry Payloads');
  console.log('------------------------------------------------------');
  const NUM_POSTS = 250;
  const CONCURRENCY_POST = 50; // 50 parallel workers

  const postDurations = [];
  const postStatusCodes = {};
  let postErrorCount = 0;
  let successfulPosts = 0;

  const phase2Start = performance.now();

  let postIndex = 0;
  async function postWorker() {
    while (true) {
      const current = postIndex++;
      if (current >= NUM_POSTS) break;

      const semaforoType = current % 3; // mix of Verde, Amarillo, Rojo
      const payload = {
        student_id: `stress_student_${current}`,
        student_name: `Stress Student ${current}`,
        game_id: 'aprender_ia_steam',
        time_elapsed_ms: semaforoType === 0 ? 10000 : (semaforoType === 1 ? 30000 : 50000),
        errors_count: semaforoType === 0 ? 0 : (semaforoType === 1 ? 1 : 4),
        rage_clicks: semaforoType === 0 ? 0 : (semaforoType === 1 ? 1 : 3),
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      const bodyStr = JSON.stringify(payload);
      const res = await sendRequest({
        method: 'POST',
        path: POST_ENDPOINT,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr)
        },
        body: bodyStr
      });

      postDurations.push(res.duration);
      postStatusCodes[res.statusCode] = (postStatusCodes[res.statusCode] || 0) + 1;
      if (res.statusCode === 200 && res.body?.success === true) {
        successfulPosts++;
      } else {
        postErrorCount++;
      }
    }
  }

  const postWorkers = Array.from({ length: CONCURRENCY_POST }, () => postWorker());
  await Promise.all(postWorkers);
  const phase2Duration = performance.now() - phase2Start;
  const postThroughput = (NUM_POSTS / (phase2Duration / 1000)).toFixed(2);
  const postMeanLatency = (postDurations.reduce((a, b) => a + b, 0) / postDurations.length).toFixed(2);
  const postP50 = getPercentile(postDurations, 50).toFixed(2);
  const postP90 = getPercentile(postDurations, 90).toFixed(2);
  const postP99 = getPercentile(postDurations, 99).toFixed(2);
  const postMin = Math.min(...postDurations).toFixed(2);
  const postMax = Math.max(...postDurations).toFixed(2);

  console.log(`Completed ${NUM_POSTS} POST requests in ${(phase2Duration / 1000).toFixed(3)}s`);
  console.log(`Throughput: ${postThroughput} req/sec`);
  console.log(`Latency (ms) - Min: ${postMin}, Mean: ${postMeanLatency}, P50: ${postP50}, P90: ${postP90}, P99: ${postP99}, Max: ${postMax}`);
  console.log(`Status Codes: ${JSON.stringify(postStatusCodes)}`);
  console.log(`Successful POSTs: ${successfulPosts}/${NUM_POSTS}`);
  console.log(`Error Count: ${postErrorCount} (${((postErrorCount / NUM_POSTS) * 100).toFixed(2)}%)\n`);

  // Phase 3: High Concurrency Mixed Burst (300 GETs + 100 POSTs simultaneously)
  console.log('------------------------------------------------------');
  console.log('💥 PHASE 3: Mixed High-Concurrency Burst (300 GETs + 100 POSTs)');
  console.log('------------------------------------------------------');
  const phase3Start = performance.now();
  const mixedDurations = [];
  const mixedStatusCodes = {};
  let mixedErrors = 0;

  const mixedTasks = [];
  for (let i = 0; i < 300; i++) {
    mixedTasks.push(sendRequest({ method: 'GET', path: GET_ENDPOINT }));
  }
  for (let i = 0; i < 100; i++) {
    const bodyStr = JSON.stringify({
      student_id: `mixed_student_${i}`,
      student_name: `Mixed Student ${i}`,
      game_id: 'aprender_ia_steam',
      time_elapsed_ms: 15000,
      errors_count: 0,
      rage_clicks: 0,
      status: 'completed',
      timestamp: new Date().toISOString()
    });
    mixedTasks.push(sendRequest({
      method: 'POST',
      path: POST_ENDPOINT,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      },
      body: bodyStr
    }));
  }

  const mixedResults = await Promise.all(mixedTasks);
  const phase3Duration = performance.now() - phase3Start;
  
  let mixedSuccessfulPosts = 0;
  mixedResults.forEach((res, idx) => {
    mixedDurations.push(res.duration);
    mixedStatusCodes[res.statusCode] = (mixedStatusCodes[res.statusCode] || 0) + 1;
    if (res.statusCode !== 200 || res.error) {
      mixedErrors++;
    }
    if (idx >= 300 && res.statusCode === 200 && res.body?.success === true) {
      mixedSuccessfulPosts++;
    }
  });

  const mixedThroughput = (400 / (phase3Duration / 1000)).toFixed(2);
  const mixedMeanLatency = (mixedDurations.reduce((a, b) => a + b, 0) / mixedDurations.length).toFixed(2);
  const mixedP50 = getPercentile(mixedDurations, 50).toFixed(2);
  const mixedP90 = getPercentile(mixedDurations, 90).toFixed(2);
  const mixedP99 = getPercentile(mixedDurations, 99).toFixed(2);

  console.log(`Completed 400 mixed requests in ${(phase3Duration / 1000).toFixed(3)}s`);
  console.log(`Throughput: ${mixedThroughput} req/sec`);
  console.log(`Latency (ms) - Mean: ${mixedMeanLatency}, P50: ${mixedP50}, P90: ${mixedP90}, P99: ${mixedP99}`);
  console.log(`Status Codes: ${JSON.stringify(mixedStatusCodes)}`);
  console.log(`Error Count: ${mixedErrors} (${((mixedErrors / 400) * 100).toFixed(2)}%)\n`);

  // Phase 4: State Consistency & Post-Stress Verification
  console.log('------------------------------------------------------');
  console.log('🔍 PHASE 4: State Consistency & Server Stability Audit');
  console.log('------------------------------------------------------');
  
  const finalGet = await sendRequest({ method: 'GET', path: GET_ENDPOINT });
  const finalCount = finalGet.body?.count || 0;
  const expectedCount = initialCount + successfulPosts + mixedSuccessfulPosts;
  const countMatch = finalCount === expectedCount;

  console.log(`Initial Count:           ${initialCount}`);
  console.log(`Phase 2 Successful POSTs: ${successfulPosts}`);
  console.log(`Phase 3 Successful POSTs: ${mixedSuccessfulPosts}`);
  console.log(`Expected Final Count:    ${expectedCount}`);
  console.log(`Actual Final Count:      ${finalCount}`);
  console.log(`State Consistency Check: ${countMatch ? '✅ PASSED (Exact Match)' : '❌ FAILED (Count Mismatch)'}`);

  // Data Integrity Sample Inspection
  let integrityPassed = true;
  if (Array.isArray(finalGet.body?.data)) {
    const dataArr = finalGet.body.data;
    for (let i = 0; i < dataArr.length; i++) {
      const rec = dataArr[i];
      if (!rec.id || !rec.student_name || !rec.game_id || rec.semaforo === undefined) {
        console.error(`Corrupt record detected at index ${i}:`, rec);
        integrityPassed = false;
        break;
      }
    }
  } else {
    integrityPassed = false;
  }
  console.log(`Data Integrity Check:    ${integrityPassed ? '✅ PASSED (No Corrupt Records)' : '❌ FAILED'}`);

  // Return results object for reporting
  return {
    initialCount,
    finalCount,
    expectedCount,
    countMatch,
    integrityPassed,
    phase1: {
      totalReqs: NUM_GETS,
      durationSec: (phase1Duration / 1000).toFixed(3),
      throughput: getThroughput,
      latencies: { min: getMin, mean: getMeanLatency, p50: getP50, p90: getP90, p99: getP99, max: getMax },
      errors: getErrorCount,
      errorRate: ((getErrorCount / NUM_GETS) * 100).toFixed(2),
      statusCodes: getStatusCodes
    },
    phase2: {
      totalReqs: NUM_POSTS,
      durationSec: (phase2Duration / 1000).toFixed(3),
      throughput: postThroughput,
      latencies: { min: postMin, mean: postMeanLatency, p50: postP50, p90: postP90, p99: postP99, max: postMax },
      successfulPosts,
      errors: postErrorCount,
      errorRate: ((postErrorCount / NUM_POSTS) * 100).toFixed(2),
      statusCodes: postStatusCodes
    },
    phase3: {
      totalReqs: 400,
      durationSec: (phase3Duration / 1000).toFixed(3),
      throughput: mixedThroughput,
      latencies: { mean: mixedMeanLatency, p50: mixedP50, p90: mixedP90, p99: mixedP99 },
      errors: mixedErrors,
      errorRate: ((mixedErrors / 400) * 100).toFixed(2),
      statusCodes: mixedStatusCodes
    }
  };
}

runStressTest().catch(console.error);
