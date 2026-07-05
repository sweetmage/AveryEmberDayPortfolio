#!/usr/bin/env node
/**
 * shell-proxy.js — Cross-platform shell proxy for environments where
 * child_process.execSync('cmd') / execSync('powershell') fail with EPERM.
 *
 * Usage (CLI):
 *   node scripts/shell-proxy.js pwsh "Get-Date"
 *   node scripts/shell-proxy.js cmd "dir /b"
 *   node scripts/shell-proxy.js powershell "echo hello"
 *
 * Usage (API):
 *   const { runPowerShell, runCmd, runScriptFile } = require('./scripts/shell-proxy');
 *   const result = runPowerShell('Get-Date', { encoding: 'utf8' });
 *   console.log(result.stdout);
 */

const cp = require('child_process');
const path = require('path');

/**
 * Run a PowerShell command via spawnSync.
 * Uses the pattern verified to work in EPERM-restricted environments:
 *   spawnSync('powershell', ['-NoProfile', '-Command', command], options)
 *
 * @param {string} command — The PowerShell command string.
 * @param {object} [options] — Options passed to spawnSync.
 * @returns {object} — { stdout, stderr, status, error }
 */
function runPowerShell(command, options = {}) {
  const result = cp.spawnSync('powershell', ['-NoProfile', '-Command', command], {
    encoding: 'utf8',
    ...options,
  });
  return result;
}

/**
 * Run a cmd.exe command via spawnSync.
 * Uses the pattern verified to work in EPERM-restricted environments:
 *   spawnSync('cmd', ['/c', command], options)
 *
 * @param {string} command — The cmd command string.
 * @param {object} [options] — Options passed to spawnSync.
 * @returns {object} — { stdout, stderr, status, error }
 */
function runCmd(command, options = {}) {
  const result = cp.spawnSync('cmd', ['/c', command], {
    encoding: 'utf8',
    ...options,
  });
  return result;
}

/**
 * Run a Node.js script file, avoiding node -e issues.
 *
 * @param {string} filePath — Path to the .js file.
 * @param {string[]} [args] — CLI arguments.
 * @param {object} [options] — Options passed to spawnSync.
 * @returns {object} — { stdout, stderr, status, error }
 */
function runScriptFile(filePath, args = [], options = {}) {
  const resolved = path.resolve(filePath);
  const result = cp.spawnSync(process.execPath, [resolved, ...args], {
    encoding: 'utf8',
    ...options,
  });
  return result;
}

/* ── CLI ─────────────────────────────────────────────────────────────── */

function printHelp() {
  console.log(`Usage: node scripts/shell-proxy.js <shell> <command>

  shell    One of: pwsh, powershell, cmd
  command  The command string to pass to the shell.

Examples:
  node scripts/shell-proxy.js pwsh "Get-Date"
  node scripts/shell-proxy.js cmd "dir /b"
  node scripts/shell-proxy.js powershell "echo hello"
`);
}

function main() {
  const [,, shell, ...commandParts] = process.argv;
  const command = commandParts.join(' ');

  if (!shell || !command) {
    printHelp();
    process.exit(1);
  }

  let result;
  switch (shell.toLowerCase()) {
    case 'pwsh':
    case 'powershell':
      result = runPowerShell(command);
      break;
    case 'cmd':
      result = runCmd(command);
      break;
    default:
      console.error(`Unknown shell: ${shell}`);
      printHelp();
      process.exit(1);
  }

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}

if (require.main === module) {
  main();
}

module.exports = { runPowerShell, runCmd, runScriptFile };
