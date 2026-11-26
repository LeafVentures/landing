/**
 * Warteliste → Supabase (PostgREST), direkt aus dem Browser. Kein Server, kein
 * pg-Treiber: maximal stabil und überall deploybar. Dieselbe Datenbank wie die App.
 * Die anon-Credentials sind per Design öffentlich (stecken auch im App-Client);
 * geschützt wird über RLS — anon darf NUR einfügen, nicht lesen.
 */
const SUPABASE_URL = "https://irbsruwknyxvffqksbau.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyYnNydXdrbnl4dmZmcWtzYmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU2Mzc5MjEsImV4cCI6MjExMTIxMzkyMX0.fw3w8HeevpebCnAEYyR9XwVLCY2RPjYF3YoJBC89zt4";

export function normalizeEmail(input: string): string {
  const e = input.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    throw new Error("Bitte eine gültige E-Mail eingeben.");
  }
  if (e.length > 254) throw new Error("Diese E-Mail ist zu lang.");
  return e;
}

export async function joinWaitlist(input: string): Promise<void> {
  const email = normalizeEmail(input);
  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ email, source: "landing" }),
    });
  } catch {
    throw new Error("Keine Verbindung. Bitte prüfe dein Netz und versuch es erneut.");
  }
  // 201 = eingetragen, 409 = schon auf der Liste (beides ist für den Nutzer Erfolg).
  if (res.ok || res.status === 409) return;
  throw new Error("Das hat gerade nicht geklappt. Bitte später erneut versuchen.");
}
