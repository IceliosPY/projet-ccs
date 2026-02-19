import { useMemo } from "react";

export function SandboxedPreview({ html }: { html: string }) {
  const srcDoc = useMemo(() => {
    return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font-family:Arial,sans-serif;margin:12px}
    pre{white-space:pre-wrap}
  </style>
</head>
<body>
${html || ""}
</body>
</html>`;
  }, [html]);

  return (
    <iframe
      title="preview"
      sandbox="allow-scripts"
      style={{
        width: "100%",
        height: 320,
        border: "1px solid #ddd",
        borderRadius: 12,
        background: "white",
      }}
      srcDoc={srcDoc}
    />
  );
}
