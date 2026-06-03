import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ACHIEVEMENTS, DISCOVERABLE_IDS, FINAL_IDS, STARTER_IDS, findRecipe, getElement } from "./recraft-data";

interface DiscoveryEntry {
  id: string;
  at: number;
  usedHint: boolean;
  timeToCreateMs?: number;
}

interface State {
  discovered: Record<string, DiscoveryEntry>;
  favorites: string[];
  hintsUsed: Record<string, number>; // per item: max level shown
  tutorialsRead: string[];
  curiositiesRead: string[];
  combinationsAttempted: number;
  invalidAttempts: number;
  sessionStart: number;
  consecutiveNoHints: number;
  unlockedAchievements: Record<string, number>;
  notifications: { id: string; ts: number; type: "discovery" | "achievement"; title: string; subtitle?: string; emoji?: string }[];
  currentHintId: string | null;

  combine: (a: string, b: string) => { ok: boolean; output?: string; alreadyKnown?: boolean };
  useHint: (id: string, level: 1 | 2 | 3) => void;
  pickRandomHint: () => string | null;
  toggleFavorite: (id: string) => void;
  markTutorialRead: (id: string) => void;
  markCuriosityRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  reset: () => void;
}

const initialDiscovered = (): Record<string, DiscoveryEntry> => {
  const o: Record<string, DiscoveryEntry> = {};
  for (const id of STARTER_IDS) o[id] = { id, at: 0, usedHint: false };
  return o;
};

function pushNotif(state: State, n: State["notifications"][number]) {
  state.notifications = [...state.notifications, n].slice(-8);
}

function checkAchievements(get: () => State, set: (fn: (s: State) => State) => void) {
  const s = get();
  const finalsDiscovered = FINAL_IDS.filter((id) => s.discovered[id]);
  const componentsAndFinals = DISCOVERABLE_IDS.filter((id) => s.discovered[id]);
  const wasteCount = finalsDiscovered.reduce((sum, id) => sum + (getElement(id)?.wasteCount ?? 0), 0);
  const totalCuriosities = Object.values(s.discovered).filter((d) => getElement(d.id)?.curiosity).length;

  const unlock = (achId: string) => {
    if (s.unlockedAchievements[achId]) return;
    const def = ACHIEVEMENTS.find((a) => a.id === achId);
    if (!def) return;
    set((st) => {
      if (st.unlockedAchievements[achId]) return st;
      const next = { ...st, unlockedAchievements: { ...st.unlockedAchievements, [achId]: Date.now() } };
      pushNotif(next, { id: `ach-${achId}-${Date.now()}`, ts: Date.now(), type: "achievement", title: `Conquista: ${def.name}`, subtitle: def.description, emoji: "🏆" });
      return next;
    });
  };

  if (componentsAndFinals.length >= 1) unlock("primeira_descoberta");
  if (componentsAndFinals.length >= 5) unlock("pequeno_inventor");
  if (componentsAndFinals.length >= 10) unlock("explorador");
  if (componentsAndFinals.length === DISCOVERABLE_IDS.length) unlock("mestre_combinacoes");

  if (wasteCount >= 20) unlock("amigo_natureza");
  if (wasteCount >= 50) unlock("guardiao");
  if (wasteCount >= 100) unlock("heroi");
  if (finalsDiscovered.length === FINAL_IDS.length) {
    unlock("mestre_reutilizacao");
    unlock("especialista");
  }

  if (s.tutorialsRead.length >= 1) unlock("curioso");
  if (s.tutorialsRead.length >= 5) unlock("aprendiz");
  if (s.tutorialsRead.length >= FINAL_IDS.length) unlock("artesao");

  if (finalsDiscovered.length >= 1) unlock("primeira_criacao");
  if (componentsAndFinals.length / DISCOVERABLE_IDS.length >= 0.5) unlock("colecionador");
  if (componentsAndFinals.length === DISCOVERABLE_IDS.length) unlock("catalogo_completo");

  if (s.invalidAttempts >= 20) unlock("persistente");
  if (totalCuriosities === Object.values(s.discovered).filter((d) => getElement(d.id)?.curiosity).length && s.curiositiesRead.length >= FINAL_IDS.length) {
    // every curiosity read
  }
}

export const useRecraftStore = create<State>()(
  persist(
    (set, get) => ({
      discovered: initialDiscovered(),
      favorites: [],
      hintsUsed: {},
      tutorialsRead: [],
      curiositiesRead: [],
      combinationsAttempted: 0,
      invalidAttempts: 0,
      sessionStart: Date.now(),
      consecutiveNoHints: 0,
      unlockedAchievements: {},
      notifications: [],
      currentHintId: null,

      combine: (a, b) => {
        const output = findRecipe(a, b);
        set((s) => ({ ...s, combinationsAttempted: s.combinationsAttempted + 1 }));
        if (!output) {
          set((s) => ({ ...s, invalidAttempts: s.invalidAttempts + 1 }));
          checkAchievements(get, set as never);
          return { ok: false };
        }
        const state = get();
        if (state.discovered[output]) {
          return { ok: true, output, alreadyKnown: true };
        }
        const def = getElement(output);
        const usedHint = (state.hintsUsed[output] ?? 0) > 0;
        const timeToCreateMs = Date.now() - state.sessionStart;
        set((s) => {
          const next: State = {
            ...s,
            discovered: { ...s.discovered, [output]: { id: output, at: Date.now(), usedHint, timeToCreateMs } },
            consecutiveNoHints: usedHint ? 0 : s.consecutiveNoHints + (def?.type === "final" ? 1 : 0),
          };
          pushNotif(next, { id: `disc-${output}-${Date.now()}`, ts: Date.now(), type: "discovery", title: `Descoberto: ${def?.name}`, subtitle: def?.type === "final" ? "Objeto Final criado!" : "Novo componente", emoji: def?.emoji });
          return next;
        });
        // special achievements
        if (def?.type === "final" && !usedHint) {
          set((s) => ({ ...s, unlockedAchievements: s.unlockedAchievements }));
          // unlock sem_dicas
          if (!get().unlockedAchievements["sem_dicas"]) {
            const ach = ACHIEVEMENTS.find((a) => a.id === "sem_dicas")!;
            set((s) => {
              const next = { ...s, unlockedAchievements: { ...s.unlockedAchievements, sem_dicas: Date.now() } };
              pushNotif(next, { id: `ach-sem_dicas-${Date.now()}`, ts: Date.now(), type: "achievement", title: `Conquista: ${ach.name}`, subtitle: ach.description, emoji: "🏆" });
              return next;
            });
          }
          if (get().consecutiveNoHints >= 3 && !get().unlockedAchievements["detetive"]) {
            const ach = ACHIEVEMENTS.find((a) => a.id === "detetive")!;
            set((s) => {
              const next = { ...s, unlockedAchievements: { ...s.unlockedAchievements, detetive: Date.now() } };
              pushNotif(next, { id: `ach-detetive-${Date.now()}`, ts: Date.now(), type: "achievement", title: `Conquista: ${ach.name}`, subtitle: ach.description, emoji: "🏆" });
              return next;
            });
          }
          if (timeToCreateMs <= 2 * 60 * 1000 && !get().unlockedAchievements["rapida"]) {
            const ach = ACHIEVEMENTS.find((a) => a.id === "rapida")!;
            set((s) => {
              const next = { ...s, unlockedAchievements: { ...s.unlockedAchievements, rapida: Date.now() } };
              pushNotif(next, { id: `ach-rapida-${Date.now()}`, ts: Date.now(), type: "achievement", title: `Conquista: ${ach.name}`, subtitle: ach.description, emoji: "🏆" });
              return next;
            });
          }
        }
        checkAchievements(get, set as never);
        return { ok: true, output };
      },

      useHint: (id, level) => {
        set((s) => ({ ...s, hintsUsed: { ...s.hintsUsed, [id]: Math.max(s.hintsUsed[id] ?? 0, level) } }));
      },

      pickRandomHint: () => {
        const s = get();
        const isValid = (id: string | null) => {
          if (!id) return false;
          if (s.discovered[id]) return false;
          const el = getElement(id);
          return !!(el && el.hints && el.hints.length > 0);
        };
        if (isValid(s.currentHintId)) return s.currentHintId;
        const candidates = DISCOVERABLE_IDS.filter((id) => {
          if (s.discovered[id]) return false;
          const el = getElement(id);
          return !!(el && el.hints && el.hints.length > 0);
        });
        if (candidates.length === 0) {
          set((st) => ({ ...st, currentHintId: null }));
          return null;
        }
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        set((st) => ({ ...st, currentHintId: pick }));
        return pick;
      },

      toggleFavorite: (id) => {
        set((s) => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id] }));
      },

      markTutorialRead: (id) => {
        set((s) => (s.tutorialsRead.includes(id) ? s : { ...s, tutorialsRead: [...s.tutorialsRead, id] }));
        checkAchievements(get, set as never);
      },

      markCuriosityRead: (id) => {
        set((s) => (s.curiositiesRead.includes(id) ? s : { ...s, curiositiesRead: [...s.curiositiesRead, id] }));
      },

      dismissNotification: (id) => {
        set((s) => ({ ...s, notifications: s.notifications.filter((n) => n.id !== id) }));
      },

      reset: () => {
        set(() => ({
          discovered: initialDiscovered(),
          favorites: [],
          hintsUsed: {},
          tutorialsRead: [],
          curiositiesRead: [],
          combinationsAttempted: 0,
          invalidAttempts: 0,
          sessionStart: Date.now(),
          consecutiveNoHints: 0,
          unlockedAchievements: {},
          notifications: [],
          currentHintId: null,
        } as Partial<State> as State));
      },
    }),
    { name: "recraft-state-v1" },
  ),
);

export function selectStats(s: State) {
  const componentsAndFinals = DISCOVERABLE_IDS.filter((id) => s.discovered[id]);
  const finalsDiscovered = FINAL_IDS.filter((id) => s.discovered[id]);
  const wasteCount = finalsDiscovered.reduce((sum, id) => sum + (getElement(id)?.wasteCount ?? 0), 0);
  return {
    totalDiscovered: componentsAndFinals.length,
    totalDiscoverable: DISCOVERABLE_IDS.length,
    finalsDiscovered: finalsDiscovered.length,
    totalFinals: FINAL_IDS.length,
    wasteCount,
    progressPct: Math.round((componentsAndFinals.length / DISCOVERABLE_IDS.length) * 100),
    achievementsUnlocked: Object.keys(s.unlockedAchievements).length,
    achievementsTotal: ACHIEVEMENTS.length,
    combinationsAttempted: s.combinationsAttempted,
    invalidAttempts: s.invalidAttempts,
    tutorialsRead: s.tutorialsRead.length,
    hintsUsed: Object.values(s.hintsUsed).reduce((a, b) => a + b, 0),
  };
}