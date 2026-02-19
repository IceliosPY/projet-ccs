import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INPUT = path.join(ROOT, "public", "data", "css_db.json");
const OUTPUT = path.join(ROOT, "public", "data", "modules.json");

function pickTable(db, tableName) {
  const t = db.find((x) => x?.type === "table" && x?.name === tableName);
  return Array.isArray(t?.data) ? t.data : [];
}

function toNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function safeJsonArray(v) {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {}
  }
  return [];
}

const raw = JSON.parse(fs.readFileSync(INPUT, "utf8"));

// ton export est un tableau: [header, database, table, table, ...]
if (!Array.isArray(raw)) {
  throw new Error("css_db.json doit être un tableau (export phpMyAdmin JSON).");
}

const modulesRows = pickTable(raw, "modules");
const exercisesRows = pickTable(raw, "exercises");

// Index exercises par module_id
const exercisesByModule = new Map();
for (const e of exercisesRows) {
  const moduleId = toNum(e.module_id ?? e.moduleId);
  if (!exercisesByModule.has(moduleId)) exercisesByModule.set(moduleId, []);
  exercisesByModule.get(moduleId).push(e);
}

const modules = modulesRows
  .map((m) => {
    const id = toNum(m.id);
    const orderIndex = toNum(m.order_index ?? m.orderIndex);
    const title = String(m.title ?? "");
    const description = String(m.description ?? "");

    const exRows = exercisesByModule.get(id) ?? [];
    const exercises = exRows
      .map((e) => ({
        id: toNum(e.id),
        moduleId: toNum(e.module_id ?? e.moduleId ?? id),
        title: String(e.title ?? ""),
        instructionsHtml: String(e.instructions_html ?? e.instructionsHtml ?? ""),
        kind: (e.kind === "blockly" ? "blockly" : "puzzle"),
        codeParts: safeJsonArray(e.code_parts_json ?? e.codeParts ?? e.code_parts),
        orderedCode: String(e.ordered_code ?? e.orderedCode ?? ""),
        orderIndex: toNum(e.order_index ?? e.orderIndex),
      }))
      .sort((a, b) => a.orderIndex - b.orderIndex || a.id - b.id);

    return { id, title, description, orderIndex, exercises };
  })
  .sort((a, b) => a.orderIndex - b.orderIndex || a.id - b.id);

const out = { modules };

fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2), "utf8");
console.log(`✅ modules.json généré: ${path.relative(ROOT, OUTPUT)}`);
console.log(`   Modules: ${modules.length} | Exercices: ${modules.reduce((n, m) => n + m.exercises.length, 0)}`);
