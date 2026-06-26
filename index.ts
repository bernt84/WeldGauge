// Supabase Edge Function: wg-admin
// Super-admin: opret virksomheder + brugere i enhver virksomhed.
// Org-admin:   opret brugere i EGEN virksomhed.
// Deploy via Edge Functions → "Open Editor" → indsæt → Deploy. Funktionsnavn: wg-admin
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
    const { data: prof } = await admin
      .from("wg_profiles").select("org_id, role, is_superadmin").eq("id", caller.user.id).single();
    if (!prof) return json({ error: "Ingen profil" }, 403);
    const isSuper = !!prof.is_superadmin;
    const isOrgAdmin = prof.role === "org_admin";

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // ---- Opret virksomhed (kun super-admin) ----
    if (action === "create_org") {
      if (!isSuper) return json({ error: "Kun super-admin kan oprette virksomheder" }, 403);
      const name = (body.name || "").trim();
      if (!name) return json({ error: "Virksomhedsnavn kræves" }, 400);
      const { data, error } = await admin.from("wg_organizations").insert({ name }).select().single();
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, org: data });
    }

    // ---- Opret bruger ----
    if (action === "create_user") {
      const email = (body.email || "").trim().toLowerCase();
      const password = body.password || "";
      const role = body.role === "org_admin" ? "org_admin" : "member";
      if (!email || password.length < 6) return json({ error: "E-mail og adgangskode (min. 6 tegn) kræves" }, 400);

      // Hvilken virksomhed?
      let orgId = body.org_id;
      if (isSuper) {
        if (!orgId) return json({ error: "Vælg en virksomhed" }, 400);
      } else if (isOrgAdmin) {
        orgId = prof.org_id; // tvinges til egen virksomhed
        if (!orgId) return json({ error: "Du har ingen virksomhed" }, 403);
      } else {
        return json({ error: "Ingen rettigheder til at oprette brugere" }, 403);
      }

      const { data: created, error: uerr } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
      if (uerr || !created?.user) return json({ error: uerr?.message || "Kunne ikke oprette bruger" }, 400);
      const { error: perr } = await admin.from("wg_profiles")
        .upsert({ id: created.user.id, email, org_id: orgId, role });
      if (perr) return json({ error: perr.message }, 400);
      return json({ ok: true, id: created.user.id, email });
    }

    // ---- Slet bruger ----
    if (action === "delete_user") {
      const targetId = body.user_id;
      if (!targetId) return json({ error: "Mangler bruger-id" }, 400);
      if (targetId === caller.user.id) return json({ error: "Du kan ikke slette dig selv" }, 400);
      // Find målprofilen
      const { data: target } = await admin.from("wg_profiles").select("org_id, is_superadmin").eq("id", targetId).single();
      if (!target) return json({ error: "Bruger ikke fundet" }, 404);
      if (target.is_superadmin && !isSuper) return json({ error: "Ingen rettigheder" }, 403);
      // Org-admin må kun slette i egen virksomhed
      if (!isSuper) {
        if (!isOrgAdmin) return json({ error: "Ingen rettigheder" }, 403);
        if (target.org_id !== prof.org_id) return json({ error: "Bruger tilhører en anden virksomhed" }, 403);
      }
      await admin.from("wg_profiles").delete().eq("id", targetId);
      const { error: derr } = await admin.auth.admin.deleteUser(targetId);
      if (derr) return json({ error: derr.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "Ukendt handling" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
