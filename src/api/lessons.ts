// src/api/lessons.ts

export type Lesson = {
  title: string;
  fullExplanation: string; // HTML
  codeParts: string[];
  orderedCode: string;     // HTML final
};

/**
 * Base API:
 * - DEV (Vite): "/api" (proxy Vite -> /ccs/api)
 * - PROD (Apache /ccs/public): "/ccs/api"
 */
const API_BASE = import.meta.env.DEV ? "/api" : "/ccs/api";

export async function fetchLessons(): Promise<Lesson[]> {
  const res = await fetch(`${API_BASE}/lessons.php`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error("Invalid lessons payload");

  return data as Lesson[];
}
