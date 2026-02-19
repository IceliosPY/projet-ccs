// src/App.tsx
import { useState } from "react";
import { ModulesPage } from "./pages/ModulesPage";
import { BlocklyPage } from "./pages/BlocklyPage";
import { ThemeMenu } from "./components/ThemeMenu";

type Tab = "modules" | "blockly";

export default function App() {
  const [tab, setTab] = useState<Tab>("modules");

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ===== Topbar ===== */}
      <header
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.85)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        {/* Logo / Title */}
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>CCS</div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>Plateforme d’apprentissage du code</div>
        </div>

        {/* Navigation */}
        <nav style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => setTab("modules")}
            style={{
              background:
                tab === "modules"
                  ? "color-mix(in srgb, var(--accent) 12%, white)"
                  : "rgba(255,255,255,0.9)",
              borderColor:
                tab === "modules"
                  ? "color-mix(in srgb, var(--accent) 40%, white)"
                  : "var(--border)",
            }}
          >
            Modules
          </button>

          <button
            onClick={() => setTab("blockly")}
            style={{
              background:
                tab === "blockly"
                  ? "color-mix(in srgb, var(--accent) 12%, white)"
                  : "rgba(255,255,255,0.9)",
              borderColor:
                tab === "blockly"
                  ? "color-mix(in srgb, var(--accent) 40%, white)"
                  : "var(--border)",
            }}
          >
            Blockly
          </button>

          {/* 🎨 Bouton Palette */}
          <ThemeMenu />
        </nav>
      </header>

      {/* ===== Page content ===== */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {tab === "modules" ? <ModulesPage /> : <BlocklyPage />}
      </div>
    </div>
  );
}
