#!/usr/bin/env node
// scripts/parse-todo.js
// Extracts task list items from TODO.md into a canonical local-tasks.json.
// Usage: node scripts/parse-todo.js [input.md] [output.json]

const fs = require("node:fs");
const path = require("node:path");

const inputPath = path.resolve(process.argv[2] || "TODO.md");
const outputPath = path.resolve(process.argv[3] || "docs/sync/local-tasks.json");

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 60);
}

function extractTag(sectionTitle) {
  const match = sectionTitle.match(/tag\s+`([^`]+)`/);
  return match ? match[1] : null;
}

function parseTodo(mdPath) {
  const content = fs.readFileSync(mdPath, "utf-8");
  const lines = content.split(/\r?\n/);

  const tasks = [];
  let currentSection = null;
  let sectionSlug = "";
  let sectionTag = null;
  let sectionLine = 0;
  let taskCounter = 0;
  let parentH2 = null;
  let parentH2Slug = "";
  let skipSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track section headings (h2, h3)
    const headingMatch = line.match(/^(#{2,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      currentSection = headingMatch[2].trim();
      sectionSlug = slugify(currentSection);
      sectionTag = extractTag(currentSection);
      sectionLine = i + 1;
      taskCounter = 0;

      if (level === 2) {
        parentH2 = currentSection;
        parentH2Slug = sectionSlug;
        // Skip purely historical/archive sections
        skipSection = currentSection.toLowerCase().includes("completed plans archive");
      }

      continue;
    }

    // Parse task list items: "- [x] ..." or "- [ ] ..."
    const taskMatch = line.match(/^(\s*)-\s+\[([xX\s])\]\s+(.*)$/);
    if (taskMatch && currentSection && !skipSection) {
      taskCounter++;
      const status = taskMatch[2].trim().toLowerCase() === "x" ? "completed" : "pending";
      let title = taskMatch[3].trim();

      // Extract inline tag like `(tag `name`)` from title
      const inlineTagMatch = title.match(/\(tag\s+`([^`]+)`\)/);
      const inlineTag = inlineTagMatch ? inlineTagMatch[1] : null;
      if (inlineTagMatch) {
        title = title.replace(inlineTagMatch[0], "").trim();
      }

      // Build stable ID from parent h2 + section + task number or text
      const numberMatch = title.match(/^(\d+)\.\s+/);
      const idSuffix = numberMatch ? numberMatch[1] : slugify(title).substring(0, 40);
      const idBase = parentH2Slug ? `${parentH2Slug}-${sectionSlug}` : sectionSlug;
      const id = `${idBase}-${idSuffix}`;

      const tags = [];
      if (sectionTag) tags.push(sectionTag);
      if (inlineTag) tags.push(inlineTag);
      // Add category tags based on section and parent h2 names
      const context = `${parentH2 || ""} ${currentSection}`.toLowerCase();
      if (context.includes("ticktick mirror")) tags.push("ticktick");
      if (context.includes("cross-target sync")) tags.push("sync-pipeline");
      if (context.includes("google")) tags.push("google");

      tasks.push({
        id,
        title,
        description: null,
        status,
        priority: "normal",
        tags: [...new Set(tags)],
        list: currentSection,
        sourceLine: i + 1,
      });
    }
  }

  return {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    source: path.relative(process.cwd(), mdPath).replace(/\\/g, "/"),
    tasks,
  };
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const data = parseTodo(inputPath);

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2) + "\n", "utf-8");

  const completed = data.tasks.filter((t) => t.status === "completed").length;
  const pending = data.tasks.filter((t) => t.status === "pending").length;

  console.log(`Parsed ${data.tasks.length} tasks from ${inputPath}`);
  console.log(`  Completed: ${completed}`);
  console.log(`  Pending:   ${pending}`);
  console.log(`Wrote ${outputPath}`);
}

main();
