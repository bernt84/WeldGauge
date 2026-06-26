# WeldGauge — svejseinspektion

Måling og ISO 5817:2023-vurdering af svejsninger direkte fra kamera eller foto.
Installeres som app på telefon og PC, virker offline til måling, og deler
billeder og sager i din virksomhed.

---

## Kom i gang

1. **Åbn appen** (eller installér den: ☰ → App → *Installér app*; på iPhone:
   Del → *Føj til hjemmeskærm*).
2. **Log ind:** ☰ → *Log ind* → din e-mail + adgangskode (fås af din admin).
3. **Vælg/opret sag:** skriv et sagsnummer under Sag-id og tryk *Forbind*.
   Tidligere sager kan søges frem i listen — tryk på en sag for at åbne den.
4. **Kalibrér skalaen** (vigtigt — ellers kender appen ikke mm):
   - **Lineal (2 punkter):** klik to punkter på noget med kendt længde, skriv længden.
   - **Kalibreringsmærke:** læg et mærke med kendt størrelse (fx 20 mm) ved siden af
     svejsningen, skriv målet, og lad appen finde det. Tjek altid at skalaen (px/mm
     øverst) ser rigtig ud bagefter.
5. **Mål eller vurdér:**
   - **📏 Måling:** længde, diameter, a-mål, vinkel, punkt→linje, samt **📝 Tekst/note**.
   - **✓ Vurdering:** vælg niveau (B/C/D), sømtype og fejltype — appen dømmer OK/AFVIST
     efter ISO 5817:2023.
6. **Gem billede** (📸). Det lægges i galleriet og deles med din virksomhed.
7. **Billedtekst:** tryk ✎ på et billede for at give det en beskrivelse.
8. **Rapport / eksport:** ☰ → *Gem & eksport* → *Generér rapport*, eller
   *Eksportér sag (ZIP)* for alle billeder + rapport i én fil.

### Vigtigt om sletning
Billeder **slettes automatisk efter 30 dage**. Galleriet viser en nedtælling (⏳),
og "⚠ udløber snart" når der er under 7 dage tilbage.
- **⤓** gemmer et billede på din enhed.
- **📌** beholder et billede permanent (ingen auto-sletning).
- Auto-sletning sker når appen åbnes — så åbn den jævnligt.

### Synlighed
Sager og billeder er **kun synlige for din egen virksomhed**. Andre virksomheder ser intet.

---

## For virksomheds-admin (org-admin)

☰ → admin-kortet (kun synligt for admin):
- **Opret bruger:** e-mail, kode, rolle (bruger / org-admin) → *Opret*.
- **Skift rolle / slet bruger:** knapperne ud for hver bruger i listen.

Du administrerer kun din egen virksomheds brugere.

---

## Godt at vide
- Kamera og installation kræver HTTPS.
- Login kræver internet ved opstart; selve målingen virker offline og synker bagefter.
- Z-baseret a-estimat gælder kun ikke-konkave kantsømme; a-mål og indre fejl vurderes
  på makrosnit.
- Ved ny version: hard-refresh (Ctrl+F5) eller luk-åbn appen.
