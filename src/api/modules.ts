// src/api/modules.ts

export type UiExercise = {
    id: number;
    moduleId: number;
    title: string;
    instructionsHtml: string;
    kind: "puzzle" | "blockly";
    codeParts: string[];
    orderedCode: string;
    orderIndex: number;
  };
  
  export type Module = {
    id: number;
    title: string;
    description: string;
    orderIndex: number;
    exercises: UiExercise[];
  };
  
  function toNumber(v: any, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  
  function safeJsonArray(v: any): string[] {
    if (Array.isArray(v)) return v.map(String);
    if (typeof v === "string") {
      try {
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {}
    }
    return [];
  }
  
  /**
   * IMPORTANT
   * - en DEV (vite): tu peux appeler le PHP de XAMPP via http://localhost/ccs/api/modules.php
   * - en BUILD (Github Pages): tu devras servir un JSON statique (on verra juste après)
   */
  const DEFAULT_URL = import.meta.env.DEV
  ? "http://localhost/ccs/api/modules.php"
  : `${import.meta.env.BASE_URL}data/modules.json`;

  
  export async function fetchModules(url: string = DEFAULT_URL): Promise<Module[]> {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`fetchModules failed: ${res.status} ${res.statusText}`);
  
    const raw = await res.json();
  
    // On accepte 2 formats:
    // 1) { modules: [...] }
    // 2) [...] directement
    const modulesRaw = Array.isArray(raw) ? raw : raw?.modules;
    if (!Array.isArray(modulesRaw)) throw new Error("Bad modules payload (expected array)");
  
    const modules: Module[] = modulesRaw.map((m: any) => ({
      id: toNumber(m.id),
      title: String(m.title ?? ""),
      description: String(m.description ?? ""),
      orderIndex: toNumber(m.orderIndex ?? m.order_index ?? 0),
      exercises: Array.isArray(m.exercises)
        ? m.exercises.map((e: any) => ({
            id: toNumber(e.id),
            moduleId: toNumber(e.moduleId ?? e.module_id ?? m.id),
            title: String(e.title ?? ""),
            instructionsHtml: String(e.instructionsHtml ?? e.instructions_html ?? ""),
            kind: (e.kind === "blockly" ? "blockly" : "puzzle") as "puzzle" | "blockly",
            codeParts: safeJsonArray(e.codeParts ?? e.code_parts ?? e.code_parts_json),
            orderedCode: String(e.orderedCode ?? e.ordered_code ?? ""),
            orderIndex: toNumber(e.orderIndex ?? e.order_index ?? 0),
          }))
        : [],
    }));
  
    // Tri propre
    modules.sort((a, b) => a.orderIndex - b.orderIndex);
    for (const m of modules) m.exercises.sort((a, b) => a.orderIndex - b.orderIndex);
  
    return modules;
  }
  