const cp = require('child_process');

try {
  const result = cp.execSync('powershell -Command "echo hello"', { encoding: 'utf8', timeout: 5000 });
  console.log('execSync powershell result:', result.trim());
} catch (e) {
  console.log('execSync powershell error:', e.code, e.message);
}

try {
  const result = cp.execSync('cmd /c powershell -Command "echo hello"', { encoding: 'utf8', timeout: 5000 });
  console.log('execSync cmd powershell result:', result.trim());
} catch (e) {
  console.log('execSync cmd powershell error:', e.code, e.message);
}

try {
  const result = cp.spawnSync('powershell', ['-Command', 'echo hello'], { encoding: 'utf8', timeout: 5000 });
  console.log('spawnSync powershell result:', result.stdout ? result.stdout.trim() : 'null', 'error:', result.error ? result.error.message : 'null');
} catch (e) {
  console.log('spawnSync powershell error:', e.code, e.message);
}

try {
  const result = cp.spawnSync('cmd', ['/c', 'powershell', '-Command', 'echo hello'], { encoding: 'utf8', timeout: 5000 });
  console.log('spawnSync cmd powershell result:', result.stdout ? result.stdout.trim() : 'null', 'error:', result.error ? result.error.message : 'null');
} catch (e) {
  console.log('spawnSync cmd powershell error:', e.code, e.message);
}
