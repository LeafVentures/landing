import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="relative grid min-h-screen place-items-center bg-bg px-6 text-fg">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(159,184,150,0.08),transparent_55%)]" />
      <div className="relative w-full max-w-sm rounded-xl border border-line bg-surface p-8">
        <Link to="/" className="font-display text-xl tracking-tight text-fg">
          KlimaKarma
        </Link>
        <h1 className="mt-6 font-display text-3xl tracking-tight">Anmelden</h1>
        <p className="mt-2 text-sm text-muted">
          Mit deinem Konto speicherst du Streaks, Impact und Rabatte.
        </p>
        <div className="mt-8 space-y-3">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => void signIn(p.providerId, { callbackURL: "/" })}
              >
                Weiter mit {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">Anmeldung ist deaktiviert.</p>
          )}
        </div>
        <Link
          to="/"
          className="mt-6 inline-block text-sm text-muted transition-colors duration-150 hover:text-fg"
        >
          Zurück zur Show
        </Link>
      </div>
    </main>
  );
}
