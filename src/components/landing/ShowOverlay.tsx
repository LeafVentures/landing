import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeed } from "@/lib/live-feed";
import {
  CHAPTERS,
  SHOW_DURATION,
  replayShow,
  showRuntime,
  toggleShow,
  type ShowPhase,
} from "@/lib/show-runtime";

function formatClock(seconds: number) {
  const s = Math.min(SHOW_DURATION, Math.max(0, seconds));
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
}

function chapterFor(phase: ShowPhase) {
  return CHAPTERS.find((c) => c.id === phase) ?? CHAPTERS[0];
}

export function ShowOverlay() {
  const [phase, setPhase] = useState<ShowPhase>(showRuntime.phase);
  const [growth, setGrowth] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [titleOn, setTitleOn] = useState(true);
  const events = useFeed((s) => s.events);
  const co2 = useFeed((s) => s.co2);
  const users = useFeed((s) => s.users);
  const pushNext = useFeed((s) => s.pushNext);

  useEffect(() => {
    const onPhase = (p: ShowPhase) => setPhase(p);
    showRuntime.phaseListeners.add(onPhase);
    const id = window.setInterval(() => {
      setGrowth(showRuntime.growth);
      setPlaying(showRuntime.playing);
      setElapsed(showRuntime.elapsed);
    }, 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        toggleShow();
        setPlaying(showRuntime.playing);
      }
      if (e.key === "r" || e.key === "R") {
        replayShow();
        setPlaying(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      showRuntime.phaseListeners.delete(onPhase);
      window.clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    const kick = window.setTimeout(() => pushNext(), 1800);
    const id = window.setInterval(() => {
      if (showRuntime.growth < 0.12 && !showRuntime.playing) return;
      pushNext();
    }, 3400);
    return () => {
      window.clearTimeout(kick);
      window.clearInterval(id);
    };
  }, [pushNext]);

  useEffect(() => {
    setTitleOn(true);
    const id = window.setTimeout(() => setTitleOn(false), 2600);
    return () => window.clearTimeout(id);
  }, [phase]);

  const chapter = chapterFor(phase);
  const showTitle = phase !== "idle" && titleOn;

  return (
    <section id="show" className="relative min-h-[100dvh]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-0.5 bg-line"
        aria-hidden
      >
        <div
          className="show-progress h-full bg-accent"
          style={{ transform: `scaleX(${growth})` }}
        />
      </div>

      <div className="relative z-20 flex min-h-[100dvh] flex-col justify-between px-5 pb-8 pt-24 md:px-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-line bg-bg/55 px-3 py-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-2 animate-ping rounded-full bg-live opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-live" />
            </span>
            <span className="text-[11px] font-medium tracking-[0.18em] text-fg uppercase">
              Live
            </span>
            <span className="text-[11px] text-muted">KlimaKarma Show</span>
            <span className="hidden font-mono text-[11px] tabular-nums text-subtle sm:inline">
              {formatClock(elapsed)} / {formatClock(SHOW_DURATION)}
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="size-10 bg-bg/55"
              onClick={() => {
                toggleShow();
                setPlaying(showRuntime.playing);
              }}
              aria-label={playing ? "Pause" : "Abspielen"}
            >
              {playing && growth < 1 ? <Pause /> : <Play />}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="size-10 bg-bg/55"
              onClick={() => {
                replayShow();
                setPlaying(true);
              }}
              aria-label="Show erneut"
            >
              <RotateCcw />
            </Button>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-[18%] hidden justify-center px-5 md:flex">
          {showTitle ? (
            <div key={chapter.id} className="chapter-in text-center">
              <p className="text-[11px] tracking-[0.28em] text-accent uppercase">
                {chapter.kicker}
              </p>
              <h2 className="mt-2 font-display text-5xl tracking-tight text-fg md:text-7xl">
                {chapter.title}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted md:text-base">
                {chapter.line}
              </p>
            </div>
          ) : (
            <div className="chapter-in text-center">
              <p className="text-[11px] tracking-[0.28em] text-accent uppercase">
                Immer in Bewegung
              </p>
              <h2 className="mt-2 font-display text-4xl tracking-tight text-fg md:text-6xl">
                Der Wald atmet
              </h2>
            </div>
          )}
        </div>

        <div className="grid items-end gap-6 md:grid-cols-[1fr_auto] md:gap-10">
          <div className="max-w-xl">
            <p className="text-[11px] tracking-[0.22em] text-accent uppercase">
              Verifizierte Nachhaltigkeit
            </p>
            <h1 className="mt-3 font-display text-3xl leading-[1.08] tracking-tight text-fg sm:text-4xl md:text-6xl">
              Nachhaltigkeit, die sich wirklich lohnt.
            </h1>
            <p className="mt-4 max-w-md text-base text-muted md:text-lg">
              Verifizierte Eco-Aktionen. Echte lokale Rabatte. Sichtbarer
              CO₂-Impact — und ein Baum, der mit jeder Aktion wächst.
            </p>
            <div className="pointer-events-auto mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#join">Kostenlos beitreten</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#impact">Impact ansehen</a>
              </Button>
            </div>
          </div>

          <div className="hidden w-full max-w-sm justify-self-end rounded-xl border border-line bg-bg/60 p-5 md:block">
            <p className="text-[11px] tracking-[0.18em] text-subtle uppercase">
              Gemeinschaft
            </p>
            <p className="mt-2 font-display text-4xl tabular-nums tracking-tight text-fg">
              {co2.toLocaleString("de-DE")}
            </p>
            <p className="text-sm text-muted">kg CO₂ eingespart</p>
            <p className="mt-3 text-sm text-subtle">
              <span className="tabular-nums text-fg">{users.toLocaleString("de-DE")}</span>{" "}
              aktive Nutzer in 12 Städten
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-20 border-t border-line bg-bg/50 px-5 py-3 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <p className="shrink-0 text-[11px] tracking-[0.2em] text-accent uppercase">
            Live-Ticker
          </p>
          <ul className="flex min-h-6 flex-1 flex-col gap-1 overflow-hidden">
            {events.slice(0, 1).map((e) => (
              <li
                key={e.id}
                className="ticker-in flex flex-wrap items-baseline gap-x-2 text-sm text-fg"
              >
                <span className="font-medium">{e.name}</span>
                <span className="text-subtle">{e.city}</span>
                <span className="text-muted">{e.action}</span>
                <span className="tabular-nums text-accent">−{e.co2.toFixed(1)} kg</span>
              </li>
            ))}
            {events.length === 0 && (
              <li className="text-sm text-muted">Warten auf die erste verifizierte Aktion…</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
