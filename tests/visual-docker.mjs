#!/usr/bin/env node
/**
 * Run the visual gate inside the official Playwright image.
 *
 *     node tests/visual-docker.mjs                          # grade against the baselines
 *     node tests/visual-docker.mjs --update-snapshots=all   # regenerate (review before committing)
 *     node tests/visual-docker.mjs -g portfolio-brand       # any other Playwright argument
 *
 * One Linux snapshot set is canonical (user decision 2026-07-23, docs/visual-gate.md), so every
 * machine grades against the same pixels. The image tag follows the @playwright/test version the
 * lockfile pins, and the platform is pinned to linux/amd64: hosted runners and SOL are x86-64,
 * and Chromium's rasteriser is not guaranteed identical on arm64 (on Apple Silicon this runs
 * under Rosetta; Colima needs `--vm-type vz --vz-rosetta`).
 *
 * The repo is bind-mounted at /work, with named volumes over node_modules and .next so the
 * host's macOS or Windows binaries (Next's SWC) never meet the container. `npm ci` reruns only
 * when package-lock.json changes. `out/` is built inside the container by tests/global-setup.js.
 *
 * Lives under tests/ rather than scripts/ or package.json on purpose: netlify.toml's ignore rule
 * skips pushes that touch only tests/ and docs, and either of the others would turn a push of
 * this file into a 15-credit production build.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lock = JSON.parse(readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
const version = lock.packages?.['node_modules/@playwright/test']?.version;
if (!version) {
  console.error('visual-docker: @playwright/test is not in package-lock.json');
  process.exit(2);
}
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

const docker = spawnSync('docker', ['info', '--format', '{{.ServerVersion}}'], { encoding: 'utf8' });
if (docker.status !== 0) {
  console.error('visual-docker: Docker is not running. On VOID: `colima start`.');
  process.exit(2);
}

// Runs inside the container. "$@" is the Playwright arguments passed through.
const inner = [
  'set -e',
  'cd /work',
  'hash=$(sha256sum package-lock.json | cut -d" " -f1)',
  'if [ "$(cat node_modules/.lock-hash 2>/dev/null)" != "$hash" ]; then',
  '  find node_modules -mindepth 1 -maxdepth 1 -exec rm -rf {} +',
  '  npm ci --no-audit --no-fund',
  '  echo "$hash" > node_modules/.lock-hash',
  'fi',
  'exec npx playwright test tests/visual-baseline.spec.js --project=chromium "$@"',
].join('\n');

const args = [
  'run', '--rm', '--init', '--ipc=host',
  '--platform', 'linux/amd64',
  '-v', `${root}:/work`,
  '-v', 'portfolio-visual-node-modules:/work/node_modules',
  '-v', 'portfolio-visual-next:/work/.next',
  '-e', 'VISUAL_CONTAINER=1',
  ...(process.stdout.isTTY ? ['-t'] : []),
  image,
  'sh', '-c', inner, 'sh', ...process.argv.slice(2),
];

console.log(`visual-docker: ${image} (linux/amd64)`);
const run = spawnSync('docker', args, { stdio: 'inherit' });
process.exit(run.status ?? 1);
