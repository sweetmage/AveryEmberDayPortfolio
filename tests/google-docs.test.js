const { describe, it } = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const fs = require("node:fs");

const { loadAllowList, resolveDoc, extractPlainText, extractMarkdown } = require("../scripts/google-docs.js");

const allowListPath = path.resolve(__dirname, "..", "docs/sync/google-docs.json");

// ---------- loadAllowList + resolveDoc ----------

// docs/sync/google-docs.json is user-owned and gitignored, and loadAllowList() calls
// process.exit(1) without it, so these three cases only run where the file exists.
describe("resolveDoc", {
  skip: !fs.existsSync(allowListPath) && "docs/sync/google-docs.json is user-owned and gitignored; absent on this checkout",
}, () => {
  it("finds by alias", () => {
    const list = loadAllowList();
    const doc = resolveDoc(list, "history-of-mistrust");
    assert.ok(doc);
    assert.strictEqual(doc.alias, "history-of-mistrust");
  });

  it("finds by id when present", () => {
    const list = loadAllowList();
    // Use the id from the alias we know exists
    const byAlias = resolveDoc(list, "history-of-mistrust");
    if (byAlias && byAlias.id && !byAlias.id.startsWith("<")) {
      const byId = resolveDoc(list, byAlias.id);
      assert.ok(byId);
      assert.strictEqual(byId.alias, "history-of-mistrust");
    }
  });

  it("returns null for unknown alias", () => {
    const list = loadAllowList();
    assert.strictEqual(resolveDoc(list, "nonexistent-alias-12345"), null);
  });
});

// ---------- text extraction ----------

describe("extractPlainText", () => {
  it("concatenates paragraphs", () => {
    const doc = {
      body: {
        content: [
          { paragraph: { elements: [{ textRun: { content: "Hello " } }, { textRun: { content: "world.\n" } }] } },
          { paragraph: { elements: [{ textRun: { content: "Second line.\n" } }] } },
        ],
      },
    };
    const text = extractPlainText(doc);
    assert.strictEqual(text, "Hello world.\nSecond line.\n");
  });

  it("handles empty doc", () => {
    const doc = { body: { content: [] } };
    assert.strictEqual(extractPlainText(doc), "");
  });
});

describe("extractMarkdown", () => {
  it("converts headings", () => {
    const doc = {
      body: {
        content: [
          { paragraph: { paragraphStyle: { namedStyleType: "HEADING_1" }, elements: [{ textRun: { content: "Title\n" } }] } },
          { paragraph: { paragraphStyle: { namedStyleType: "NORMAL_TEXT" }, elements: [{ textRun: { content: "Body.\n" } }] } },
          { paragraph: { paragraphStyle: { namedStyleType: "HEADING_2" }, elements: [{ textRun: { content: "Subtitle\n" } }] } },
        ],
      },
    };
    const md = extractMarkdown(doc);
    assert.ok(md.includes("# Title"));
    assert.ok(md.includes("Body."));
    assert.ok(md.includes("## Subtitle"));
  });
});

// ---------- allow-list enforcement ----------

/* Every command that touches a doc (`read`, `diff`, `update`, ...) gates on
   `resolveDoc(allowList, aliasOrId)` and exits before any API call when it
   returns null, so that function IS the enforcement. It is tested here
   against an inline allow-list, so it runs on every checkout.

   This replaced a subprocess test (2026-10-06, Final signoff finding) that
   accepted ANY non-zero exit. `main()` checks GOOGLE_REFRESH_TOKEN before it
   ever reaches the allow-list, so without real credentials that test passed on
   "Missing GOOGLE_REFRESH_TOKEN" and never exercised the allow-list at all. */
describe("allow-list enforcement", () => {
  const allowList = {
    version: "1.0",
    docs: [
      { alias: "allowed-doc", id: "1AbCdEfGhIjKlMnOp", permissions: ["read"] },
    ],
  };

  it("rejects an alias that is not on the list", () => {
    assert.strictEqual(resolveDoc(allowList, "definitely-not-in-allow-list-xyz"), null);
  });

  it("rejects a doc id that is not on the list", () => {
    assert.strictEqual(resolveDoc(allowList, "1ZzZzZzZzZzZzZzZz"), null);
  });

  it("accepts a listed alias and a listed id, returning the same entry", () => {
    const byAlias = resolveDoc(allowList, "allowed-doc");
    assert.ok(byAlias);
    assert.strictEqual(resolveDoc(allowList, "1AbCdEfGhIjKlMnOp"), byAlias);
  });

  it("never matches on a partial alias, either way round", () => {
    assert.strictEqual(resolveDoc(allowList, "allowed"), null);
    assert.strictEqual(resolveDoc(allowList, "allowed-doc-extra"), null);
  });
});

// ---------- purge filter unit (from retired sync-google.js logic) ----------

describe("purge filter", () => {
  it("selects only tasks with localId: in notes", () => {
    const tasks = [
      { id: "a", notes: "localId: task-1\nfoo" },
      { id: "b", notes: "user added task" },
      { id: "c", notes: "localId: task-3" },
      { id: "d", notes: "" },
      { id: "e" },
    ];
    const synced = tasks.filter((t) => {
      const note = t.notes || "";
      return /localId:\s*(\S+)/.test(note);
    });
    assert.strictEqual(synced.length, 2);
    assert.deepStrictEqual(synced.map((t) => t.id), ["a", "c"]);
  });
});
