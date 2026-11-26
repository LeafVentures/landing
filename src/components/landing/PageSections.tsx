import { Bike, Leaf, QrCode, ShieldCheck, Store, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JoinForm } from "./JoinForm";

const STEPS = [
  {
    title: "App laden",
    body: "Kostenlos für iOS und Android. Konto in unter einer Minute.",
    icon: Leaf,
  },
  {
    title: "Aktion wählen",
    body: "Rad, ÖPNV, Partner-Einkauf oder Strom sparen — per QR oder Foto bestätigt.",
    icon: Bike,
  },
  {
    title: "Leaves verdienen",
    body: "Jede bestätigte Aktion schreibt Leaves gut — nachvollziehbar im Ledger.",
    icon: ShieldCheck,
  },
  {
    title: "Rabatt einlösen",
    body: "Code bei lokalen Partnern zeigen und sofort sparen.",
    icon: QrCode,
  },
];

const PARTNER_POINTS = [
  "QR-Codes an der Kasse — keine neue Hardware, keine Integration.",
  "Echte Laufkundschaft, die im Alltag schon klimafreundlich unterwegs ist.",
  "Sichtbarer Impact für eure Nachbarschaft und ein ehrliches Markenbild.",
];

export function PageSections() {
  return (
    <div className="relative z-10">
      {/* How it works — a connected journey, not four identical cards */}
      <section
        id="how"
        className="border-t border-line/70 bg-surface/80 px-5 py-24 backdrop-blur-sm md:px-10 md:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-xl font-display text-4xl tracking-[-0.02em] text-fg md:text-5xl">
            In 30 Sekunden vom Alltag zum Rabatt.
          </h2>
          <p className="mt-4 max-w-md text-muted">
            Vier Schritte, kein Papierkram. So wächst dein Guthaben.
          </p>

          <ol className="relative mt-16 grid gap-y-12 md:grid-cols-4 md:gap-x-6">
            {/* connecting line on desktop */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-line to-transparent md:block"
            />
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative">
                <div className="flex items-center gap-4 md:block">
                  <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full border border-line bg-bg text-accent shadow-[0_8px_24px_-12px_rgba(0,0,0,0.9)]">
                    <step.icon className="size-5" />
                  </span>
                  <span className="font-display text-sm text-subtle tnum md:mt-5 md:block">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-xl text-fg">{step.title}</h3>
                <p className="mt-2 max-w-[22ch] text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Partners */}
      <section className="border-t border-line/70 bg-bg px-5 py-24 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl tracking-[-0.02em] text-fg md:text-5xl">
              Für Cafés, Läden und Städte.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
              Belohne verifiziertes Verhalten mit echten Rabatten. KlimaKarma bringt dir
              Menschen, die ohnehin bewusst leben — und macht euren Beitrag sichtbar.
            </p>
            <Button asChild className="mt-8" variant="secondary" size="lg">
              <a href="#join">
                <Store className="size-4" />
                Partner werden
              </a>
            </Button>
          </div>
          <ul className="space-y-3">
            {PARTNER_POINTS.map((t) => (
              <li
                key={t}
                className="flex items-start gap-3 rounded-2xl border border-line bg-surface/60 px-5 py-4 text-sm leading-relaxed text-fg"
              >
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                  <Check className="size-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Join */}
      <section
        id="join"
        className="relative overflow-hidden border-t border-line/70 bg-surface/80 px-5 py-28 md:px-10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-xl text-center">
          <h2 className="font-display text-4xl tracking-[-0.02em] text-fg md:text-5xl">
            Mach deinen Impact sichtbar.
          </h2>
          <p className="mt-4 text-lg text-muted">
            Trag dich ein — wir melden uns, sobald KlimaKarma in deiner Stadt startet.
          </p>
          <div className="mt-8 flex justify-center">
            <JoinForm cta="Beitreten" />
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <StoreBadge store="App Store" />
            <StoreBadge store="Google Play" />
          </div>
        </div>
      </section>

      <footer className="border-t border-line/70 bg-bg px-5 py-10 text-sm text-subtle md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-md bg-accent text-accent-fg">
              <Leaf className="size-4" />
            </span>
            <span className="font-display text-fg">KlimaKarma</span>
            <span className="ml-2 text-xs">© 2026 · Verifizierte Nachhaltigkeit aus Deutschland</span>
          </div>
          <nav className="flex flex-wrap gap-5 text-xs">
            <a href="/impressum" className="transition-colors hover:text-fg">Impressum</a>
            <a href="/datenschutz" className="transition-colors hover:text-fg">Datenschutz</a>
            <a href="mailto:hallo@klimakarma.app" className="transition-colors hover:text-fg">Kontakt</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function StoreBadge({ store }: { store: string }) {
  return (
    <div className="flex min-w-44 items-center gap-3 rounded-xl border border-line bg-elevated/80 px-4 py-2.5 text-left">
      <span className="grid size-8 place-items-center rounded-md bg-bg text-accent">
        <Leaf className="size-4" />
      </span>
      <span>
        <span className="block text-[10px] text-subtle">Bald verfügbar</span>
        <span className="text-sm font-medium text-fg">{store}</span>
      </span>
    </div>
  );
}
