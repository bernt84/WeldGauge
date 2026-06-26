# WeldGauge — svejseinspektion

Måling og ISO 5817:2023-vurdering af svejsninger direkte fra kamera eller foto.
Single-file webapp (PWA) — installeres på telefon og PC, virker offline til måling,
og synker billeder/sager i skyen pr. virksomhed.

---

## For brugere (kom i gang)

1. **Åbn appen** i browseren (eller installér den: ☰ → App → *Installér app*; på iPhone:
   Del → *Føj til hjemmeskærm*).
2. **Log ind:** ☰ → *Log ind* → din e-mail + adgangskode (fås af din virksomheds admin).
3. **Vælg/opret sag:** under Sag-id skriver du et sagsnummer og trykker *Forbind*.
   Tidligere sager kan søges frem i listen — tryk på en sag for at åbne den.
4. **Kalibrér:** mål en kendt længde (lineal, 2 punkter) eller brug et kalibreringsmærke.
   Skalaen vises øverst (px/mm).
5. **Mål eller vurdér:**
   - **📏 Måling:** længde, diameter, a-mål, vinkel, punkt→linje, samt **📝 Tekst/note**.
   - **✓ Vurdering:** vælg niveau (B/C/D), sømtype og fejltype — appen dømmer OK/AFVIST
     efter ISO 5817:2023.
6. **Gem billede** (📸). Billedet lægges i galleriet og deles med din virksomhed.
7. **Billedtekst:** tryk ✎ på et billede for at give det en beskrivelse.
8. **Rapport / eksport:** ☰ → *Gem & eksport* → *Generér rapport* (PDF via udskriv),
   eller *Eksportér sag (ZIP)* for alle billeder + rapport i én fil.

### Vigtigt om sletning
Billeder **slettes automatisk efter 30 dage**. Galleriet viser en nedtælling (⏳),
og "⚠ udløber snart" når der er under 7 dage tilbage.
- **⤓** gemmer et billede på din enhed.
- **📌** beholder et billede permanent (ingen auto-sletning).
- Auto-sletning sker når appen åbnes — så åbn den jævnligt.

### Synlighed
Sager og billeder er **kun synlige for din egen virksomhed**. Andre virksomheder ser intet.

---

## For admin

### Roller
- **Super-admin:** opretter virksomheder, opretter brugere i alle virksomheder,
  udnævner org-admins, ser alt på tværs.
- **Org-admin:** opretter/sletter brugere i sin egen virksomhed.
- **Bruger:** måler og vurderer.

### Opret virksomheder og brugere (i appen)
☰ → admin-kortet (kun synligt for admin):
- **Virksomheder (super-admin):** skriv navn → *Opret*.
- **Opret bruger:** vælg virksomhed (super-admin), e-mail, kode, rolle → *Opret*.
- **Slet bruger:** ✕ ud for brugeren i listen.

---

## Opsætning (engangs — teknisk)

Backend kører på Supabase (projekt deles med andre apps, men WeldGauge har egne
`wg_`-tabeller og er fuldt adskilt).

1. **SQL** (Supabase → SQL Editor), kør i rækkefølge:
   - `supabase-setup.sql` — grundtabeller, storage, RLS.
   - `supabase-update-1.sql` — billedtekst + sagsbeskrivelse.
   - `supabase-update-2.sql` — super-admin (gør `bernt84@gmail.com` til super-admin).
2. **Edge Function:** Edge Functions → *Deploy a new function* → *Via Editor* →
   navngiv **`wg-admin`** → indsæt `functions/wg-admin/index.ts` → *Deploy*.
   (Bruger automatisk `SUPABASE_SERVICE_ROLE_KEY`.)
3. **Første bruger:** findes allerede i Authentication → Users. Knyttes til en
   virksomhed via SQL (se bunden af `supabase-setup.sql`).

### Deploy af appen
Læg mappen op på GitHub Pages (eller anden statisk host over HTTPS).
Kamera og PWA-installation kræver HTTPS.

### Versioner / cache
Appen er en PWA med service worker. Ved nye versioner: hard-refresh (Ctrl+F5) eller
luk-åbn appen. Cache-navnet i `sw.js` bumpes ved hver udgivelse.

---

## Filer
- `index.html` — hele appen.
- `sw.js` — service worker (offline + cache).
- `manifest.json` — PWA-manifest (ikon, navn).
- `supabase-setup.sql`, `supabase-update-1.sql`, `supabase-update-2.sql` — database.
- `functions/wg-admin/index.ts` — Edge Function (opret/slet brugere, opret virksomheder).

## Forbehold
- Auto-sletning kører kun når appen er åben (ingen server-cron).
- Z-baseret a-estimat gælder kun ikke-konkave kantsømme; a-mål og indre fejl vurderes
  på makrosnit.
- Marker-kalibrering er pragmatisk — verificér skalaen ved tvivl.
- Login kræver internet ved opstart; måling virker offline og synker bagefter.
