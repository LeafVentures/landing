import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JoinForm({ cta = "Kostenlos starten" }: { cta?: string }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const { joinWaitlist } = await import("@/lib/waitlist");
      await joinWaitlist(email);
      setDone(true);
      toast.success("Du bist dabei. Wir melden uns mit dem App-Zugang.");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Das hat nicht geklappt.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3.5 text-sm text-fg">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-accent-fg">
          <Check className="size-4" />
        </span>
        Du stehst auf der Liste. Wir melden uns, sobald KlimaKarma in deiner Stadt startet.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-2.5 sm:flex-row">
      <Input
        type="email"
        required
        autoComplete="email"
        placeholder="deine@email.de"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="E-Mail"
        className="h-12 flex-1 text-base"
      />
      <Button type="submit" size="lg" disabled={pending} className="shrink-0">
        {pending ? "Senden…" : cta}
        {!pending && <ArrowRight />}
      </Button>
    </form>
  );
}
