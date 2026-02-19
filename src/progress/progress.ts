// src/progress/progress.ts
// Progression par EXERCICE (modules -> exercices)
// Stockage localStorage (simple, fiable). Plus tard: DB par utilisateur.

const KEY_SOLVED = "ccs_solved_exercise_ids_v1";

/**
 * Renvoie la liste des IDs d'exercices validés.
 */
export function getSolvedExerciseIds(): number[] {
  try {
    const raw = localStorage.getItem(KEY_SOLVED);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n))
      .filter((n) => n > 0);
  } catch {
    return [];
  }
}

/**
 * Retourne true si l'exercice est déjà validé.
 */
export function isExerciseSolved(exerciseId: number): boolean {
  return getSolvedExerciseIds().includes(exerciseId);
}

/**
 * Marque un exercice comme validé.
 */
export function markExerciseSolved(exerciseId: number) {
  const id = Number(exerciseId);
  if (!Number.isFinite(id) || id <= 0) return;

  const solved = new Set(getSolvedExerciseIds());
  solved.add(id);
  localStorage.setItem(KEY_SOLVED, JSON.stringify(Array.from(solved)));
}

/**
 * Réinitialise toute la progression.
 */
export function resetProgress() {
  localStorage.removeItem(KEY_SOLVED);
}

/**
 * Règle de déblocage:
 * - Module 1 / Exo 1 est toujours débloqué
 * - Un exo est débloqué si:
 *    - il est déjà solved
 *    - ou c'est le premier exo du module ET le dernier exo du module précédent est solved
 *    - ou c'est l'exo suivant dans le même module et l'exo précédent est solved
 *
 * On calcule tout à partir de l’ordre (orderIndex).
 */
export function buildUnlockModel(modules: Array<{
  id: number;
  orderIndex: number;
  exercises: Array<{ id: number; orderIndex: number }>;
}>) {
  const solved = new Set(getSolvedExerciseIds());

  // Tri modules/exos par orderIndex
  const sortedModules = [...modules].sort((a, b) => a.orderIndex - b.orderIndex);
  const sorted = sortedModules.map((m) => ({
    ...m,
    exercises: [...m.exercises].sort((a, b) => a.orderIndex - b.orderIndex),
  }));

  const unlocked = new Set<number>();

  for (let mi = 0; mi < sorted.length; mi++) {
    const m = sorted[mi];
    const ex = m.exercises;

    for (let ei = 0; ei < ex.length; ei++) {
      const exo = ex[ei];

      // déjà validé => débloqué
      if (solved.has(exo.id)) {
        unlocked.add(exo.id);
        continue;
      }

      // tout premier exo du tout premier module => débloqué
      if (mi === 0 && ei === 0) {
        unlocked.add(exo.id);
        continue;
      }

      // sinon, débloqué si exo précédent du même module est solved
      if (ei > 0) {
        const prev = ex[ei - 1];
        if (solved.has(prev.id)) {
          unlocked.add(exo.id);
          continue;
        }
      }

      // sinon, si c'est le premier exo du module:
      // débloqué si le dernier exo du module précédent est solved
      if (ei === 0 && mi > 0) {
        const prevModule = sorted[mi - 1];
        const prevExos = prevModule.exercises;
        const lastPrev = prevExos[prevExos.length - 1];
        if (lastPrev && solved.has(lastPrev.id)) {
          unlocked.add(exo.id);
          continue;
        }
      }
    }
  }

  return {
    solvedIds: solved,
    unlockedIds: unlocked,
  };
}
