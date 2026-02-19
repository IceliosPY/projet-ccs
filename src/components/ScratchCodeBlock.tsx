import React, { useEffect, useRef, useState } from "react";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function ScratchCodeBlock({
  code,
  hint = "Clique 2× pour révéler (ou gratte)",
}: {
  code: string;
  hint?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  // ✅ 2 clics = révélation
  const clicksRef = useRef(0);
  const clickTimerRef = useRef<number | null>(null);

  // init the scratch layer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(235,235,235,0.96)";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // texture légère
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    for (let y = 0; y < rect.height; y += 10) ctx.fillRect(0, y, rect.width, 1);

    // petit accent
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(0, 0, clamp(rect.width * 0.18, 40, 90), 6);

    // reset double click state
    clicksRef.current = 0;
    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
  }, [revealed, code]);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
    };
  }, []);

  function scratchAt(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (revealed) return;

    // double click logic
    clicksRef.current += 1;
    if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
    clickTimerRef.current = window.setTimeout(() => {
      clicksRef.current = 0;
      clickTimerRef.current = null;
    }, 450);

    if (clicksRef.current >= 2) {
      setRevealed(true);
      return;
    }

    // scratch as bonus (single click still starts scratching)
    drawingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    scratchAt(e.clientX, e.clientY);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (revealed || !drawingRef.current) return;
    scratchAt(e.clientX, e.clientY);
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (revealed) return;
    drawingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }

  return (
    <div className="scratch-solution">
      <pre aria-label="Bloc de code solution (à révéler)">
        <code>{code}</code>
      </pre>

      {!revealed && (
        <>
          <div className="scratch-layer" aria-hidden="true">
            <div className="scratch-hint">{hint}</div>
          </div>

          <canvas
            ref={canvasRef}
            className="scratch-canvas"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (drawingRef.current = false)}
            aria-label="Zone à cliquer deux fois ou gratter pour révéler"
          />
        </>
      )}

      <div className="scratch-actions">
        <button type="button" onClick={() => setRevealed(true)} disabled={revealed}>
          Révéler
        </button>
        <button
          type="button"
          onClick={() => setRevealed(false)}
          disabled={!revealed}
          title="Remet le cache (utile pour rejouer)"
        >
          Re-cacher
        </button>
      </div>
    </div>
  );
}
