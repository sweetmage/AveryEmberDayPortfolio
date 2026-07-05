const { spawn } = require('child_process');
const path = require('path');

const cwd = process.cwd();

function log(msg) {
  console.log(`[launch-css-test] ${msg}`);
}

function launch(cmd, args, label) {
  const proc = spawn(cmd, args, {
    cwd,
    stdio: 'pipe',
    shell: process.platform === 'win32',
    detached: false
  });

  proc.stdout.on('data', data => {
    console.log(`[${label}] ${data.toString().trim()}`);
  });

  proc.stderr.on('data', data => {
    console.error(`[${label}] ${data.toString().trim()}`);
  });

  proc.on('close', code => {
    log(`${label} exited with code ${code}`);
  });

  return proc;
}

function openBrowser(url) {
  const platform = process.platform;
  let cmd;
  if (platform === 'win32') {
    cmd = 'Start-Process';
    spawn('powershell', ['-Command', `Start-Process chrome "${url}"`], { stdio: 'ignore', shell: true });
  } else if (platform === 'darwin') {
    spawn('open', [url], { stdio: 'ignore' });
  } else {
    spawn('xdg-open', [url], { stdio: 'ignore' });
  }
}

log('Starting CSS test environment...');

const cssWatcher = launch('npx', ['tailwindcss', '-i', 'app.css', '-o', 'style.css', '--watch'], 'css');
const server = launch('npx', ['serve', '.', '-l', '8080'], 'server');

setTimeout(() => {
  log('Opening Chrome at http://localhost:8080');
  openBrowser('http://localhost:8080');
}, 1500);

function shutdown() {
  log('Shutting down...');
  cssWatcher.kill();
  server.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

if (process.platform === 'win32') {
  process.on('SIGBREAK', shutdown);
}
