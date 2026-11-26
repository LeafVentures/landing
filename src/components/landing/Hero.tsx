import { Leaf, QrCode, MapPin, ArrowRight } from "lucide-react";
import { JoinForm } from "./JoinForm";

const LEAVES = [
  { left: "8%", delay: "0s", dur: "17s", size: 16 },
  { left: "23%", delay: "6s", dur: "21s", size: 11 },
  { left: "44%", delay: "11s", dur: "19s", size: 14 },
  { left: "67%", delay: "3s", dur: "23s", size: 10 },
  { left: "82%", delay: "9s", dur: "18s", size: 15 },
  { left: "93%", delay: "14s", dur: "20s", size: 12 },
];

export function Hero() {
  return (
    <section className="relative z-10 px-5 pt-28 pb-16 md:px-10 md:pt-36 md:pb-24">
      {/* floating leaves, purely atmospheric */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {LEAVES.map((l, i) => (
          <Leaf
            key={i}
            className="leaf"
            style={{
              left: l.left,
              width: l.size,
              height: l.size,
              animationDelay: l.delay,
              animationDuration: l.dur,
            }}
          />
        ))}
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rise">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs text-muted backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent/70" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            Start in Stuttgart, Düsseldorf, Berlin &amp; Mannheim
          </div>

          <h1 className="mt-6 font-display text-[clamp(2.75rem,6vw,5rem)] leading-[0.98] tracking-[-0.03em] text-fg">
            Nachhaltigkeit,
            <br />
            die sich{" "}
            <span className="text-accent">wirklich</span> lohnt.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
            Verdiene <span className="text-fg">Leaves</span> für echte klimafreundliche
            Aktionen im Alltag und löse sie bei lokalen Partnern gegen echte Rabatte ein.
            Verifiziert, kostenlos, direkt vor deiner Haustür.
          </p>

          <div className="mt-9">
            <JoinForm />
          </div>
          <p className="mt-3 text-xs text-subtle">
            100 % kostenlos · Jederzeit kündbar · Kein Spam
          </p>

          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-5">
            {[
              ["3 %", "zurück bei Partnern"],
              ["1 Leaf", "= 1 Cent, nachvollziehbar"],
              ["4 Städte", "zum Start"],
            ].map(([k, v]) => (
              <div key={v}>
                <dt className="font-display text-2xl text-fg tnum">{k}</dt>
                <dd className="mt-0.5 text-xs text-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="glow-orb" aria-hidden />
          <AppMockup />
        </div>
      </div>
    </section>
  );
}

function AppMockup() {
  return (
    <div className="phone relative w-[280px] rounded-[2.25rem] border border-line bg-bg p-3 sm:w-[310px]">
      <div className="overflow-hidden rounded-[1.65rem] bg-surface">
        {/* status bar */}
        <div className="flex items-center justify-between px-5 pt-4 text-[10px] text-subtle tnum">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3 text-accent" /> Stuttgart
          </span>
        </div>

        {/* balance */}
        <div className="px-5 pt-5">
          <p className="text-xs text-muted">Dein Guthaben</p>
          <div className="mt-1 flex items-end gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-accent/15 text-accent">
              <Leaf className="size-5" />
            </span>
            <span className="font-display text-4xl leading-none text-fg tnum">1.240</span>
            <span className="pb-1 text-sm text-muted">Leaves</span>
          </div>
          <p className="mt-1 text-[11px] text-subtle">≈ 12,40 € bei Partnern einlösbar</p>
        </div>

        {/* reward card */}
        <div className="mx-4 mt-5 rounded-2xl card-sheen p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-fg">Café Grün</p>
              <p className="text-[11px] text-muted">250 m entfernt</p>
            </div>
            <span className="rounded-lg bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-fg">
              −2,50 €
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg/60">
            <div className="h-full w-3/4 rounded-full bg-accent" />
          </div>
          <p className="mt-2 text-[10px] text-subtle">Noch 60 Leaves bis zur nächsten Belohnung</p>
        </div>

        {/* actions */}
        <div className="mx-4 mt-4 mb-5 grid grid-cols-2 gap-2.5">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-xs font-semibold text-accent-fg">
            <QrCode className="size-4" /> Scannen
          </div>
          <div className="flex items-center justify-center gap-2 rounded-xl border border-line py-3 text-xs text-fg">
            Partner <ArrowRight className="size-3.5" />
          </div>
        </div>

        {/* tab bar */}
        <div className="flex items-center justify-around border-t border-line bg-elevated/60 px-5 py-3 text-subtle">
          <Leaf className="size-4 text-accent" />
          <MapPin className="size-4" />
          <QrCode className="size-4" />
          <div className="size-4 rounded-full border border-current" />
        </div>
      </div>
    </div>
  );
}
