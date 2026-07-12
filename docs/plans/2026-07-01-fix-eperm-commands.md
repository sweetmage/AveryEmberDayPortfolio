# Plan: Fix EPERM Command Availability in Windows Environment

**Goal:** Eliminate `EPERM: operation not permitted, uv_spawn` errors so that agent `bash` tool invocations and Node.js scripts can reliably spawn `powershell.exe` and `cmd.exe` processes.

**Approach:** Hybrid three-phase approach. Phase 1 provides an immediate repo-side workaround so work is unblocked today. Phase 2 diagnoses and fixes the underlying environment restriction. Phase 3 updates docs to reflect reality.

---

## Phase 1 — Immediate Repo-Side Workaround

**Rationale:** Diagnostic testing shows the restriction is inconsistent. Direct `bash` PowerShell commands often work, but `node -e` with `child_process.execSync('cmd')` or `child_process.execSync('powershell')` consistently fails. Running the same logic from a `.js` file works 100% of the time. Certain `bash` patterns (e.g., `powershell -Command`) also fail, while `cmd /c powershell -Command` works.

**Steps:**

1. **Create `scripts/shell-proxy.js`**  
   A small cross-platform wrapper that exports two functions:
   - `runPowerShell(command, options)` → uses `child_process.spawnSync('powershell', ['-NoProfile', '-Command', command], options)`. This pattern was verified to work inside `node -e` and from files.
   - `runCmd(command, options)` → uses `child_process.spawnSync('cmd', ['/c', command], options)`. This pattern is safe from injection and was verified to work from `.js` files.
   - For complex multi-step shell work, export `runScriptFile(filePath, args)` → simply runs `node file.js args`, avoiding `node -e` entirely.

   **Usage pattern:** When an agent needs to run `node -e "...execSync('powershell')..."`, it should instead write a `.js` file and run `node file.js`, or call `node scripts/shell-proxy.js pwsh "command"` / `node scripts/shell-proxy.js cmd "command"`.

2. **Audit existing `scripts/*.js` for unsafe patterns**  
   Files to check:
   - `scripts/sync-all.js` — already uses `spawnSync(process.execPath, ...)` (safe).
   - `scripts/google-oauth.js` — already uses `spawn('cmd', ['/c', 'start', ...])` (safe).
   - `scripts/google-docs.js` — already uses `spawnSync('opentabs', ..., { shell: true })` (safe, though `shell: true` on Windows uses `cmd.exe`).
   - `scripts/parse-todo.js`, `scripts/sync-ticktick.js`, `scripts/bubbles.js` — confirmed safe (no `child_process` usage).
   - Any other script that might try `execSync('powershell ...')` or `spawnSync('cmd')`.
   Replace unsafe patterns with `shell-proxy.js` equivalents.

3. **Create `scripts/diagnostic-spawn.js`**  
   A standalone diagnostic script that reproduces all the known failure/success patterns. This gives the user a single file to run in an elevated terminal outside the agent to confirm whether the restriction is agent-only or system-wide. Kept in `scripts/` (not `tmp/`) so it is tracked in git and available on fresh clones.

---

## Phase 2 — Environment Root-Cause Fix

**Rationale:** The EPERM is almost certainly imposed by the agent's parent process (likely the VS Code Extension Host or Kilo agent wrapper) or by an OS-level security policy. The restriction blocks direct `uv_spawn` of `powershell.exe` and `cmd.exe` in certain contexts but not others.

**Steps:**

1. **Confirm scope outside the agent**
   In a standalone elevated PowerShell terminal (outside VS Code / Kilo), run:
   `node scripts/diagnostic-spawn.js`
   `node -e "require('child_process').execSync('powershell -Command echo test')"`
   If these work outside the agent but fail inside, the restriction is agent-parent-specific.

2. **Check Windows Event Viewer logs**
   In an elevated terminal, run:
   `Get-WinEvent -FilterHashtable @{LogName='Security'; ID=4688} -MaxEvents 20 | Where-Object { $_.Message -match 'powershell' -or $_.Message -match 'cmd' }`
   `Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-AppLocker/EXE and DLL'; ID=8003,8004,8006,8007} -MaxEvents 20`
   Look for blocked process creation events timed to the EPERM failures.

3. **Check VS Code process hardening / sandbox settings**
   VS Code 1.91+ introduced extension host hardening on Windows. Check:
   `Get-ProcessMitigation -Name code.exe` (run outside agent; inside agent this cmdlet itself fails with EPERM).
   VS Code `settings.json` for any `security.*` or `extensions.*` sandbox flags.
   Try launching VS Code with `--disable-extensions` or `--no-sandbox` to see if the restriction disappears.

4. **Check Kilo extension configuration**
   Verify project-level `.kilo/kilo.json` already has `"permission": {"bash": "allow"}` (it does).
   Review global `C:\Users\Comet\.config\kilo\kilo.jsonc` for any sandbox/process settings.
   Check if a newer Kilo extension version is available that relaxes the `uv_spawn` restriction.
   Try adjusting Kilo's `permission.bash` setting or any related flags.

5. **Check Windows Smart App Control / SAC**
   `Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\SAC"`
   If SAC is in Enforcement mode, it can block spawning of `powershell.exe` from "untrusted" parent processes like VS Code's extension host.

6. **Apply the fix based on findings**
   - **If VS Code hardening:** Add VS Code / extension host to the whitelist, or disable the specific hardening feature.
   - **If SAC:** Disable SAC or add an exception for the VS Code extension host.
   - **If AppLocker/WDAC:** Add a rule allowing `powershell.exe` and `cmd.exe` to be spawned by `Code.exe` or the Kilo agent process.
   - **If Kilo-specific:** Update Kilo or file a bug report with the diagnostic output.
   - **If Job Object restriction:** Identify the parent process that created the job and reconfigure it.

---

## Phase 3 — Documentation Update

**Steps:**

1. **Update `docs/NOTES.md`**  
   Replace the blanket "PowerShell is inaccessible to agents" paragraph with a precise, evidence-based note:
   - State that direct `bash` PowerShell commands generally work.
   - State that `node -e` with `child_process.execSync('powershell')` or `execSync('cmd')` fails with EPERM.
   - State that the same code in a `.js` file works reliably.
   - State that `cmd /c powershell -Command "..."` works as a direct `bash` workaround.
   - Reference `scripts/shell-proxy.js` as the canonical workaround.

2. **Create or update `AGENTS.md`**  
   Add an "Environment Gotchas" section documenting the safe patterns discovered during Phase 1 diagnostics.

---

## Testing

- After Phase 1: Re-run the full suite of repo scripts to verify no regressions: `node scripts/parse-todo.js`, `node scripts/sync-all.js --dry-run`, etc.
- After Phase 2: Re-run `node scripts/diagnostic-spawn.js` inside the agent to confirm all previously-failing patterns now pass.
- After Phase 3: Review `docs/NOTES.md` and `AGENTS.md` in a markdown previewer for formatting and accuracy.

## Risks

- **Phase 2 may require admin rights or an external update.** Phase 1 ensures the repo is unblocked regardless.
- **Phase 2 user buy-in required.** Disabling VS Code hardening, SAC, or AppLocker rules carries security trade-offs. The user should confirm whether they are willing to make OS-level changes vs. accepting Phase 1 as the permanent solution.
- **Phase 1 proxy abstraction could hide errors.** The proxy must preserve exit codes, stderr, and thrown errors exactly like the native `child_process` APIs it replaces.
- **VS Code / Kilo updates might change behavior.** Document the exact versions tested so future agents know if the restriction was lifted in a newer release.
