#!/usr/bin/env node
// scripts/sync-all.js
// Orchestrates the full outbound sync pipeline.
// Usage: node scripts/sync-all.js [--dry-run] [--apply]
// Steps:
//   1. Regenerate docs/sync/local-tasks.json from TODO.md
//   2. Sync to TickTick (if TICKTICK_ACCESS_TOKEN present)
//
// NOTE: Google Tasks sync was retired on 2026-06-04. See scripts/_archive/README.md.

const { spawnSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const envPath = path.resolve(__dirname, "..", ".env");

function loadEnv() {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    env[line.slice(0, idx)] = line.slice(idx + 1);
  }
  return env;
}

function run(script, args) {
  const cmd = process.execPath;
  const fullArgs = [path.resolve(__dirname, script), ...args];
  console.log(`\n>>> ${cmd} ${fullArgs.join(" ")}\n`);
  const result = spawnSync(cmd, fullArgs, {
    stdio: "inherit",
    cwd: process.cwd(),
  });
  return result.status === 0;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const apply = args.includes("--apply");
  const pendingOnly = args.includes("--pending-only");

  if (!dryRun && !apply) {
    console.log("Usage: node scripts/sync-all.js [--dry-run] [--apply] [--pending-only]");
    console.log("  --dry-run       Show planned changes without modifying remote state");
    console.log("  --apply         Execute changes and update mapping");
    console.log("  --pending-only  Only sync tasks with status !== completed");
    process.exit(1);
  }

  const env = loadEnv();
  const modeFlag = dryRun ? "--dry-run" : "--apply";
  const extraFlags = pendingOnly ? ["--pending-only"] : [];
  let failed = false;

  // Step 1: Parse TODO.md
  console.log("========================================");
  console.log("Step 1: Parse TODO.md → local-tasks.json");
  console.log("========================================");
  if (!run("parse-todo.js", [])) {
    console.error("\n[sync-all] FAILED at parse-todo.js");
    process.exit(1);
  }

  // Step 2: TickTick
  if (env.TICKTICK_ACCESS_TOKEN) {
    console.log("\n========================================");
    console.log("Step 2: Sync to TickTick");
    console.log("========================================");
    if (!run("sync-ticktick.js", [modeFlag, ...extraFlags])) {
      console.error("\n[sync-all] TickTick sync failed (see output above).");
      failed = true;
    }
  } else {
    console.log("\n[sync-all] Skipping TickTick sync — TICKTICK_ACCESS_TOKEN not found in .env");
    console.log("           1. Register app at https://developer.ticktick.com/");
    console.log("           2. Add TICKTICK_CLIENT_ID and TICKTICK_CLIENT_SECRET to .env");
    console.log("           3. Run: node scripts/ticktick-oauth.js");
  }

  console.log("\n========================================");
  if (failed) {
    console.log("Sync completed with errors.");
    process.exit(1);
  } else {
    console.log("Sync completed successfully.");
  }
  console.log("========================================");
}

main().catch((err) => {
  console.error("[fatal]", err.message);
  process.exit(1);
});
