// src/pages/ModulesPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchModules, type Module, type UiExercise } from "../api/modules";
import { PuzzleBoard } from "../components/PuzzleBoard";
import { SandboxedPreview } from "../components/SandboxedPreview";
import { LessonExplanation } from "../components/LessonExplanation";
import { buildUnlockModel, markExerciseSolved, resetProgress } from "../progress/progress";

type FlatExercise = UiExercise & {
  moduleTitle: string;
  moduleOrderIndex: number;
  moduleDescription: string;
};

export function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  // UI selection
  const [currentModuleId, setCurrentModuleId] = useState<number | null>(null);
  const [currentExerciseId, setCurrentExerciseId] = useState<number | null>(null);

  // Drawer
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);

  // Collapsible modules (drawer)
  const [openModuleIds, setOpenModuleIds] = useState<Set<number>>(new Set());

  // Bump to recompute unlock model after solving/reset
  const [progressTick, setProgressTick] = useState(0);

  // Fetch modules once
  useEffect(() => {
    (async () => {
      try {
        setStatus("loading");
        const data = await fetchModules();

        const sorted = [...data]
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((m) => ({
            ...m,
            exercises: [...m.exercises].sort((a, b) => a.orderIndex - b.orderIndex),
          }));

        setModules(sorted);

        const first = sorted[0];
        if (first?.exercises?.[0]) {
          setOpenModuleIds(new Set([first.id]));
          setCurrentModuleId(first.id);
          setCurrentExerciseId(first.exercises[0].id);
        }

        setStatus("ready");
      } catch (e) {
        console.error(e);
        setStatus("error");
      }
    })();
  }, []);

  // ESC closes menu
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Flat list of exercises (for prev/next + global progress)
  const flat = useMemo<FlatExercise[]>(() => {
    const out: FlatExercise[] = [];
    for (const m of modules) {
      for (const ex of m.exercises) {
        out.push({
          ...ex,
          moduleTitle: m.title,
          moduleOrderIndex: m.orderIndex,
          moduleDescription: m.description,
        });
      }
    }
    out.sort((a, b) => {
      if (a.moduleOrderIndex !== b.moduleOrderIndex) return a.moduleOrderIndex - b.moduleOrderIndex;
      if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
      return a.id - b.id;
    });
    return out;
  }, [modules]);

  // Unlock model depends on stored progress + modules list
  const unlockModel = useMemo(() => buildUnlockModel(modules), [modules, progressTick]);

  const currentExercise = useMemo(() => {
    if (currentExerciseId == null) return null;
    return flat.find((e) => e.id === currentExerciseId) ?? null;
  }, [flat, currentExerciseId]);

  const currentModule = useMemo(() => {
    if (currentModuleId == null) return null;
    return modules.find((m) => m.id === currentModuleId) ?? null;
  }, [modules, currentModuleId]);

  // Fix selection if modules reload / invalid ids
  useEffect(() => {
    if (!modules.length) return;

    // module invalid
    if (currentModuleId == null || !modules.some((m) => m.id === currentModuleId)) {
      const first = modules[0];
      setCurrentModuleId(first.id);
      setCurrentExerciseId(first.exercises[0]?.id ?? null);
      setOpenModuleIds(new Set([first.id]));
      return;
    }

    // exercise invalid
    if (currentExerciseId == null || !flat.some((e) => e.id === currentExerciseId)) {
      const m = modules.find((mm) => mm.id === currentModuleId)!;
      setCurrentExerciseId(m.exercises[0]?.id ?? null);
      return;
    }
  }, [modules, flat, currentModuleId, currentExerciseId]);

  // Progress
  const totalExercises = flat.length;
  const solvedCount = unlockModel.solvedIds.size;
  const progressNow = Math.min(solvedCount, totalExercises);
  const progressPct = `${(progressNow / Math.max(1, totalExercises)) * 100}%`;

  const explanationText = useMemo(() => {
    if (!currentExercise) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = currentExercise.instructionsHtml;
    return tmp.textContent || "";
  }, [currentExercise?.id, currentExercise?.instructionsHtml]);

  const isSolved = !!currentExercise && unlockModel.solvedIds.has(currentExercise.id);

  function toggleModuleOpen(id: number) {
    setOpenModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectExercise(moduleId: number, exerciseId: number) {
    setCurrentModuleId(moduleId);
    setCurrentExerciseId(exerciseId);
    setMenuOpen(false);
    requestAnimationFrame(() => menuBtnRef.current?.focus());
  }

  function goPrev() {
    if (!currentExercise) return;
    const idx = flat.findIndex((e) => e.id === currentExercise.id);
    if (idx <= 0) return;

    const prev = flat[idx - 1];
    setCurrentExerciseId(prev.id);
    setCurrentModuleId(prev.moduleId);
    setOpenModuleIds((s) => new Set(s).add(prev.moduleId));
  }

  function goNext() {
    if (!currentExercise) return;
    const idx = flat.findIndex((e) => e.id === currentExercise.id);
    const next = flat[idx + 1];
    if (!next) return;

    const unlocked = unlockModel.unlockedIds.has(next.id) || unlockModel.solvedIds.has(next.id);
    if (!unlocked) return;

    setCurrentExerciseId(next.id);
    setCurrentModuleId(next.moduleId);
    setOpenModuleIds((s) => new Set(s).add(next.moduleId));
  }

  const prevLocked = useMemo(() => {
    if (!currentExercise) return true;
    const idx = flat.findIndex((e) => e.id === currentExercise.id);
    return idx <= 0;
  }, [flat, currentExercise]);

  const nextLocked = useMemo(() => {
    if (!currentExercise) return true;
    const idx = flat.findIndex((e) => e.id === currentExercise.id);
    const next = flat[idx + 1];
    if (!next) return true;
    return !(unlockModel.unlockedIds.has(next.id) || unlockModel.solvedIds.has(next.id));
  }, [flat, currentExercise, unlockModel.unlockedIds, unlockModel.solvedIds]);

  if (status === "loading") return <div style={{ padding: 20 }}>Chargement…</div>;
  if (status === "error") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Erreur</h2>
        <p>Impossible de charger les modules.</p>
      </div>
    );
  }
  if (!currentExercise || !currentModule) return <div style={{ padding: 20 }}>Aucun exercice.</div>;

  return (
    <div className="page">
      {/* Overlay */}
      {menuOpen && (
        <div
          className="drawer-overlay"
          onClick={() => {
            setMenuOpen(false);
            menuBtnRef.current?.focus();
          }}
        />
      )}

      {/* Drawer */}
      <aside className={`drawer ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <div className="drawer-header">
          <div style={{ width: "100%" }}>
            <div style={{ fontWeight: 900 }}>Modules</div>

            {/* Global progress */}
            <div style={{ marginTop: 8 }}>
              <div
                className="progress-bar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={totalExercises}
                aria-valuenow={progressNow}
              >
                <div className="progress-fill" style={{ ["--p" as any]: progressPct }} />
              </div>

              <div className="progress-row" style={{ marginTop: 6 }}>
                <div className="progress-label">Progression</div>
                <div className="progress-value">
                  {progressNow} / {totalExercises}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              menuBtnRef.current?.focus();
            }}
            aria-label="Fermer le menu"
            title="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="drawer-list">
          {modules.map((m) => {
            const isOpen = openModuleIds.has(m.id);

            const ids = m.exercises.map((e) => e.id);
            const solvedInModule = ids.filter((id) => unlockModel.solvedIds.has(id)).length;
            const modulePct = `${(solvedInModule / Math.max(1, ids.length)) * 100}%`;

            const isActiveModule = m.id === currentModuleId;

            return (
              <div key={m.id} style={{ marginBottom: 10 }}>
                <button
                  type="button"
                  className={`lesson-item ${isActiveModule ? "active" : ""}`}
                  onClick={() => toggleModuleOpen(m.id)}
                  style={{ marginBottom: 8 }}
                  aria-expanded={isOpen}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        Module {m.orderIndex} • {solvedInModule}/{m.exercises.length}
                      </div>
                      <div style={{ fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {m.title}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {m.description}
                      </div>
                    </div>
                    <div style={{ fontSize: 18, opacity: 0.7 }}>{isOpen ? "▾" : "▸"}</div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <div className="progress-bar" aria-hidden="true">
                      <div className="progress-fill" style={{ ["--p" as any]: modulePct }} />
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div style={{ paddingLeft: 8 }}>
                    {m.exercises.map((ex) => {
                      const unlocked = unlockModel.unlockedIds.has(ex.id) || unlockModel.solvedIds.has(ex.id);
                      const active = ex.id === currentExerciseId;
                      const solved = unlockModel.solvedIds.has(ex.id);

                      const label = ex.orderIndex === 3 ? "Challenge" : `Exercice ${ex.orderIndex}`;

                      return (
                        <button
                          key={ex.id}
                          type="button"
                          className={`lesson-item ${active ? "active" : ""}`}
                          disabled={!unlocked}
                          onClick={() => unlocked && selectExercise(m.id, ex.id)}
                          title={!unlocked ? "Termine l’exercice précédent pour débloquer" : ""}
                          style={{ borderRadius: 14, marginBottom: 8 }}
                        >
                          <div style={{ fontSize: 12, opacity: 0.7 }}>
                            {label} {!unlocked ? "🔒" : solved ? "✅" : ""}
                          </div>
                          <div style={{ fontWeight: 800 }}>{ex.title}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => {
              resetProgress();
              setProgressTick((t) => t + 1);

              const first = modules[0];
              if (first?.exercises?.[0]) {
                setCurrentModuleId(first.id);
                setCurrentExerciseId(first.exercises[0].id);
                setOpenModuleIds(new Set([first.id]));
              }

              setMenuOpen(false);
              requestAnimationFrame(() => menuBtnRef.current?.focus());
            }}
            style={{ width: "100%", marginTop: 6 }}
          >
            Réinitialiser progression
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="page-scroll">
        <div className="sticky-subheader">
          <div className="container" style={{ padding: "14px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                <button
                  ref={menuBtnRef}
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  aria-label="Ouvrir le menu des modules"
                  title="Menu"
                  style={{ borderRadius: 14, padding: "10px 12px" }}
                >
                  ☰
                </button>

                <div style={{ minWidth: 0 }}>
                  <div className="progress-wrap" style={{ marginBottom: 6, maxWidth: 320 }}>
                    <div className="progress-row">
                      <div className="progress-label">Progression</div>
                      <div className="progress-value">
                        {progressNow} / {totalExercises}
                      </div>
                    </div>

                    <div
                      className="progress-bar"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={totalExercises}
                      aria-valuenow={progressNow}
                    >
                      <div className="progress-fill" style={{ ["--p" as any]: progressPct }} />
                    </div>
                  </div>

                  <h2 style={{ margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {currentModule.title} — {currentExercise.title}
                  </h2>

                  <div style={{ opacity: 0.7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {explanationText.slice(0, 90)}…
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={goPrev} disabled={prevLocked} type="button">
                  ← Précédent
                </button>

                <button
                  onClick={goNext}
                  disabled={nextLocked}
                  type="button"
                  title={nextLocked ? "Termine l’exercice précédent pour débloquer" : ""}
                >
                  Suivant →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: "18px 20px 40px" }}>
          <section className="card">
            <LessonExplanation html={currentExercise.instructionsHtml} />
          </section>

          <section style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 8 }}>Exercice (Puzzle)</h3>

            <div className="card accent" style={{ background: "rgba(255,255,255,0.92)" }}>
              <PuzzleBoard
                // compat : PuzzleBoard attend un objet "lesson-like"
                lesson={{
                  title: currentExercise.title,
                  fullExplanation: currentExercise.instructionsHtml,
                  codeParts: currentExercise.codeParts,
                  orderedCode: currentExercise.orderedCode,
                } as any}
                onSolved={() => {
                  markExerciseSolved(currentExercise.id);
                  setProgressTick((t) => t + 1);
                }}
              />
            </div>
          </section>

          <section style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 8 }}>Prévisualisation</h3>

            <div className="card" style={{ background: "rgba(255,255,255,0.92)" }}>
              <SandboxedPreview html={isSolved ? currentExercise.orderedCode : ""} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
