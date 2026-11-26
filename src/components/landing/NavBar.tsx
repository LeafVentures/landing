import { Button } from "@/components/ui/button";

export function NavBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/40 bg-bg/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md bg-accent text-accent-fg">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
              <path
                d="M12 3C9 8 7.5 12 7.5 15.2c0 2.7 1.9 4.3 4.5 4.3s4.5-1.6 4.5-4.3C16.5 12 15 8 12 3Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="font-display text-lg tracking-tight text-fg">KlimaKarma</span>
        </a>

        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          <a href="#how" className="transition-colors duration-150 hover:text-fg">
            So funktioniert's
          </a>
          <a href="#join" className="transition-colors duration-150 hover:text-fg">
            Für Partner
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild size="sm">
            <a href="#join">Beitreten</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
