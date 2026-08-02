const https = require('https');
const { performance } = require('perf_hooks');

const target = new URL(process.argv[2] || 'https://claude.rwa.bayern/ew2r3-preview/');
const total = Math.min(Number(process.argv[3] || 100), 500);
const concurrency = Math.min(Number(process.argv[4] || 10), 25);

if (target.hostname !== 'claude.rwa.bayern' || !target.pathname.startsWith('/ew2r3-preview/')) {
  throw new Error('Safety guard: only the Ew2R3 staging route is allowed');
}
if (!Number.isInteger(total) || !Number.isInteger(concurrency) || total < 1 || concurrency < 1) {
  throw new Error('total and concurrency must be positive integers');
}

const timings = [];
const statuses = {};
let cursor = 0;

function oneRequest(index) {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const req = https.get(target, {
      headers: { 'User-Agent': 'Ew2R3-staging-baseline/1.0', 'Cache-Control': 'no-cache' },
      timeout: 15000,
    }, (res) => {
      let bytes = 0;
      res.on('data', chunk => { bytes += chunk.length; });
      res.on('end', () => {
        const ms = performance.now() - started;
        timings.push(ms);
        statuses[res.statusCode] = (statuses[res.statusCode] || 0) + 1;
        resolve({ index, ms, bytes, status: res.statusCode });
      });
    });
    req.on('timeout', () => req.destroy(new Error('request timeout')));
    req.on('error', reject);
  });
}

async function worker() {
  while (cursor < total) {
    const index = cursor++;
    await oneRequest(index);
  }
}

(async () => {
  const wallStart = performance.now();
  const results = await Promise.allSettled(Array.from({ length: concurrency }, worker));
  const failures = results.filter(r => r.status === 'rejected').map(r => String(r.reason));
  timings.sort((a, b) => a - b);
  const percentile = p => timings[Math.min(timings.length - 1, Math.floor(timings.length * p))] || null;
  const report = {
    target: target.href,
    total,
    concurrency,
    completed: timings.length,
    failures,
    statuses,
    wall_ms: +(performance.now() - wallStart).toFixed(1),
    latency_ms: {
      min: timings.length ? +timings[0].toFixed(1) : null,
      median: percentile(0.5) === null ? null : +percentile(0.5).toFixed(1),
      p95: percentile(0.95) === null ? null : +percentile(0.95).toFixed(1),
      max: timings.length ? +timings[timings.length - 1].toFixed(1) : null,
    },
  };
  console.log(JSON.stringify(report, null, 2));
  if (failures.length || statuses[200] !== total) process.exitCode = 1;
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
