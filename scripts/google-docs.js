#!/usr/bin/env node
// scripts/google-docs.js
// Thin helper for Google Docs read/edit via allow-list.
// Usage:
//   node scripts/google-docs.js list
//   node scripts/google-docs.js find <query>
//   node scripts/google-docs.js read <alias|id> [--format=plain|markdown|json]
//   node scripts/google-docs.js diff <alias|id> <local-file>
//   node scripts/google-docs.js update <alias|id> --from=<local-file> [--apply]

const https = require("node:https");
const fs = require("node:fs");
const path = require("node:path");
const { URLSearchParams } = require("node:url");

const envPath = path.resolve(__dirname, "..", ".env");
const allowListPath = path.resolve(__dirname, "..", "docs/sync/google-docs.json");

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

function execOpenTabs(toolName, params) {
  const os = require("node:os");
  const { spawnSync } = require("node:child_process");
  const tmpFile = path.join(os.tmpdir(), `opentabs-${Date.now()}.json`);
  fs.writeFileSync(tmpFile, JSON.stringify(params || {}), "utf-8");
  const result = spawnSync("opentabs", ["tool", "call", toolName, "--params-file", tmpFile], {
    encoding: "utf-8",
    shell: true,
    timeout: 60000,
    env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
  });
  try { fs.unlinkSync(tmpFile); } catch {}
  if (result.error) {
    throw new Error(`OpenTabs exec error: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    throw new Error(`OpenTabs failed: ${stderr || result.stdout}`);
  }
  const stdout = result.stdout.trim();
  const jsonStart = stdout.search(/[\[{]/);
  if (jsonStart === -1) {
    throw new Error("OpenTabs returned no JSON");
  }
  return JSON.parse(stdout.slice(jsonStart));
}

function isOpentabsAvailable() {
  const { spawnSync } = require("node:child_process");
  const result = spawnSync("opentabs", ["--version"], { encoding: "utf-8", shell: true, timeout: 15000 });
  return result.status === 0;
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

async function apiGet(env, hostname, path) {
  const token = env.GOOGLE_ACCESS_TOKEN;
  const res = await request({
    hostname,
    path,
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    await refreshAccessToken(env);
    return apiGet(env, hostname, path);
  }
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`API GET ${path} failed: ${res.status} ${JSON.stringify(res.data)}`);
}

async function apiPost(env, hostname, path, body) {
  const token = env.GOOGLE_ACCESS_TOKEN;
  const postData = JSON.stringify(body);
  const res = await request({
    hostname,
    path,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  }, postData);
  if (res.status === 401) {
    await refreshAccessToken(env);
    return apiPost(env, hostname, path, body);
  }
  if (res.status >= 200 && res.status < 300) return res.data;
  throw new Error(`API POST ${path} failed: ${res.status} ${JSON.stringify(res.data)}`);
}

function loadAllowList() {
  const data = readJson(allowListPath);
  if (!data || !Array.isArray(data.docs)) {
    console.error("Invalid or missing allow-list:", allowListPath);
    console.error("Create it with at least one doc entry.");
    process.exit(1);
  }
  return data;
}

function resolveDoc(allowList, aliasOrId) {
  // Direct ID
  const byId = allowList.docs.find((d) => d.id === aliasOrId);
  if (byId) return byId;
  // Alias
  const byAlias = allowList.docs.find((d) => d.alias === aliasOrId);
  if (byAlias) return byAlias;
  return null;
}

// ---------- subcommands ----------

function cmdList() {
  const allowList = loadAllowList();
  console.log("Allow-listed docs:");
  for (const d of allowList.docs) {
    const perms = (d.permissions || []).join(", ");
    console.log(`  ${d.alias || "(no alias)"}  ${d.id}  [${perms}]  ${d.notes || ""}`);
  }
}

async function cmdFind(env, query) {
  // Drive search by title; bypasses allow-list (discovery tool)
  const q = encodeURIComponent(
    `name contains '${query.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.document' and trashed=false`
  );
  const data = await apiGet(env, "www.googleapis.com", `/drive/v3/files?q=${q}&pageSize=20&fields=files(id,name,modifiedTime)`);
  const files = data.files || [];
  if (!files.length) {
    console.log("No documents found.");
    return;
  }
  console.log(`Found ${files.length} document(s):`);
  for (const f of files) {
    console.log(`  ${f.id}  "${f.name}"  (modified ${f.modifiedTime})`);
  }
}

function extractPlainText(doc) {
  const paragraphs = [];
  const content = doc.body?.content || [];
  for (const el of content) {
    if (el.paragraph) {
      const runs = el.paragraph.elements || [];
      let line = "";
      for (const run of runs) {
        if (run.textRun && run.textRun.content) {
          line += run.textRun.content;
        }
      }
      paragraphs.push(line);
    }
  }
  return paragraphs.join("");
}

function extractMarkdown(doc) {
  const out = [];
  const content = doc.body?.content || [];
  for (const el of content) {
    if (el.paragraph) {
      const para = el.paragraph;
      const style = para.paragraphStyle?.namedStyleType || "";
      const runs = para.elements || [];
      let line = "";
      for (const run of runs) {
        if (run.textRun && run.textRun.content) {
          line += run.textRun.content;
        }
      }
      if (style.startsWith("HEADING_")) {
        const level = parseInt(style.replace("HEADING_", ""), 10);
        const prefix = "#".repeat(level) + " ";
        out.push(prefix + line.trimEnd());
      } else {
        out.push(line.trimEnd());
      }
    }
  }
  return out.join("\n") + "\n";
}

async function cmdRead(env, aliasOrId, format) {
  const allowList = loadAllowList();
  const docMeta = resolveDoc(allowList, aliasOrId);
  if (!docMeta) {
    console.error(`Doc "${aliasOrId}" not in allow-list. Add it to ${allowListPath} first.`);
    process.exit(1);
  }
  const doc = await apiGet(env, "docs.googleapis.com", `/v1/documents/${docMeta.id}`);
  if (format === "json") {
    console.log(JSON.stringify(doc, null, 2));
  } else if (format === "markdown") {
    console.log(extractMarkdown(doc));
  } else {
    console.log(extractPlainText(doc));
  }
}

async function cmdDiff(env, aliasOrId, localFilePath) {
  const allowList = loadAllowList();
  const docMeta = resolveDoc(allowList, aliasOrId);
  if (!docMeta) {
    console.error(`Doc "${aliasOrId}" not in allow-list.`);
    process.exit(1);
  }
  const doc = await apiGet(env, "docs.googleapis.com", `/v1/documents/${docMeta.id}`);
  const remoteText = extractPlainText(doc);
  if (!fs.existsSync(localFilePath)) {
    console.error("Local file not found:", localFilePath);
    process.exit(1);
  }
  const localText = fs.readFileSync(localFilePath, "utf-8");
  if (remoteText === localText) {
    console.log("No differences.");
    process.exit(0);
  }
  console.log("Documents differ.");
  // Simple line diff
  const remoteLines = remoteText.split(/\r?\n/);
  const localLines = localText.split(/\r?\n/);
  const max = Math.max(remoteLines.length, localLines.length);
  let diffs = 0;
  for (let i = 0; i < max; i++) {
    if (remoteLines[i] !== localLines[i]) {
      diffs++;
      if (diffs <= 5) {
        console.log(`\nLine ${i + 1}:`);
        console.log(`  remote: ${JSON.stringify(remoteLines[i] || "(missing)")}`);
        console.log(`  local:  ${JSON.stringify(localLines[i] || "(missing)")}`);
      }
    }
  }
  if (diffs > 5) console.log(`\n...and ${diffs - 5} more differing lines.`);
  process.exit(1);
}

// ---------- opentabs subcommands ----------

function cmdListOpentabs() {
  const data = execOpenTabs("google-docs_list_recent_documents", { page_size: 50 });
  const docs = data.documents || [];
  if (!docs.length) {
    console.log("No recent documents found.");
    return;
  }
  console.log("Recent docs:");
  for (const d of docs) {
    const modified = d.modified_time ? ` (modified ${d.modified_time})` : "";
    console.log(`  ${d.id}  "${d.title}"${modified}`);
  }
}

async function cmdFindOpentabs(env, query) {
  const data = execOpenTabs("google-docs_search_documents", { query });
  const docs = data.documents || [];
  if (!docs.length) {
    console.log("No documents found.");
    return;
  }
  console.log(`Found ${docs.length} document(s):`);
  for (const f of docs) {
    const modified = f.modified_time ? ` (modified ${f.modified_time})` : "";
    console.log(`  ${f.id}  "${f.title}"${modified}`);
  }
}

async function cmdReadOpentabs(env, aliasOrId, format) {
  const allowList = loadAllowList();
  const docMeta = resolveDoc(allowList, aliasOrId);
  if (!docMeta) {
    console.error(`Doc "${aliasOrId}" not in allow-list. Add it to ${allowListPath} first.`);
    process.exit(1);
  }
  const data = execOpenTabs("google-docs_get_document_text", { document_id: docMeta.id });
  if (format === "json") {
    console.log(JSON.stringify(data, null, 2));
  } else if (format === "markdown") {
    console.log(data.text || "");
    console.error("[warn] OpenTabs returns plain text; markdown conversion is not available in --opentabs mode.");
  } else {
    console.log(data.text || "");
  }
}

async function cmdDiffOpentabs(env, aliasOrId, localFilePath) {
  const allowList = loadAllowList();
  const docMeta = resolveDoc(allowList, aliasOrId);
  if (!docMeta) {
    console.error(`Doc "${aliasOrId}" not in allow-list.`);
    process.exit(1);
  }
  const data = execOpenTabs("google-docs_get_document_text", { document_id: docMeta.id });
  const remoteText = data.text || "";
  if (!fs.existsSync(localFilePath)) {
    console.error("Local file not found:", localFilePath);
    process.exit(1);
  }
  const localText = fs.readFileSync(localFilePath, "utf-8");
  if (remoteText === localText) {
    console.log("No differences.");
    process.exit(0);
  }
  console.log("Documents differ.");
  const remoteLines = remoteText.split(/\r?\n/);
  const localLines = localText.split(/\r?\n/);
  const max = Math.max(remoteLines.length, localLines.length);
  let diffs = 0;
  for (let i = 0; i < max; i++) {
    if (remoteLines[i] !== localLines[i]) {
      diffs++;
      if (diffs <= 5) {
        console.log(`\nLine ${i + 1}:`);
        console.log(`  remote: ${JSON.stringify(remoteLines[i] || "(missing)")}`);
        console.log(`  local:  ${JSON.stringify(localLines[i] || "(missing)")}`);
      }
    }
  }
  if (diffs > 5) console.log(`\n...and ${diffs - 5} more differing lines.`);
  process.exit(1);
}

async function cmdUpdate(env, aliasOrId, localFilePath, apply) {
  const allowList = loadAllowList();
  const docMeta = resolveDoc(allowList, aliasOrId);
  if (!docMeta) {
    console.error(`Doc "${aliasOrId}" not in allow-list.`);
    process.exit(1);
  }
  const perms = docMeta.permissions || [];
  if (!perms.includes("write")) {
    console.error(`Doc "${aliasOrId}" does not have "write" permission in allow-list.`);
    process.exit(1);
  }
  if (!fs.existsSync(localFilePath)) {
    console.error("Local file not found:", localFilePath);
    process.exit(1);
  }
  const newText = fs.readFileSync(localFilePath, "utf-8");

  // Fetch current doc to get body range
  const doc = await apiGet(env, "docs.googleapis.com", `/v1/documents/${docMeta.id}`);
  const body = doc.body;
  if (!body || !body.content || body.content.length === 0) {
    console.error("Document has no body content.");
    process.exit(1);
  }

  // Check for rich structural elements we can't safely replace
  let hasRich = false;
  for (const el of body.content) {
    if (el.table || el.sectionBreak || el.tableOfContents) {
      hasRich = true;
      break;
    }
  }
  if (hasRich) {
    console.error("Document contains tables, section breaks, or TOC. Plain-text update would lose structure.");
    console.error("Use the Google Docs UI for this doc, or export and re-import manually.");
    process.exit(1);
  }

  const endIndex = body.content[body.content.length - 1].endIndex;

  if (!apply) {
    console.log(`[dry-run] Would replace body of doc "${aliasOrId}" (${docMeta.id})`);
    console.log(`          Current body length: ${endIndex - 1} chars`);
    console.log(`          New text length: ${newText.length} chars`);
    console.log(`          First 200 chars of new text: ${JSON.stringify(newText.slice(0, 200))}`);
    console.log("          Run with --apply to execute.");
    return;
  }

  // batchUpdate: delete existing body content (from 1 to endIndex), then insert new text at 1
  const requests = [
    { deleteContentRange: { range: { startIndex: 1, endIndex } } },
    { insertText: { location: { index: 1 }, text: newText } },
  ];

  const result = await apiPost(env, "docs.googleapis.com", `/v1/documents/${docMeta.id}:batchUpdate`, {
    requests,
  });
  console.log(`[update] Doc "${aliasOrId}" updated.`);
  console.log(`         Revisions: ${result.revisionId || "n/a"}`);
}

// Expose internals for testing
module.exports = {
  loadAllowList,
  resolveDoc,
  extractPlainText,
  extractMarkdown,
};

// ---------- main ----------

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("Usage:");
    console.log("  node scripts/google-docs.js list [--opentabs]");
    console.log("  node scripts/google-docs.js find <query> [--opentabs]");
    console.log("  node scripts/google-docs.js read <alias|id> [--format=plain|markdown|json] [--opentabs]");
    console.log("  node scripts/google-docs.js diff <alias|id> <local-file> [--opentabs]");
    console.log("  node scripts/google-docs.js update <alias|id> --from=<local-file> [--apply]");
    console.log("");
    console.log("  --opentabs   Use the OpenTabs Google Docs plugin (bypasses OAuth tokens).");
    console.log("               Note: update is not supported in --opentabs mode.");
    process.exit(1);
  }

  const useOpentabs = args.includes("--opentabs");
  const filteredArgs = args.filter((a) => a !== "--opentabs");
  const cmd = filteredArgs[0];

  if (cmd === "list") {
    if (useOpentabs) {
      if (!isOpentabsAvailable()) {
        console.error("OpenTabs CLI not found. Make sure it is installed and on PATH.");
        process.exit(1);
      }
      cmdListOpentabs();
    } else {
      cmdList();
    }
    return;
  }

  const env = loadEnv();
  if (!useOpentabs && !env.GOOGLE_REFRESH_TOKEN) {
    console.error("Missing GOOGLE_REFRESH_TOKEN in .env");
    console.error("Run: node scripts/google-oauth.js");
    console.error("Or use --opentabs to bypass OAuth.");
    process.exit(1);
  }

  if (cmd === "find") {
    if (!filteredArgs[1]) {
      console.error("Usage: node scripts/google-docs.js find <query> [--opentabs]");
      process.exit(1);
    }
    if (useOpentabs) {
      if (!isOpentabsAvailable()) {
        console.error("OpenTabs CLI not found. Make sure it is installed and on PATH.");
        process.exit(1);
      }
      await cmdFindOpentabs(env, filteredArgs[1]);
    } else {
      await cmdFind(env, filteredArgs[1]);
    }
    return;
  }

  if (cmd === "read") {
    if (!filteredArgs[1]) {
      console.error("Usage: node scripts/google-docs.js read <alias|id> [--format=plain|markdown|json] [--opentabs]");
      process.exit(1);
    }
    const formatArg = filteredArgs.find((a) => a.startsWith("--format="));
    const format = formatArg ? formatArg.split("=")[1] : "plain";
    if (useOpentabs) {
      if (!isOpentabsAvailable()) {
        console.error("OpenTabs CLI not found. Make sure it is installed and on PATH.");
        process.exit(1);
      }
      await cmdReadOpentabs(env, filteredArgs[1], format);
    } else {
      await cmdRead(env, filteredArgs[1], format);
    }
    return;
  }

  if (cmd === "diff") {
    if (!filteredArgs[1] || !filteredArgs[2]) {
      console.error("Usage: node scripts/google-docs.js diff <alias|id> <local-file> [--opentabs]");
      process.exit(1);
    }
    if (useOpentabs) {
      if (!isOpentabsAvailable()) {
        console.error("OpenTabs CLI not found. Make sure it is installed and on PATH.");
        process.exit(1);
      }
      await cmdDiffOpentabs(env, filteredArgs[1], filteredArgs[2]);
    } else {
      await cmdDiff(env, filteredArgs[1], filteredArgs[2]);
    }
    return;
  }

  if (cmd === "update") {
    if (!filteredArgs[1]) {
      console.error("Usage: node scripts/google-docs.js update <alias|id> --from=<local-file> [--apply]");
      process.exit(1);
    }
    if (useOpentabs) {
      console.error("update is not supported in --opentabs mode. The OpenTabs plugin does not expose document body edits.");
      console.error("Run without --opentabs after obtaining a valid OAuth token.");
      process.exit(1);
    }
    const fromArg = filteredArgs.find((a) => a.startsWith("--from="));
    if (!fromArg) {
      console.error("Missing --from=<local-file>");
      process.exit(1);
    }
    const localFile = fromArg.split("=")[1];
    const apply = filteredArgs.includes("--apply");
    await cmdUpdate(env, filteredArgs[1], localFile, apply);
    return;
  }

  console.error("Unknown command:", cmd);
  process.exit(1);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("[fatal]", err.message);
    process.exit(1);
  });
}
