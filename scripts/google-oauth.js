#!/usr/bin/env node
// scripts/google-oauth.js
// One-shot OAuth helper for Google APIs.
// Usage: node scripts/google-oauth.js [--scope=documents,drive.readonly]
// Opens browser, captures callback on localhost:3000, writes tokens to .env.

const https = require("node:https");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URLSearchParams } = require("node:url");

const envPath = path.resolve(__dirname, "..", ".env");
const DEFAULT_SCOPES = [
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/drive.readonly",
];

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

function updateEnv(key, value) {
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(content)) {
    content = content.replace(re, `${key}=${value}`);
  } else {
    content += content.endsWith("\n") ? `${key}=${value}\n` : `\n${key}=${value}\n`;
  }
  fs.writeFileSync(envPath, content, "utf-8");
}

function buildAuthUrl(clientId, redirectUri, scopes) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeCode(env, code, redirectUri, scopes) {
  const postData = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  }).toString();

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "oauth2.googleapis.com",
      path: "/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
    }, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        try {
          const data = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300 && data.refresh_token) {
            resolve(data);
          } else {
            reject(new Error(`Token exchange failed: ${res.statusCode} ${body}`));
          }
        } catch {
          reject(new Error(`Token exchange failed: ${res.statusCode} ${body}`));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error("Request timeout")); });
    req.write(postData);
    req.end();
  });
}

function startCallbackServer(env, redirectUri, scopes) {
  const url = new URL(redirectUri);
  const port = url.port || 3000;

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const reqUrl = new URL(req.url, `http://localhost:${port}`);
      const code = reqUrl.searchParams.get("code");
      const error = reqUrl.searchParams.get("error");

      if (error) {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end(`<h1>OAuth Error</h1><p>${error}</p><p>You can close this tab.</p>`);
        server.close();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }

      if (!code) {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end("<h1>Missing code</h1><p>No authorization code received.</p>");
        server.close();
        reject(new Error("No authorization code in callback"));
        return;
      }

      try {
        const tokens = await exchangeCode(env, code, redirectUri, scopes);
        updateEnv("GOOGLE_REFRESH_TOKEN", tokens.refresh_token);
        updateEnv("GOOGLE_ACCESS_TOKEN", tokens.access_token);

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`<h1>Success</h1><p>Tokens saved to .env. You can close this tab.</p>`);
        server.close();
        resolve(tokens);
      } catch (err) {
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end(`<h1>Error</h1><p>${err.message}</p>`);
        server.close();
        reject(err);
      }
    });

    server.listen(port, () => {
      console.log(`[server] Listening on http://localhost:${port} for OAuth callback...`);
    });

    server.on("error", (err) => {
      reject(new Error(`Server error: ${err.message}`));
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const scopeArg = args.find((a) => a.startsWith("--scope="));
  let scopes = DEFAULT_SCOPES;
  if (scopeArg) {
    const raw = scopeArg.split("=")[1];
    scopes = raw.split(",").map((s) => {
      if (s.startsWith("https://")) return s;
      // Allow shorthand aliases
      const map = {
        documents: "https://www.googleapis.com/auth/documents",
        "drive.readonly": "https://www.googleapis.com/auth/drive.readonly",
        tasks: "https://www.googleapis.com/auth/tasks",
        "drive.file": "https://www.googleapis.com/auth/drive.file",
      };
      if (map[s]) return map[s];
      throw new Error(`Unknown scope shorthand: ${s}`);
    });
  }

  const env = loadEnv();
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env");
    process.exit(1);
  }

  let redirectUri = env.GOOGLE_REDIRECT_URI || "http://localhost:3000";
  // If the stored redirect URI is bare http://localhost without a port, default to 3000
  if (redirectUri === "http://localhost" || redirectUri === "https://localhost") {
    redirectUri = "http://localhost:3000";
  }

  console.log("[auth] Requesting scopes:");
  for (const s of scopes) console.log(`  - ${s}`);
  console.log("");

  const authUrl = buildAuthUrl(env.GOOGLE_CLIENT_ID, redirectUri, scopes);
  console.log("[auth] Open this URL in your browser (should auto-open):");
  console.log(authUrl);
  console.log("");

  // Try to auto-open browser
  const { spawn } = require("node:child_process");
  const platform = process.platform;
  try {
    if (platform === "win32") {
      // Use empty-string title so authUrl with & is treated as the URL, not parsed by cmd
      spawn("cmd", ["/c", "start", "", authUrl], { detached: true, stdio: "ignore" });
    } else if (platform === "darwin") {
      spawn("open", [authUrl], { detached: true, stdio: "ignore" });
    } else {
      spawn("xdg-open", [authUrl], { detached: true, stdio: "ignore" });
    }
  } catch {
    // ignore auto-open failure
  }

  try {
    const tokens = await startCallbackServer(env, redirectUri, scopes);
    console.log("[done] Refresh token saved.");
    console.log("[done] Access token saved (expires in", tokens.expires_in, "seconds).");
  } catch (err) {
    console.error("[fatal]", err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
