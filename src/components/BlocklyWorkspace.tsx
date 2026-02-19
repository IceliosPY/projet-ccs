// src/components/BlocklyWorkspace.tsx
import { useEffect, useMemo, useRef } from "react";
import * as Blockly from "blockly";
import "blockly/blocks";
import { javascriptGenerator } from "blockly/javascript";

type Props = {
  toolboxXml: string;
  initialXml?: string;
  onCodeChange?: (code: string) => void;
  onWorkspaceXmlChange?: (xml: string) => void;
};

export function BlocklyWorkspace({
  toolboxXml,
  initialXml,
  onCodeChange,
  onWorkspaceXmlChange,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  const toolbox = useMemo(() => {
    const parser = new DOMParser();
    return parser.parseFromString(toolboxXml, "text/xml").documentElement;
  }, [toolboxXml]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const ws = Blockly.inject(host, {
      toolbox,
      trashcan: true,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1,
        maxScale: 2,
        minScale: 0.6,
        scaleSpeed: 1.1,
      },
      grid: { spacing: 20, length: 3, snap: true },
    });

    // Load initial blocks if provided
    if (initialXml) {
      try {
        const dom = Blockly.utils.xml.textToDom(initialXml);
        Blockly.Xml.domToWorkspace(dom, ws);
      } catch {
        // ignore invalid xml
      }
    }

    // Override text_print: no alert, print to window.__print in the sandbox preview
    const originalTextPrint = javascriptGenerator.forBlock["text_print"];
    javascriptGenerator.forBlock["text_print"] = function (
      block: Blockly.Block,
      generator: typeof javascriptGenerator
    ) {
      // ORDER_NONE may not exist on some typings; fallback to 0
      const ORDER_NONE =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (javascriptGenerator as any).ORDER_NONE ?? 0;

      const msg = generator.valueToCode(block, "TEXT", ORDER_NONE) || "''";
      return `window.__print?.(${msg});\n`;
    };

    const emitAll = () => {
      const code = javascriptGenerator.workspaceToCode(ws);
      onCodeChange?.(code);

      const xmlDom = Blockly.Xml.workspaceToDom(ws);
      const xmlText = Blockly.utils.xml.domToText(xmlDom);
      onWorkspaceXmlChange?.(xmlText);
    };

    ws.addChangeListener(emitAll);
    emitAll();

    return () => {
      ws.removeChangeListener(emitAll);
      ws.dispose();
      // restore generator override
      javascriptGenerator.forBlock["text_print"] = originalTextPrint;
    };
  }, [toolbox, initialXml, onCodeChange, onWorkspaceXmlChange]);

  return (
    <div
      ref={hostRef}
      style={{
        width: "100%",
        height: 520,
        border: "1px solid #ddd",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
      }}
    />
  );
}
