# CLAUDE.md - Klasse-App Prosjekt

## 🎯 Prosjektoversikt

Du bygger en hemmelig klasse-chat-app for Noah (15 år) og klassekameratene hans på Tonstad skole. Appen skal se ut som vanlige skoleverktøy (Google Docs, Wikipedia, etc.) men er egentlig en sanntids kommunikasjonsplattform.

## 📁 Viktige filer å lese først

**LES DISSE I REKKEFØLGE FØR DU KODER:**
1. `SPEC.md` - Komplett spesifikasjon av alle features
2. `TECH.md` - Teknisk arkitektur og stack
3. `DESIGN.md` - UI/UX og skin-spesifikasjoner
4. `PET.md` - Alt om Clash Royale-inspirerte pets
5. `STATUS.md` - Nåværende status (OPPDATER DENNE ETTER HVER SESSION)

## 🛠️ Teknisk Stack

- **Frontend:** Vanilla HTML/CSS/JS (må fungere på Chromebook)
- **Backend:** Node.js + Express + Socket.io
- **Database:** SQLite (enkel, ingen ekstern DB)
- **Hosting:** Vercel/Railway (gratis tier)

## 📋 Arbeidsregler

### Før du starter en oppgave:
1. Les relevant dokumentasjon i dette prosjektet
2. Sjekk `STATUS.md` for hva som er gjort
3. Kjør eksisterende tester for å sikre at alt fungerer

### Mens du koder:
1. Skriv kode i små, testbare biter
2. Commit ofte med beskrivende meldinger
3. Logg problemer i `DEBUG.md`

### Etter hver session:
1. **ALLTID** oppdater `STATUS.md` med:
   - Hva som ble gjort
   - Hva som gjenstår
   - Kjente bugs
   - Neste steg
2. Kjør alle tester
3. Dokumenter eventuelle nye dependencies

## 🚨 Viktige begrensninger

- **Chromebook-kompatibel:** Ingen fancy features som ikke fungerer i Chrome
- **Skolenettverk:** Må fungere bak brannmurer/filtre
- **Diskret:** UI må kunne "disguises" raskt
- **Ingen extensions:** Alt må være web-basert

## 🎮 Nøkkelfunksjoner (prioritert)

1. **Falsk Google Docs skin** (og 5 andre skins)
2. **Sanntids chat** med kallenavn
3. **Live polls** 
4. **Felles countdown** til friminutt
5. **Prediction market** (lekser ja/nei etc.)
6. **Buddy check-in** (hvem er online)
7. **Klasse-pet** (Clash Royale-inspirert)

## 🔐 Admin-funksjoner (kun Noah)

- Se ekte navn bak kallenavn
- Refresh/tøm chat
- Kick/ban brukere
- Reset polls
- Kontroller pet

## 📂 Mappestruktur

```
klasse-app/
├── client/
│   ├── index.html
│   ├── css/
│   │   ├── main.css
│   │   └── skins/
│   │       ├── google-docs.css
│   │       ├── wikipedia.css
│   │       ├── stackoverflow.css
│   │       ├── google-translate.css
│   │       ├── kahoot.css
│   │       └── office365.css
│   ├── js/
│   │   ├── app.js
│   │   ├── chat.js
│   │   ├── polls.js
│   │   ├── pet.js
│   │   ├── countdown.js
│   │   └── skins.js
│   └── assets/
│       └── pets/
│           ├── goblin.png
│           ├── mini-pekka.png
│           ├── knight.png
│           ├── hog-rider.png
│           ├── mega-knight.png
│           └── bandit.png
├── server/
│   ├── index.js
│   ├── socket-handlers.js
│   ├── db.js
│   └── admin.js
├── database/
│   └── schema.sql
├── tests/
│   ├── chat.test.js
│   ├── polls.test.js
│   └── pet.test.js
└── docs/
    ├── CLAUDE.md
    ├── SPEC.md
    ├── TECH.md
    ├── DESIGN.md
    ├── PET.md
    ├── STATUS.md
    └── DEBUG.md
```

## ✅ Definition of Done

En feature er "ferdig" når:
- [ ] Koden fungerer på Chromebook i Chrome
- [ ] Alle tester passerer
- [ ] UI matcher skin-designet
- [ ] Sanntids-sync fungerer mellom flere brukere
- [ ] Admin-kontroller fungerer
- [ ] Dokumentert i STATUS.md

## 🆘 Hvis du står fast

1. Les DEBUG.md for tidligere løsninger
2. Sjekk TECH.md for arkitektur-beslutninger
3. Spør Noah om klargjøring via chat
