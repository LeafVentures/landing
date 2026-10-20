# KlimaKarma

Live-Show Website: ein tropischer Kapok wächst im Hintergrund, darüber der Broadcast (Kapitel, CO₂, Ticker, Warteliste).

Ersetzt die alte statische Landingpage (`index.html` / `desktop.html` / `mobile.html`).

## Stack

TanStack Start, React, Three.js / React Three Fiber, Tailwind.

## Lokal

```bash
npm install
npm run dev
```

Die App braucht einen Server (Auth, Warteliste). GitHub Pages kann sie nicht ausliefern — deployen z. B. auf Vercel. `BETTER_AUTH_SECRET` und die Grok-Auth-Variablen kommen aus der Umgebung, nicht aus dem Repo.
