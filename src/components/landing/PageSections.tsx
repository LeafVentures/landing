import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Bike,
  Leaf,
  QrCode,
  ShieldCheck,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    n: "01",
    title: "App herunterladen",
    body: "Kostenlos für iOS und Android. Zum Start in Stuttgart, Düsseldorf, Berlin und Mannheim.",
    icon: Leaf,
  },
  {
    n: "02",
    title: "Aktion wählen",
    body: "Radfahren, ÖPNV, Partner-Einkauf oder Strom sparen — automatisch oder per QR/Foto bestätigt.",
    icon: Bike,
  },
  {
    n: "03",
    title: "Impact tracken",
    body: "Deine bestätigten Aktionen werden in der App sichtbar.",
    icon: ShieldCheck,
  },
  {
    n: "04",
    title: "Rabatte einlösen",
    body: "Code bei lokalen Partnern zeigen und Rabatte einlösen.",
    icon: QrCode,
  },
];

function JoinForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const { joinWaitlist } = await import("@/lib/waitlist");
      await joinWaitlist({ data: email });
      toast.success("Du bist dabei. Wir melden uns mit dem App-Zugang.");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Das hat nicht geklappt.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <Input
        type="email"
        required
        autoComplete="email"
        placeholder="deine@email.de"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="E-Mail"
      />
      <Button type="submit" disabled={pending} className="sm:w-auto">
        {pending ? "Senden…" : "Kostenlos starten"}
        <ArrowRight />
      </Button>
    </form>
  );
}

export function PageSections() {
  return (
    <div className="relative z-10">
      <section id="how" className="border-t border-line bg-surface/90 px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] tracking-[0.22em] text-accent uppercase">In vier Schritten</p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-fg md:text-5xl">
            So startest du in 30 Sekunden
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {STEPS.map((step) => (
              <article
                key={step.n}
                className="rounded-xl border border-line bg-bg/40 p-5"
              >
                <div className="flex size-10 items-center justify-center rounded-md bg-elevated text-accent">
                  <step.icon className="size-4" />
                </div>
                <p className="mt-5 font-mono text-[11px] tabular-nums text-subtle">{step.n}</p>
                <h3 className="mt-1 font-display text-xl text-fg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface/90 px-5 py-20 md:px-10">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-[11px] tracking-[0.22em] text-accent uppercase">Für Partner</p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-fg">
              Cafés, Läden, Städte
            </h2>
            <p className="mt-4 max-w-md text-muted">
              Belohne verifiziertes Verhalten mit echten Rabatten. KlimaKarma bringt dir
              Menschen, die schon im Alltag klimafreundlich unterwegs sind.
            </p>
            <Button asChild className="mt-7" variant="secondary">
              <a href="#join">
                <Store className="size-4" />
                Partner werden
              </a>
            </Button>
          </div>
          <ul className="space-y-3">
            {[
              "QR-Codes an der Kasse, keine neue Hardware",
              "Sichtbarer Impact für eure Nachbarschaft",
              "Start in Stuttgart, Düsseldorf, Berlin und Mannheim",
            ].map((t) => (
              <li
                key={t}
                className="rounded-lg border border-line bg-bg/40 px-4 py-3 text-sm text-fg"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="join" className="border-t border-line bg-bg/90 px-5 py-24 md:px-10">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-4xl tracking-tight text-fg md:text-5xl">
            Bereit, deinen Impact sichtbar zu machen?
          </h2>
          <p className="mt-4 text-muted">
            Trag dich in die Warteliste ein. Wir melden uns, sobald KlimaKarma in deiner Stadt startet.
          </p>
          <div className="mt-8 flex justify-center">
            <JoinForm />
          </div>
          <p className="mt-3 text-xs text-subtle">100 % kostenlos. Jederzeit kündbar. Kein Spam.</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <StoreLink label="App Store" hint="Bald im" />
            <StoreLink label="Google Play" hint="Bald bei" />
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-bg px-5 py-8 text-xs text-subtle md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p>© 2026 KlimaKarma. Verifizierte Nachhaltigkeit aus Deutschland.</p>
          <div className="flex flex-wrap gap-4">
            <a href="#join" className="hover:text-fg">
              Impressum
            </a>
            <a href="#join" className="hover:text-fg">
              Datenschutz
            </a>
            <a href="#join" className="hover:text-fg">
              Kontakt
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StoreLink({ label, hint }: { label: string; hint: string }) {
  return (
    <a
      href="#join"
      className={cn(
        "flex min-w-44 items-center gap-3 rounded-lg border border-line bg-elevated px-4 py-3",
        "text-left transition-colors duration-150 hover:bg-surface",
      )}
    >
      <span className="grid size-8 place-items-center rounded-md bg-bg text-fg">
        <Leaf className="size-4" />
      </span>
      <span>
        <span className="block text-[10px] text-subtle">{hint}</span>
        <span className="text-sm font-medium text-fg">{label}</span>
      </span>
    </a>
  );
}
