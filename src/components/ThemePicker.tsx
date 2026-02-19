import { FLAG_PALETTES, PALETTE_LABELS } from "../theme/palettes";
import { applyTheme, getThemePaletteKey, setThemePaletteKey } from "../theme/theme";
import { useEffect, useState } from "react";

export function ThemePicker() {
  const [key, setKey] = useState(getThemePaletteKey());

  useEffect(() => {
    applyTheme(key);
    setThemePaletteKey(key);
  }, [key]);

  return (
    <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <span className="muted" style={{ fontSize: 13 }}>Palette</span>
      <select
        value={key}
        onChange={(e) => setKey(e.target.value)}
        style={{
          borderRadius: 12,
          padding: "10px 12px",
          border: "1px solid var(--border)",
          background: "rgba(255,255,255,0.85)",
        }}
      >
        {Object.keys(FLAG_PALETTES).map((k) => (
          <option key={k} value={k}>
            {PALETTE_LABELS[k] ?? k}
          </option>
        ))}
      </select>
    </label>
  );
}
