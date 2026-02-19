// src/components/LessonExplanation.tsx
import { useMemo } from "react";
import { ScratchCodeBlock } from "./ScratchCodeBlock";

function decodeHtmlEntities(input: string) {
  const el = document.createElement("textarea");
  el.innerHTML = input;
  return el.value;
}

export function LessonExplanation({ html }: { html: string }) {
  const parts = useMemo(() => {
    const re = /<pre><code>([\s\S]*?)<\/code><\/pre>/g;
    const out: Array<{ kind: "html"; value: string } | { kind: "code"; value: string }> = [];

    let last = 0;
    let m: RegExpExecArray | null;

    while ((m = re.exec(html))) {
      const start = m.index;
      const end = re.lastIndex;

      if (start > last) out.push({ kind: "html", value: html.slice(last, start) });

      const raw = m[1] ?? "";
      out.push({ kind: "code", value: decodeHtmlEntities(raw) });

      last = end;
    }

    if (last < html.length) out.push({ kind: "html", value: html.slice(last) });

    return out;
  }, [html]);

  return (
    <div>
      {parts.map((p, i) =>
        p.kind === "code" ? (
          <ScratchCodeBlock key={`code-${i}`} code={p.value} />
        ) : (
          <div key={`html-${i}`} dangerouslySetInnerHTML={{ __html: p.value }} />
        )
      )}
    </div>
  );
}
