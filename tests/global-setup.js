import { execSync, spawn } from 'node:child_process';

/**
 * Build the static export and start the test server inside global setup.
 *
 * Playwright 1.61.1 starts webServers before globalSetup runs (verified by
 * debug output: both webServers were available before build:next began). When
 * the build then deletes and recreates `out/`, the already-running `serve`
 * process loses its directory and starts returning ECONNRESET / connection
 * refused. The only reliable ordering is: build first, then serve.
 *
 * This module starts `serve out -l 4322` after the build completes, waits
 * until it is actually accepting requests, and returns a teardown function
 * that kills the process when Playwright shuts down.
 */
export default async function globalSetup() {
  // 1. Kill any stale server on 4322 so we don't reuse a dead directory.
  try {
    if (process.platform === 'win32') {
      const result = execSync(
        'netstat -aon | findstr :4322 | findstr LISTENING',
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
      );
      const lines = result.trim().split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid)) {
          try { execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' }); } catch {}
        }
      }
    } else {
      execSync('lsof -ti:4322 | xargs kill -9 2>/dev/null || true', { stdio: 'ignore' });
    }
  } catch {
    // No process on 4322 — expected in clean runs.
  }

  // 2. Build the static export.
  execSync('npm run build:next', { stdio: 'inherit' });

  // 3. Start the test server on 4322.
  //
  // stdio MUST be 'ignore', not 'pipe'. `serve` logs every request to
  // stdout. With 'pipe', Node creates an OS pipe that nobody reads, and
  // once the pipe's buffer fills (64KB on Windows), `serve`'s next
  // stdout write blocks -- which blocks its single-threaded event loop,
  // which stops it from accepting new connections. Verified empirically:
  // with 'pipe', the server answered exactly 6 requests then hung
  // (subsequent requests timed out / ERR_ABORTED), reproducing every
  // `visual-baseline.spec.js` failure past the `index` page regardless
  // of worker count. We don't need `serve`'s logs, so just discard them.
  const server = spawn('npx', ['serve', 'out', '-l', '4322'], {
    stdio: 'ignore',
    shell: process.platform === 'win32',
  });

  // 4. Wait until the server is accepting requests.
  const { request } = await import('node:http');
  const isReady = () =>
    new Promise((resolve) => {
      const req = request('http://localhost:4322/', (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(2000, () => { req.destroy(); resolve(false); });
      req.end();
    });

  let ready = false;
  const deadline = Date.now() + 30_000;
  while (!ready && Date.now() < deadline) {
    ready = await isReady();
    if (!ready) await new Promise((r) => setTimeout(r, 250));
  }
  if (!ready) {
    server.kill('SIGTERM');
    throw new Error('Test server on 4322 did not become ready within 30s');
  }

  // Return teardown function (Playwright calls this after all tests).
  return async () => {
    server.kill('SIGTERM');
    // Windows: taskkill is more reliable than SIGTERM for tree processes
    if (process.platform === 'win32') {
      try { execSync(`taskkill /F /PID ${server.pid}`, { stdio: 'ignore' }); } catch {}
    }
    await new Promise((r) => setTimeout(r, 500));
  };
}
