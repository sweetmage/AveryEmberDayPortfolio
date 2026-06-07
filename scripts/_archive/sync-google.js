#!/usr/bin/env node
// scripts/sync-google.js
// Syncs docs/sync/local-tasks.json outbound to Google Tasks.
// Usage: node scripts/sync-google.js [--dry-run] [--apply] [--list-name="Portfolio Website"]

const https = require("node:https");
const fs = require("node:fs");
const path = require("node:path");
const { URLSearchParams } = require("node:url");

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

async function refreshAccessToken(env) {
  const postData = new URLSearchParams({
    refresh_token: env.GOOGLE_REFRESH_TOKEN,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    grant_type: "refresh_token",
  }).toString();

  const res = await request({
    hostname: "oauth2.googleapis.com",
    path: "/token",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData),
    },
  }, postData);

  if (res.status >= 200 && res.status < 300 && res.data.access_token) {
    // Update .env with new access token
    const envContent = fs.readFileSync(envPath, "utf-8");
    let newContent = envContent;
    if (newContent.includes("GOOGLE_ACCESS_TOKEN=")) {
      newContent = newContent.replace(/GOOGLE_ACCESS_TOKEN=.*/, `GOOGLE_ACCESS_TOKEN=${res.data.access_token}`);
    } else {
      newContent += `\nGOOGLE_ACCESS_TOKEN=${res.data.access_token}`;
    }
    fs.writeFileSync(envPath, newContent, "utf-8");
    env.GOOGLE_ACCESS_TOKEN = res.data.access_token;
    console.log("[auth] Google access token refreshed.");
    return res.data.access_token;
  }
  throw new Error(`Token refresh failed: ${res.status} ${JSON.stringify(res.data)}`);
}

async function apiGet(env, path) {
  const token = env.GOOGLE_ACCESS_TOKEN;
  const res = await request({
    hostname: "tasks.googleapis.com",
    path: `/tasks/v1${path}`,
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    await refreshAccessToken(env);
    return apiGet(env, path); // retry once
  }
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`API GET ${path} failed: ${res.status} ${JSON.stringify(res.data)}`);
}

async function apiPost(env, path, body) {
  const token = env.GOOGLE_ACCESS_TOKEN;
  const postData = JSON.stringify(body);
  const res = await request({
    hostname: "tasks.googleapis.com",
    path: `/tasks/v1${path}`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  }, postData);
  if (res.status === 401) {
    await refreshAccessToken(env);
    return apiPost(env, path, body); // retry once
  }
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`API POST ${path} failed: ${res.status} ${JSON.stringify(res.data)}`);
}

async function apiPut(env, path, body) {
  const token = env.GOOGLE_ACCESS_TOKEN;
  const postData = JSON.stringify(body);
  const res = await request({
    hostname: "tasks.googleapis.com",
    path: `/tasks/v1${path}`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  }, postData);
  if (res.status === 401) {
    await refreshAccessToken(env);
    return apiPut(env, path, body); // retry once
  }
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`API PUT ${path} failed: ${res.status} ${JSON.stringify(res.data)}`);
}

async function apiDelete(env, path) {
  const token = env.GOOGLE_ACCESS_TOKEN;
  const res = await request({
    hostname: "tasks.googleapis.com",
    path: `/tasks/v1${path}`,
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    await refreshAccessToken(env);
    return apiDelete(env, path); // retry once
  }
  if (res.status >= 200 && res.status < 300) return true;
  throw new Error(`API DELETE ${path} failed: ${res.status} ${JSON.stringify(res.data)}`);
}

async function findOrCreateTaskList(env, listName) {
  const lists = await apiGet(env, "/users/@me/lists");
  let list = (lists.items || []).find((l) => l.title === listName);
  if (list) {
    console.log(`[list] Found existing task list: "${listName}" (${list.id})`);
    return list.id;
  }
  console.log(`[list] Creating task list: "${listName}"`);
  const created = await apiPost(env, "/users/@me/lists", { title: listName });
  return created.id;
}

async function fetchRemoteTasks(env, listId) {
  const all = [];
  let nextPageToken = null;
  do {
    const path = nextPageToken
      ? `/lists/${listId}/tasks?pageToken=${encodeURIComponent(nextPageToken)}`
      : `/lists/${listId}/tasks`;
    const result = await apiGet(env, path);
    if (result.items) all.push(...result.items);
    nextPageToken = result.nextPageToken || null;
  } while (nextPageToken);
  return all.filter((t) => t.id);
}

function buildRemoteIdMap(remoteTasks) {
  const map = {};
  for (const t of remoteTasks) {
    // Try to extract localId from notes if previously synced
    const note = t.notes || "";
    const match = note.match(/localId:\s*(\S+)/);
    if (match) {
      map[match[1]] = t.id;
    }
  }
  return map;
}

function buildNotes(task) {
  const lines = [];
  lines.push(`localId: ${task.id}`);
  if (task.tags && task.tags.length) lines.push(`tags: ${task.tags.join(", ")}`);
  if (task.list) lines.push(`list: ${task.list}`);
  return lines.join("\n");
}

function parseRemoteNotes(notes = "") {
  const localIdMatch = notes.match(/localId:\s*(\S+)/);
  return localIdMatch ? localIdMatch[1] : null;
}

async function runPurge(env, listName, dryRun, apply) {
  console.log(`[purge] Target: Google Tasks — list "${listName}"`);
  console.log(`[purge] Mode: ${dryRun ? "DRY-RUN" : "APPLY"}`);
  console.log("");

  // Auth + list setup
  let listId;
  try {
    listId = await findOrCreateTaskList(env, listName);
  } catch (err) {
    console.error("[auth/list] Failed:", err.message);
    process.exit(1);
  }

  // Fetch remote tasks
  let remoteTasks;
  try {
    remoteTasks = await fetchRemoteTasks(env, listId);
  } catch (err) {
    console.error("[fetch] Failed:", err.message);
    process.exit(1);
  }

  // Identify synced tasks (those with localId: in notes)
  const synced = [];
  const unknown = [];
  for (const t of remoteTasks) {
    if (parseRemoteNotes(t.notes)) {
      synced.push(t);
    } else {
      unknown.push(t);
    }
  }

  let mapping = readJson(mappingPath) || { version: "1.0", ticktick: {}, google: {} };

  console.log(`[purge] Total tasks in list: ${remoteTasks.length}`);
  console.log(`[purge] Synced tasks (will delete): ${synced.length}`);
  console.log(`[purge] Unsynced / user-added tasks (will skip): ${unknown.length}`);
  console.log("");

  // Also detect mapping entries for tasks already gone from the list
  const remoteIdsInList = new Set(remoteTasks.map((t) => t.id));
  const orphanedMappings = [];
  for (const localId of Object.keys(mapping.google || {})) {
    const remoteId = mapping.google[localId];
    if (!remoteIdsInList.has(remoteId)) {
      orphanedMappings.push({ localId, remoteId });
    }
  }
  if (orphanedMappings.length) {
    console.log(`[purge] Orphaned mapping entries (already missing from list): ${orphanedMappings.length}`);
  }
  console.log("");

  if (dryRun) {
    for (const t of synced) {
      const lid = parseRemoteNotes(t.notes);
      console.log(`[DELETE]  "${t.title}" (localId: ${lid}, remoteId: ${t.id})`);
    }
    for (const o of orphanedMappings) {
      console.log(`[CLEAR]   mapping entry ${o.localId} → ${o.remoteId} (task already missing)`);
    }
    console.log("\nDry-run complete. No remote changes made.");
    process.exit(0);
  }

  // Apply
  for (const t of synced) {
    const lid = parseRemoteNotes(t.notes);
    try {
      await apiDelete(env, `/lists/${listId}/tasks/${t.id}`);
      console.log(`[DELETE]  "${t.title}" (localId: ${lid}, remoteId: ${t.id})`);
      delete mapping.google[lid];
    } catch (err) {
      console.error(`[DELETE]  FAILED "${t.title}" (${t.id}):`, err.message);
    }
  }

  for (const o of orphanedMappings) {
    delete mapping.google[o.localId];
    console.log(`[CLEAR]   mapping entry ${o.localId} → ${o.remoteId} (task already missing)`);
  }

  writeJson(mappingPath, mapping);
  console.log("\n[done] Purge complete. Mapping updated.");
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const apply = args.includes("--apply");
  const pendingOnly = args.includes("--pending-only");
  const listNameArg = args.find((a) => a.startsWith("--list-name="));
  const listName = listNameArg ? listNameArg.split("=")[1] : "Portfolio Website";
  const purge = args.includes("--purge");

  const env = loadEnv();

  if (purge) {
    // Purge mode: standalone, only --dry-run and --apply are valid modifiers
    if (!dryRun && !apply) {
      console.log("Usage: node scripts/sync-google.js --purge [--dry-run] [--apply] [--list-name=\"Portfolio Website\"]");
      console.log("  --purge         Delete all previously-synced tasks (those with localId: in notes)");
      console.log("  --dry-run       Show planned deletions without modifying remote state");
      console.log("  --apply         Execute deletions and update mapping");
      process.exit(1);
    }
    return await runPurge(env, listName, dryRun, apply);
  }

  if (!dryRun && !apply) {
    console.log("Usage: node scripts/sync-google.js [--dry-run] [--apply] [--pending-only] [--list-name=\"Portfolio Website\"]");
    console.log("  --dry-run       Show planned changes without modifying remote state");
    console.log("  --apply         Execute changes and update mapping");
    console.log("  --pending-only  Only sync tasks with status !== completed");
    process.exit(1);
  }
  if (!env.GOOGLE_REFRESH_TOKEN) {
    console.error("Missing GOOGLE_REFRESH_TOKEN in .env");
    console.error("Run: node scripts/google-oauth.js");
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

  console.log(`[sync] Target: Google Tasks — list "${listName}"`);
  console.log(`[sync] Local tasks: ${localTasks.length}`);
  console.log(`[sync] Mode: ${dryRun ? "DRY-RUN" : "APPLY"}`);
  console.log("");

  // Auth + list setup
  let listId;
  try {
    listId = await findOrCreateTaskList(env, listName);
  } catch (err) {
    console.error("[auth/list] Failed:", err.message);
    process.exit(1);
  }

  // Fetch remote tasks
  let remoteTasks;
  try {
    remoteTasks = await fetchRemoteTasks(env, listId);
  } catch (err) {
    console.error("[fetch] Failed:", err.message);
    process.exit(1);
  }

  const remoteByLocalId = {};
  const remoteById = {};
  for (const t of remoteTasks) {
    remoteById[t.id] = t;
    const lid = parseRemoteNotes(t.notes);
    if (lid) remoteByLocalId[lid] = t;
  }

  // Diff
  const toCreate = [];
  const toUpdate = [];
  const toComplete = [];
  const toDelete = []; // map entries for tasks removed from local

  for (const task of localTasks) {
    const mappedId = mapping.google[task.id];
    const remoteTask = mappedId ? remoteById[mappedId] : remoteByLocalId[task.id];

    if (!remoteTask) {
      // New task
      toCreate.push(task);
    } else {
      // Existing task — ensure mapping is updated if we found it by notes
      if (!mappedId) {
        mapping.google[task.id] = remoteTask.id;
      }

      if (task.status === "completed" && remoteTask.status !== "completed") {
        toComplete.push({ task, remoteId: remoteTask.id });
      } else if (task.status !== "completed") {
        // Check for title change
        if (task.title !== remoteTask.title) {
          toUpdate.push({ task, remoteId: remoteTask.id });
        }
      }
    }
  }

  // Detect deleted local tasks (in mapping but not in local-tasks.json)
  const localIds = new Set(localTasks.map((t) => t.id));
  for (const localId of Object.keys(mapping.google)) {
    if (!localIds.has(localId)) {
      toDelete.push(localId);
    }
  }

  // Report
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
    for (const d of toDelete) console.log(`[DELETE]  mapping ${d} → ${mapping.google[d]}`);
    console.log("\nDry-run complete. No remote changes made.");
    process.exit(0);
  }

  // Apply
  for (const t of toCreate) {
    try {
      const created = await apiPost(env, `/lists/${listId}/tasks`, {
        title: t.title,
        notes: buildNotes(t),
      });
      mapping.google[t.id] = created.id;
      console.log(`[CREATE]  "${t.title}" → ${created.id}`);
    } catch (err) {
      console.error(`[CREATE]  FAILED "${t.title}":`, err.message);
    }
  }

  for (const u of toUpdate) {
    try {
      await apiPut(env, `/lists/${listId}/tasks/${u.remoteId}`, {
        id: u.remoteId,
        title: u.task.title,
        notes: buildNotes(u.task),
      });
      console.log(`[UPDATE]  "${u.task.title}" (${u.remoteId})`);
    } catch (err) {
      console.error(`[UPDATE]  FAILED "${u.task.title}":`, err.message);
    }
  }

  for (const c of toComplete) {
    try {
      await apiPut(env, `/lists/${listId}/tasks/${c.remoteId}`, {
        id: c.remoteId,
        status: "completed",
      });
      console.log(`[COMPLETE] "${c.task.title}" (${c.remoteId})`);
    } catch (err) {
      console.error(`[COMPLETE] FAILED "${c.task.title}":`, err.message);
    }
  }

  for (const d of toDelete) {
    try {
      await apiDelete(env, `/lists/${listId}/tasks/${mapping.google[d]}`);
      console.log(`[DELETE]  ${mapping.google[d]}`);
    } catch (err) {
      console.error(`[DELETE]  FAILED ${mapping.google[d]}:`, err.message);
    }
    delete mapping.google[d];
  }

  writeJson(mappingPath, mapping);
  console.log("\n[done] Mapping updated.");
}

main().catch((err) => {
  console.error("[fatal]", err.message);
  process.exit(1);
});
