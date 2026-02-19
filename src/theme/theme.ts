import { FLAG_PALETTES } from "./palettes";

const KEY = "ccs_theme_palette_v1";

export function getThemePaletteKey(): string {
  const raw = localStorage.getItem(KEY);
  return raw && FLAG_PALETTES[raw] ? raw : "trans";
}

export function setThemePaletteKey(key: string) {
  if (!FLAG_PALETTES[key]) return;
  localStorage.setItem(KEY, key);
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mix(a: string, b: string, t: number) {
  const A = hexToRgb(a), B = hexToRgb(b);
  const r = Math.round(A.r + (B.r - A.r) * t);
  const g = Math.round(A.g + (B.g - A.g) * t);
  const b2 = Math.round(A.b + (B.b - A.b) * t);
  return `rgb(${r} ${g} ${b2})`;
}

/**
 * Génère des variables CSS :
 * --p1..--p7 (couleurs principales)
 * --accent (couleur d'action)
 * --bg (fond)
 * --card (cartes)
 * --text (texte)
 * --muted (texte secondaire)
 * --border, --shadow
 * + un background "flag" discret via --flag-grad
 */
export function applyTheme(paletteKey: string) {
  const colors = FLAG_PALETTES[paletteKey] ?? FLAG_PALETTES.trans;

  const root = document.documentElement;

  // p1..p7
  for (let i = 0; i < 7; i++) {
    root.style.setProperty(`--p${i + 1}`, colors[Math.min(i, colors.length - 1)]);
  }

  // accent = couleur la plus “vive” (on prend la première)
  const accent = colors[0];
  const accent2 = colors[Math.floor(colors.length / 2)] ?? accent;

  // Fond très doux à partir de l’accent + blanc
  const bg = mix(accent, "#ffffff", 0.92);
  const card = "rgba(255,255,255,0.9)";
  const text = "rgb(20 20 22)";
  const muted = "rgb(105 105 115)";
  const border = "rgba(0,0,0,0.08)";
  const shadow = "0 10px 30px rgba(0,0,0,0.10)";

  root.style.setProperty("--accent", accent);
  root.style.setProperty("--accent2", accent2);
  root.style.setProperty("--bg", bg);
  root.style.setProperty("--card", card);
  root.style.setProperty("--text", text);
  root.style.setProperty("--muted", muted);
  root.style.setProperty("--border", border);
  root.style.setProperty("--shadow", shadow);

  // Flag gradient discret (esthétique, pas criard)
  // On fait un dégradé à 12% d’opacité, posé en diagonale.
  const stops = colors
    .map((c, i) => {
      const pct = Math.round((i / Math.max(1, colors.length - 1)) * 100);
      return `${c} ${pct}%`;
    })
    .join(", ");

  root.style.setProperty(
    "--flag-grad",
    `linear-gradient(135deg, ${stops})`
  );

  root.setAttribute("data-palette", paletteKey);
}
