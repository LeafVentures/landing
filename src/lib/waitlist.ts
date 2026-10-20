import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

function parseEmail(email: unknown) {
  if (typeof email !== "string") throw new Error("Bitte E-Mail eingeben.");
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    throw new Error("Bitte eine gültige E-Mail eingeben.");
  }
  return e;
}

export const joinWaitlist = createServerFn({ method: "POST" })
  .validator(parseEmail)
  .handler(async ({ data: email }) => {
    const sql = await getSql();
    await sql`
      insert into waitlist (id, email)
      values (${crypto.randomUUID()}, ${email})
      on conflict (email) do nothing
    `;
    const rows = await sql<{ c: number }>`select count(*)::int as c from waitlist`;
    return { ok: true as const, count: rows[0]?.c ?? 1 };
  });

export const waitlistCount = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{ c: number }>`select count(*)::int as c from waitlist`;
  return rows[0]?.c ?? 0;
});
