export const SHOW_DURATION = 28;

export type ShowPhase =
  | "seed"
  | "roots"
  | "trunk"
  | "canopy"
  | "community"
  | "idle";

export const CHAPTERS: {
  id: ShowPhase;
  at: number;
  title: string;
  kicker: string;
  line: string;
}[] = [
  {
    id: "seed",
    at: 0,
    title: "Die Saat",
    kicker: "Kapitel 01",
    line: "Eine Entscheidung. Ein Same. Jetzt.",
  },
  {
    id: "roots",
    at: 0.14,
    title: "Die Wurzeln",
    kicker: "Kapitel 02",
    line: "Was du heute tust, hält den Boden.",
  },
  {
    id: "trunk",
    at: 0.36,
    title: "Der Stamm",
    kicker: "Kapitel 03",
    line: "Verifizierte Aktionen werden sichtbar.",
  },
  {
    id: "canopy",
    at: 0.58,
    title: "Das Kronendach",
    kicker: "Kapitel 04",
    line: "Dein Impact wächst in die Stadt.",
  },
  {
    id: "community",
    at: 0.82,
    title: "Die Gemeinschaft",
    kicker: "Kapitel 05",
    line: "2.847 Menschen. Ein Wald.",
  },
];

export type Burst = {
  id: number;
  x: number;
  z: number;
  born: number;
};

export const showRuntime = {
  growth: 0,
  elapsed: 0,
  clock: 0,
  idleTime: 0,
  playing: true,
  reduced: false,
  phase: "seed" as ShowPhase,
  bursts: [] as Burst[],
  phaseListeners: new Set<(phase: ShowPhase) => void>(),
};

let burstSeq = 1;

export function phaseAt(growth: number): ShowPhase {
  if (growth >= 1) return "idle";
  let current: ShowPhase = "seed";
  for (const c of CHAPTERS) {
    if (growth >= c.at) current = c.id;
  }
  return current;
}

export function tickShow(dt: number) {
  showRuntime.clock += dt;
  if (showRuntime.reduced) {
    showRuntime.growth = 1;
    showRuntime.phase = "idle";
    return;
  }
  if (!showRuntime.playing) return;
  if (showRuntime.growth >= 1) {
    showRuntime.idleTime += dt;
    showRuntime.growth = 1;
    if (showRuntime.phase !== "idle") {
      showRuntime.phase = "idle";
      for (const fn of showRuntime.phaseListeners) fn("idle");
    }
    return;
  }
  showRuntime.elapsed += dt;
  showRuntime.growth = Math.min(1, showRuntime.elapsed / SHOW_DURATION);
  const next = phaseAt(showRuntime.growth);
  if (next !== showRuntime.phase) {
    showRuntime.phase = next;
    for (const fn of showRuntime.phaseListeners) fn(next);
  }
}

export function replayShow() {
  showRuntime.elapsed = 0;
  showRuntime.growth = showRuntime.reduced ? 1 : 0;
  showRuntime.idleTime = 0;
  showRuntime.playing = !showRuntime.reduced;
  showRuntime.phase = showRuntime.reduced ? "idle" : "seed";
  showRuntime.bursts.length = 0;
  for (const fn of showRuntime.phaseListeners) fn(showRuntime.phase);
}

export function toggleShow() {
  if (showRuntime.reduced) return;
  if (showRuntime.growth >= 1) {
    replayShow();
    return;
  }
  showRuntime.playing = !showRuntime.playing;
}

export function spawnBurst() {
  const a = Math.random() * Math.PI * 2;
  const r = 0.8 + Math.random() * 3.4;
  showRuntime.bursts.push({
    id: burstSeq++,
    x: Math.cos(a) * r,
    z: Math.sin(a) * r,
    born: showRuntime.clock,
  });
  if (showRuntime.bursts.length > 18) showRuntime.bursts.shift();
}

export function initShowClient() {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    showRuntime.reduced = true;
    showRuntime.growth = 1;
    showRuntime.playing = false;
    showRuntime.phase = "idle";
  }
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
