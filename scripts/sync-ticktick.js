#!/usr/bin/env node
// scripts/sync-ticktick.js
// Syncs docs/sync/local-tasks.json outbound to TickTick via REST API.
// Usage: node scripts/sync-ticktick.js [--dry-run] [--apply] [--project-id=69c8addc8f0823c509e1979f]
// Requires: TICKTICK_ACCESS_TOKEN in .env (obtain via scripts/ticktick-oauth.js)

const https = require("node:https");
const fs = require("node:fs");
const path = require("node:path");

const envPath = path.resolve(__dirname, "..", ".env");
const localTasksPath = path.resolve(__dirname, "..", "docs/sync/local-tasks.json");
const mappingPath = path.resolve(__dirname, "..", "docs/sync/mapping.json");

function loadEnv() {
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env file at:", envPath);
    process.exit(1);
  }
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

function readJson(p) {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        try {
          const data = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error("Request timeout")); });
    if (postData) req.write(postData);
    req.end();
  });
}

function getApiBase(env) {
  return env.TICKTICK_API_BASE || "https://api.ticktick.com/open/v1";
}

async function apiGet(env, path) {
  const token = env.TICKTICK_ACCESS_TOKEN;
  if (!token) throw new Error("Missing TICKTICK_ACCESS_TOKEN in .env");
  const base = getApiBase(env);
  const parsed = new URL(base);
  const res = await request({
    hostname: parsed.hostname,
    path: `${parsed.pathname}${path}`,
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`API GET ${path} failed: ${res.status} ${JSON.stringify(res.data)}`);
}

async function apiPost(env, path, body) {
  const token = env.TICKTICK_ACCESS_TOKEN;
  if (!token) throw new Error("Missing TICKTICK_ACCESS_TOKEN in .env");
  const base = getApiBase(env);
  const parsed = new URL(base);
  const postData = JSON.stringify(body);
  const res = await request({
    hostname: parsed.hostname,
    path: `${parsed.pathname}${path}`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  }, postData);
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`API POST ${path} failed: ${res.status} ${JSON.stringify(res.data)}`);
}

async function apiDelete(env, path) {
  const token = env.TICKTICK_ACCESS_TOKEN;
  if (!token) throw new Error("Missing TICKTICK_ACCESS_TOKEN in .env");
  const base = getApiBase(env);
  const parsed = new URL(base);
  const res = await request({
    hostname: parsed.hostname,
    path: `${parsed.pathname}${path}`,
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status >= 200 && res.status < 300) return true;
  throw new Error(`API DELETE ${path} failed: ${res.status} ${JSON.stringify(res.data)}`);
}

async function fetchRemoteTasks(env, projectId) {
  // TickTick: fetch project data which includes tasks
  const data = await apiGet(env, `/project/${projectId}/data`);
  return (data && data.tasks) || [];
}

function buildTaskBody(task, projectId) {
  return {
    projectId,
    title: task.title,
    content: JSON.stringify({
      localId: task.id,
      tags: task.tags,
      list: task.list,
      priority: task.priority,
    }),
    status: task.status === "completed" ? 2 : 0, // 0 = normal, 2 = completed in TickTick
  };
}

function parseRemoteContent(content = "") {
  try {
    const data = JSON.parse(content);
    return data.localId || null;
  } catch (e) {
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const apply = args.includes("--apply");
  const pendingOnly = args.includes("--pending-only");
  const projectIdArg = args.find((a) => a.startsWith("--project-id="));
  const projectId = projectIdArg ? projectIdArg.split("=")[1] : "69c8addc8f0823c509e1979f";

  if (!dryRun && !apply) {
    console.log("Usage: node scripts/sync-ticktick.js [--dry-run] [--apply] [--pending-only] [--project-id=PROJECT_ID]");
    console.log("  --dry-run       Show planned changes without modifying remote state");
    console.log("  --apply         Execute changes and update mapping");
    console.log("  --pending-only  Only sync tasks with status !== completed");
    console.log("  --project-id    TickTick project ID to sync into (default: 69c8addc8f0823c509e1979f)");
    process.exit(1);
  }

  const env = loadEnv();
  if (!env.TICKTICK_ACCESS_TOKEN) {
    console.error("Missing TICKTICK_ACCESS_TOKEN in .env");
    console.error("Run: node scripts/ticktick-oauth.js");
    process.exit(1);
  }

  const localData = readJson(localTasksPath);
  if (!localData || !localData.tasks) {
    console.error("Invalid or missing local-tasks.json");
    process.exit(1);
  }
  let localTasks = localData.tasks;
  if (pendingOnly) {
    localTasks = localTasks.filter((t) => t.status !== "completed");
    console.log(`[filter] --pending-only: ${localTasks.length} pending tasks (skipped ${localData.tasks.length - localTasks.length} completed)`);
  }

  let mapping = readJson(mappingPath) || { version: "1.0", ticktick: {}, google: {} };

  console.log(`[sync] Target: TickTick — project ${projectId}`);
  console.log(`[sync] Local tasks: ${localTasks.length}`);
  console.log(`[sync] Mode: ${dryRun ? "DRY-RUN" : "APPLY"}`);
  console.log("");

  // Fetch remote tasks
  let remoteTasks;
  try {
    remoteTasks = await fetchRemoteTasks(env, projectId);
  } catch (err) {
    console.error("[fetch] Failed:", err.message);
    console.error("Tip: Verify TICKTICK_ACCESS_TOKEN and project ID.");
    console.error("Tip: Adjust TICKTICK_API_BASE if endpoints differ (default: https://api.ticktick.com/open/v1)");
    process.exit(1);
  }

  const remoteByLocalId = {};
  const remoteById = {};
  for (const t of remoteTasks) {
    remoteById[t.id] = t;
    const lid = parseRemoteContent(t.content);
    if (lid) remoteByLocalId[lid] = t;
  }

  // Diff
  const toCreate = [];
  const toUpdate = [];
  const toComplete = [];
  const toDelete = [];

  for (const task of localTasks) {
    const mappedId = mapping.ticktick[task.id];
    const remoteTask = mappedId ? remoteById[mappedId] : remoteByLocalId[task.id];

    if (!remoteTask) {
      toCreate.push(task);
    } else {
      if (!mappedId) {
        mapping.ticktick[task.id] = remoteTask.id;
      }

      const isCompleted = (remoteTask.status === 2 || remoteTask.status === "completed");
      if (task.status === "completed" && !isCompleted) {
        toComplete.push({ task, remoteId: remoteTask.id });
      } else if (task.status !== "completed") {
        if (task.title !== remoteTask.title) {
          toUpdate.push({ task, remoteId: remoteTask.id });
        }
      }
    }
  }

  const localIds = new Set(localTasks.map((t) => t.id));
  for (const localId of Object.keys(mapping.ticktick)) {
    if (!localIds.has(localId)) {
      toDelete.push(localId);
    }
  }

  console.log(`Planned changes:`);
  console.log(`  Create:   ${toCreate.length}`);
  console.log(`  Update:   ${toUpdate.length}`);
  console.log(`  Complete: ${toComplete.length}`);
  console.log(`  Delete:   ${toDelete.length}`);
  console.log("");

  if (dryRun) {
    for (const t of toCreate) console.log(`[CREATE]  "${t.title}" (${t.id})`);
    for (const u of toUpdate) console.log(`[UPDATE]  "${u.task.title}" (${u.remoteId})`);
    for (const c of toComplete) console.log(`[COMPLETE] "${c.task.title}" (${c.remoteId})`);
    for (const d of toDelete) console.log(`[DELETE]  mapping ${d} → ${mapping.ticktick[d]}`);
    console.log("\nDry-run complete. No remote changes made.");
    process.exit(0);
  }

  // Apply
  for (const t of toCreate) {
    try {
      const created = await apiPost(env, "/task", buildTaskBody(t, projectId));
      mapping.ticktick[t.id] = created.id;
      console.log(`[CREATE]  "${t.title}" → ${created.id}`);
    } catch (err) {
      console.error(`[CREATE]  FAILED "${t.title}":`, err.message);
    }
  }

  for (const u of toUpdate) {
    try {
      await apiPost(env, `/task/${u.remoteId}`, buildTaskBody(u.task, projectId));
      console.log(`[UPDATE]  "${u.task.title}" (${u.remoteId})`);
    } catch (err) {
      console.error(`[UPDATE]  FAILED "${u.task.title}":`, err.message);
    }
  }

  for (const c of toComplete) {
    try {
      // TickTick complete endpoint may vary; try the common path
      await apiPost(env, `/project/${projectId}/task/${c.remoteId}/complete`, {});
      console.log(`[COMPLETE] "${c.task.title}" (${c.remoteId})`);
    } catch (err) {
      console.error(`[COMPLETE] FAILED "${c.task.title}":`, err.message);
    }
  }

  for (const d of toDelete) {
    try {
      await apiDelete(env, `/project/${projectId}/task/${mapping.ticktick[d]}`);
      console.log(`[DELETE]  ${mapping.ticktick[d]}`);
    } catch (err) {
      console.error(`[DELETE]  FAILED ${mapping.ticktick[d]}:`, err.message);
    }
    delete mapping.ticktick[d];
  }

  writeJson(mappingPath, mapping);
  console.log("\n[done] Mapping updated.");
}

main().catch((err) => {
  console.error("[fatal]", err.message);
  process.exit(1);
});
