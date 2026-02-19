// src/api/db.ts

export async function fetchDbDump(): Promise<any[]> {
    const url = import.meta.env.BASE_URL + "data/db.json";
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Cannot load db.json");
    return await res.json();
  }
  
  /**
   * Format phpMyAdmin JSON:
   * [
   *   { type: "header" },
   *   { type: "database" },
   *   { type: "table", name: "exercises", data: [...] }
   * ]
   */
  export function pickTable(dump: any[], tableName: string): any[] {
    if (!Array.isArray(dump)) return [];
  
    const table = dump.find(
      (item) => item.type === "table" && item.name === tableName
    );
  
    if (!table) return [];
  
    return Array.isArray(table.data) ? table.data : [];
  }
  
  export function safeParse<T>(raw: any, fallback: T): T {
    try {
      if (raw == null) return fallback;
      if (typeof raw === "string") return JSON.parse(raw);
      return raw;
    } catch {
      return fallback;
    }
  }
  