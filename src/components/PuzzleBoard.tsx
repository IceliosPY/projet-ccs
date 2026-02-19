import { useEffect, useMemo, useRef, useState } from "react";
import type { Lesson } from "../api/lessons";

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function decodeHtmlEntities(input: string) {
  const el = document.createElement("textarea");
  el.innerHTML = input;
  return el.value;
}

function normalize(input: string) {
  return decodeHtmlEntities(input)
    .replace(/[\u00A0\u202F\u2009]/g, " ")
    .replace(/\s+/g, "")
    .trim();
}

/** FLIP: anime les déplacements quand l'ordre change */
function animateFlip(container: HTMLElement) {
  const tiles = Array.from(container.querySelectorAll<HTMLElement>("[data-tile]"));

  const first = new Map<string, DOMRect>();
  for (const el of tiles) first.set(el.dataset.tile!, el.getBoundingClientRect());

  requestAnimationFrame(() => {
    const tiles2 = Array.from(container.querySelectorAll<HTMLElement>("[data-tile]"));
    const last = new Map<string, DOMRect>();
    for (const el of tiles2) last.set(el.dataset.tile!, el.getBoundingClientRect());

    for (const el of tiles2) {
      const key = el.dataset.tile!;
      const a = first.get(key);
      const b = last.get(key);
      if (!a || !b) continue;

      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (dx === 0 && dy === 0) continue;

      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.transition = "transform 0s";

      requestAnimationFrame(() => {
        el.style.transition = "transform 220ms ease";
        el.style.transform = "";
      });
    }
  });
}

export function PuzzleBoard({
  lesson,
  onSolved,
}: {
  lesson: Lesson;
  onSolved: () => void;
}) {
  const [tiles, setTiles] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "ok" | "wrong">("idle");

  // drag state
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingIndexRef = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);

  // keyboard selection
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    setTiles(shuffle(lesson.codeParts));
    setStatus("idle");
    setDraggingIdx(null);
    setDropTargetIdx(null);
    draggingIndexRef.current = null;
    setSelectedIdx(null);
  }, [lesson.title]);

  const assembledRaw = useMemo(() => tiles.join(""), [tiles]);

  function setTilesAnimated(updater: (prev: string[]) => string[]) {
    const container = containerRef.current;
    if (container) animateFlip(container);
    setTiles((prev) => updater(prev));
    setStatus("idle");
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= tiles.length) return;
    if (from === to) return;

    setTilesAnimated((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });

    // Si on déplace une tuile sélectionnée, on garde la sélection sur elle
    setSelectedIdx(to);
    requestAnimationFrame(() => {
      const el = containerRef.current?.querySelector<HTMLElement>(`[data-idx="${to}"]`);
      el?.focus();
    });
  }

  function check() {
    const expected = normalize(lesson.orderedCode || "");
    const got = normalize(assembledRaw);
    const ok = expected === got;
    setStatus(ok ? "ok" : "wrong");
    if (ok) onSolved();
  }

  // ----------------- Drag & Drop -----------------
  function onDragStart(idx: number) {
    draggingIndexRef.current = idx;
    setDraggingIdx(idx);
    setDropTargetIdx(null);
    setStatus("idle");
    // Sélectionner aussi pour cohérence UX
    setSelectedIdx(idx);
  }

  function onDragEnter(idx: number) {
    if (draggingIndexRef.current === null) return;
    setDropTargetIdx(idx);
  }

  function onDragEnd() {
    draggingIndexRef.current = null;
    setDraggingIdx(null);
    setDropTargetIdx(null);
  }

  function onDrop(idx: number) {
    const from = draggingIndexRef.current;
    draggingIndexRef.current = null;
    setDraggingIdx(null);
    setDropTargetIdx(null);

    if (from === null) return;
    move(from, idx);
  }

  // ----------------- Keyboard / Focus -----------------
  function select(idx: number) {
    setSelectedIdx(idx);
    requestAnimationFrame(() => {
      const el = containerRef.current?.querySelector<HTMLElement>(`[data-idx="${idx}"]`);
      el?.focus();
    });
  }

  function deselect() {
    setSelectedIdx(null);
  }

  function onContainerKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (tiles.length === 0) return;

    // Entrée valide la leçon (comme tu veux)
    if (e.key === "Enter") {
      e.preventDefault();
      check();
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      deselect();
      return;
    }

    // Si rien n'est sélectionné, on sélectionne la première tuile dès qu'on appuie ↑/↓
    if (selectedIdx === null && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      select(0);
      return;
    }

    if (selectedIdx === null) return;

    switch (e.key) {
      case "ArrowUp": {
        e.preventDefault();
        if (selectedIdx > 0) select(selectedIdx - 1);
        break;
      }
      case "ArrowDown": {
        e.preventDefault();
        if (selectedIdx < tiles.length - 1) select(selectedIdx + 1);
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        if (selectedIdx > 0) move(selectedIdx, selectedIdx - 1);
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        if (selectedIdx < tiles.length - 1) move(selectedIdx, selectedIdx + 1);
        break;
      }
    }
  }

  return (
    <div>
      <div
        ref={containerRef}
        role="list"
        aria-label="Morceaux de code à réordonner"
        tabIndex={0}
        onKeyDown={onContainerKeyDown}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          padding: 2,
          borderRadius: 12,
          outline: "none",
        }}
        title="Clavier: ↑↓ sélectionner, ←→ déplacer, Entrée vérifier, Échap désélectionner"
      >
        {tiles.map((t, idx) => {
          // clé stable pour FLIP (on évite l’index seul)
          const key = `${lesson.title}-${idx}-${t}`;

          const isSelected = selectedIdx === idx;

          return (
            <div
              key={key}
              data-tile={key}
              data-idx={idx}
              role="listitem"
              className={[
                "puzzle-tile",
                draggingIdx === idx ? "dragging" : "",
                dropTargetIdx === idx ? "drop-target" : "",
                isSelected ? "selected" : "",
              ].join(" ")}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragEnter={() => onDragEnter(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(idx)}
              onDragEnd={onDragEnd}
              onClick={() => select(idx)}
              tabIndex={-1}
              style={{
                minWidth: 160,
                borderRadius: 12,
                border: "1px solid #ddd",
                background:
                  status === "idle"
                    ? "white"
                    : status === "ok"
                    ? "#d4edda"
                    : "#f8d7da",
                padding: 10,
                cursor: "grab",
                userSelect: "none",
              }}
              aria-label={`Tuile ${idx + 1}${isSelected ? ", sélectionnée" : ""}`}
            >
              <div dangerouslySetInnerHTML={{ __html: t }} />

              <div className="puzzle-controls">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (idx > 0) move(idx, idx - 1);
                    select(Math.max(0, idx - 1));
                  }}
                  disabled={idx === 0}
                  type="button"
                  aria-label="Déplacer à gauche"
                  title="Déplacer à gauche"
                >
                  ←
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (idx < tiles.length - 1) move(idx, idx + 1);
                    select(Math.min(tiles.length - 1, idx + 1));
                  }}
                  disabled={idx === tiles.length - 1}
                  type="button"
                  aria-label="Déplacer à droite"
                  title="Déplacer à droite"
                >
                  →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
        <button onClick={check} type="button">
          Vérifier (Entrée)
        </button>

        <button
          onClick={() => {
            const container = containerRef.current;
            if (container) animateFlip(container);
            setTiles(shuffle(lesson.codeParts));
            setStatus("idle");
            setSelectedIdx(null);
          }}
          type="button"
        >
          Mélanger
        </button>

        {status === "wrong" && <span style={{ color: "#b00020" }}>Pas encore 😅</span>}
        {status === "ok" && <span style={{ color: "#0a7a2f" }}>Bien joué ✅</span>}
      </div>
    </div>
  );
}
