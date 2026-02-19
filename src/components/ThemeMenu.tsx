import { useEffect, useMemo, useRef, useState } from "react";
import { FLAG_PALETTES, PALETTE_LABELS } from "../theme/palettes";
import { applyTheme, getThemePaletteKey, setThemePaletteKey } from "../theme/theme";

function swatchStyle(colors: string[]) {
  const grad = `linear-gradient(90deg, ${colors.join(",")})`;
  return {
    width: 64,
    height: 10,
    borderRadius: 999,
    background: grad,
    border: "1px solid var(--border)",
  } as const;
}

export function ThemeMenu() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(getThemePaletteKey());
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const entries = useMemo(() => {
    return Object.keys(FLAG_PALETTES).map((k) => ({
      key: k,
      label: PALETTE_LABELS[k] ?? k,
      colors: FLAG_PALETTES[k],
    }));
  }, []);

  // appliquer au changement
  useEffect(() => {
    applyTheme(key);
    setThemePaletteKey(key);
  }, [key]);

  // click outside + ESC
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };

    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const current = entries.find((e) => e.key === key);

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Changer de palette"
        style={{ display: "flex", alignItems: "center", gap: 10 }}
      >
        🎨 Palette
        {current ? <span style={swatchStyle(current.colors)} /> : null}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 10px)",
            width: 280,
            background: "rgba(255,255,255,0.96)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            boxShadow: "var(--shadow)",
            padding: 10,
            zIndex: 100,
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ fontWeight: 900, margin: "4px 6px 10px" }}>Palettes</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {entries.map((e) => {
              const active = e.key === key;
              return (
                <button
                  key={e.key}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setKey(e.key);
                    setOpen(false);
                    btnRef.current?.focus();
                  }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 14,
                    border: "1px solid var(--border)",
                    background: active
                      ? "color-mix(in srgb, var(--accent) 10%, white)"
                      : "rgba(255,255,255,0.86)",
                  }}
                >
                  <span style={{ fontWeight: 800 }}>{e.label}</span>
                  <span style={swatchStyle(e.colors)} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
