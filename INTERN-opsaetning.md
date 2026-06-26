# WeldGauge — intern opsætning (KUN super-admin)

> Denne fil deles IKKE med almindelige brugere eller org-admins.
> Læg den ikke i et offentligt repo sammen med appen.

## Roller
- **Super-admin** (dig): opretter virksomheder, opretter brugere i alle virksomheder,
  udnævner org-admins, skifter roller, sletter brugere, ser alt på tværs.
- **Org-admin:** opretter/sletter brugere og skifter roller i EGEN virksomhed.
- **Bruger:** måler og vurderer.

## Backend (Supabase)
Projekt deles med andre apps, men WeldGauge har egne `wg_`-tabeller og er fuldt adskilt
via RLS (`wg_my_org()`), så virksomheder kun ser egne sager/billeder. Super-admin ser alt.

### SQL — kør i rækkefølge (SQL Editor)
1. `supabase-setup.sql` — grundtabeller, storage, RLS.
2. `supabase-update-1.sql` — billedtekst + sagsbeskrivelse (wg_sager).
3. `supabase-update-2.sql` — super-admin (gør bernt84@gmail.com til super-admin).
Alle er idempotente (kan køres flere gange).

### Edge Function: wg-admin
Edge Functions → *Deploy a new function* → *Via Editor* → *Open Editor* →
navngiv **wg-admin** → indsæt `functions/wg-admin/index.ts` → *Deploy*.
Bruger automatisk `SUPABASE_SERVICE_ROLE_KEY`.
Handlinger: create_org, create_user, delete_user, set_role.
Genudgiv funktionen hver gang index.ts ændres.

### Første bruger / bootstrap
Brugeren findes i Authentication → Users. Knyttes til virksomhed + super-admin via
SQL (se bunden af supabase-setup.sql og supabase-update-2.sql). Glemt kode:
Authentication → Users → vælg bruger → Reset password.

## Filer
- `index.html` — hele appen.
- `sw.js` — service worker (offline + cache; bump cache-navn ved hver udgivelse).
- `manifest.json` — PWA-manifest.
- `supabase-setup.sql`, `supabase-update-1.sql`, `supabase-update-2.sql` — database.
- `functions/wg-admin/index.ts` — Edge Function.
- `README.md` — den offentlige brugervejledning (uden interne detaljer).

## Deploy af appen
Statisk host over HTTPS (fx GitHub Pages). Kamera + PWA kræver HTTPS.

## Drift / forbehold
- Auto-sletning (30 dage) kører kun når appen er åben — ingen server-cron.
- Storage deles med projektets øvrige apps (kvote). Komprimér hårdere hvis nødvendigt.
- Marker-kalibrering er pragmatisk; verificér skala.
