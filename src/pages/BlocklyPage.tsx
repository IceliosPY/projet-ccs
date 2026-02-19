import { useMemo, useState } from "react";
import { BlocklyWorkspace } from "../components/BlocklyWorkspace";
import { SandboxedPreview } from "../components/SandboxedPreview";
import { TOOLBOX_BEGINNER } from "../blocks/toolboxes";

export function BlocklyPage() {
  const [code, setCode] = useState("");
  const [xml, setXml] = useState("");

  const htmlForPreview = useMemo(() => {
    return `
<h2>Prévisualisation Blockly</h2>
<p>Les blocs génèrent du JavaScript exécuté ici (sandbox).</p>
<button id="btn">Clique-moi</button>
<pre id="out"></pre>

<script>
  window.__print = (msg) => {
    const el = document.getElementById('out');
    if (el) el.textContent += String(msg) + "\\n";
  };

  document.getElementById('btn')?.addEventListener('click', () => {
    window.__print("Bouton cliqué !");
  });

  try {
${code}
  } catch (e) {
    window.__print("Erreur: " + e);
  }
</script>
`;
  }, [code]);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 16 }}>
        <div>
          <h2 style={{ marginTop: 0 }}>Mode Blockly</h2>
          <BlocklyWorkspace
            toolboxXml={TOOLBOX_BEGINNER}
            onCodeChange={setCode}
            onWorkspaceXmlChange={setXml}
          />
        </div>

        <div>
          <h3>Preview</h3>
          <SandboxedPreview html={htmlForPreview} />

          <h3 style={{ marginTop: 16 }}>Code JS généré</h3>
          <textarea
            value={code}
            readOnly
            style={{
              width: "100%",
              height: 200,
              borderRadius: 12,
              border: "1px solid #ddd",
              padding: 12,
              fontSize: 12,
            }}
          />

          <h3 style={{ marginTop: 16 }}>Workspace XML</h3>
          <textarea
            value={xml}
            readOnly
            style={{
              width: "100%",
              height: 140,
              borderRadius: 12,
              border: "1px solid #ddd",
              padding: 12,
              fontSize: 12,
            }}
          />
        </div>
      </div>
    </div>
  );
}
