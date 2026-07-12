#!/usr/bin/env node
/**
 * diagnostic-spawn.js — Reproduce EPERM uv_spawn failures vs successes.
 *
 * Run this both INSIDE the agent and OUTSIDE (in a standalone terminal)
 * to determine whether the restriction is agent-parent-specific.
 *
 * Usage:
 *   node scripts/diagnostic-spawn.js
 */

const cp = require('child_process');

const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, status: 'PASS' });
  } catch (e) {
    results.push({ name, status: 'FAIL', error: e.message });
  }
}

console.log('=== Diagnostic Spawn Tests ===\n');

// 1. Direct spawnSync powershell (verified working in node -e)
test('spawnSync powershell -Command echo hello', () => {
  const r = cp.spawnSync('powershell', ['-Command', 'echo hello'], { encoding: 'utf8' });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`exit ${r.status}`);
});

// 2. Direct spawnSync cmd (verified working)
test('spawnSync cmd /c echo hello', () => {
  const r = cp.spawnSync('cmd', ['/c', 'echo hello'], { encoding: 'utf8' });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`exit ${r.status}`);
});

// 3. execSync powershell (known to fail with EPERM in node -e)
test('execSync powershell -Command echo hello', () => {
  cp.execSync('powershell -Command "echo hello"', { encoding: 'utf8', timeout: 5000 });
});

// 4. execSync cmd (known to fail with EPERM in node -e)
test('execSync cmd /c echo hello', () => {
  cp.execSync('cmd /c echo hello', { encoding: 'utf8', timeout: 5000 });
});

// 5. execSync plain echo (usually works)
test('execSync echo hello', () => {
  cp.execSync('echo hello', { encoding: 'utf8', timeout: 5000 });
});

// 6. execSync dir (usually works)
test('execSync dir', () => {
  cp.execSync('dir', { encoding: 'utf8', timeout: 5000 });
});

// 7. execSync powershell via cmd /c (common workaround pattern)
test('execSync cmd /c powershell -Command echo hello', () => {
  cp.execSync('cmd /c powershell -Command "echo hello"', { encoding: 'utf8', timeout: 5000 });
});

// 8. execSync cmd via cmd /c (redundant but confirms nesting)
test('execSync cmd /c cmd /c echo hello', () => {
  cp.execSync('cmd /c cmd /c echo hello', { encoding: 'utf8', timeout: 5000 });
});

// 9. spawn powershell with -NoLogo (verified working)
test('spawnSync powershell -NoLogo', () => {
  const r = cp.spawnSync('powershell', ['-NoLogo'], { encoding: 'utf8' });
  if (r.error) throw r.error;
});

// 10. spawnSync cmd with /c exit (confirms cmd spawns without hanging)
test('spawnSync cmd /c exit 0', () => {
  const r = cp.spawnSync('cmd', ['/c', 'exit', '0'], { encoding: 'utf8', timeout: 3000 });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`exit ${r.status}`);
});

console.log('\n=== Results ===');
for (const r of results) {
  const icon = r.status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${r.name}`);
  if (r.error) console.log(`   └─ ${r.error}`);
}

const failCount = results.filter(r => r.status === 'FAIL').length;
console.log(`\n${results.length} tests, ${failCount} failures.`);
console.log(`Node.js: ${process.version}`);
console.log(`Platform: ${process.platform} ${process.arch}`);
