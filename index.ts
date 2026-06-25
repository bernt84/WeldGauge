// Supabase Edge Function: create-user
// Lader en org-admin oprette brugere i SIN EGEN virksomhed.
// Deploy:  supabase functions deploy create-user
// (SUPABASE_URL og SUPABASE_SERVICE_ROLE_KEY er automatisk tilgængelige som secrets)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const jwt = (req.headers.get("Authorization") || "").replace("Bearer ", "").trim();
    if (!jwt) return json({ error: "Mangler login" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    // Hvem kalder?
    const { data: caller, error: cerr } = await admin.auth.getUser(jwt);
    if (cerr || !caller?.user) return json({ error: "Ugyldigt login" }, 401);

    // Callerens profil — skal være org-admin med en virksomhed
    const { data: prof } = await admin
      .from("wg_profiles").select("org_id, role").eq("id", caller.user.id).single();
    if (!prof || prof.role !== "org_admin" || !prof.org_id)
      return json({ error: "Kun org-admin kan oprette brugere" }, 403);

    const body = await req.json().catch(() => ({}));
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const role = body.role === "org_admin" ? "org_admin" : "member";
    if (!email || password.length < 6)
      return json({ error: "E-mail og adgangskode (min. 6 tegn) kræves" }, 400);

    // Opret bruger (e-mail bekræftet, så de kan logge ind straks)
    const { data: created, error: uerr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (uerr || !created?.user) return json({ error: uerr?.message || "Kunne ikke oprette bruger" }, 400);

    // Knyt til SAMME virksomhed som org-admin
    const { error: perr } = await admin.from("wg_profiles")
      .upsert({ id: created.user.id, email, org_id: prof.org_id, role });
    if (perr) return json({ error: perr.message }, 400);

    return json({ ok: true, id: created.user.id, email });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
