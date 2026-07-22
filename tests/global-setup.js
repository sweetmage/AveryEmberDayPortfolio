import { execSync } from 'node:child_process';

/**
 * Build the static export before any test runs.
 *
 * This MUST NOT live in `webServer.command`. Playwright's
 * `reuseExistingServer` skips the whole command when something is already
 * listening on the port — so a server left over from a previous run made the
 * suite serve a stale `out/` and silently grade the wrong artifact. That was
 * not theoretical: an injected colour regression passed 45/45 against a stale
 * build, and only failed once the port was freed and the build actually ran.
 *
 * Global setup always runs, so `out/` is always current and reusing an
 * already-running `serve` is then harmless.
 */
export default function globalSetup() {
  execSync('npm run build:next', { stdio: 'inherit' });
}
