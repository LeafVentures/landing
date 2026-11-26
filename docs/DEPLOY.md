# Landing — Deploy & Backend

Die Landing ist eine TanStack-Start-App (Vite + Nitro). Funktional relevant ist die
**Warteliste** (`/src/lib/waitlist.ts` → Tabelle `waitlist`). Alles andere (Login,
3D-Szene) ist Builder-Gerüst und für die Marketing-Seite nicht nötig.

## Lokal

```bash
npm install
npm run dev          # http://localhost:8080  (PGLite-Fallback, nicht persistent)
```

Ohne `DATABASE_URL` läuft die App auf eingebettetem PGLite — gut zum Entwickeln,
aber die Warteliste überlebt keinen Neustart.

## Backend (Warteliste) produktiv

1. `DATABASE_URL` auf ein echtes Postgres setzen — **Neon** (eigene DB) oder die
   **Supabase-DB der App** (Connection-String aus dem Supabase-Dashboard,
   Settings → Database → Connection string → URI). Mit Supabase liegen die
   Waitlist-Einträge in `public.waitlist` derselben DB.
2. `VITE_AUTH_ENABLED=false` setzen (föderierter Login wird nicht genutzt).
3. Migrationen laufen beim Build automatisch (`npm run build` → `db:migrate`,
   `migrations/0002_waitlist.sql`).

Werte siehe `.env.example`.

## Deploy

`npm run build` erzeugt `.vercel/output` (Nitro). Deploybar auf Vercel
(`npx nitro deploy --prebuilt`) oder einem anderen Nitro-Ziel. Env-Variablen aus
`.env.example` im Hosting hinterlegen. Für App-Links die `public/.well-known/`-
Dateien mit ausliefern (siehe App-Repo `docs/app-links.md`).

## Warteliste auslesen

```sql
select email, created_at from waitlist order by created_at desc;
```
