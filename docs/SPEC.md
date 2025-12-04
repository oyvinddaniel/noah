# SPEC.md - Komplett Funksjonsspesifikasjon

## 🎯 Produktvisjon

En hemmelig kommunikasjonsapp for elever som ser ut som legitime skoleverktøy. Kombinerer produktivitet med moro, og lar hele klassen være tilkoblet uten at noen merker det.

---

## 👥 Brukere

### Vanlige brukere (klassekamerater)
- Joiner via delt link
- Velger eget kallenavn
- Kan chatte, stemme i polls, interagere med pet
- Ser hvem som er online (bare kallenavn)

### Admin (Noah)
- Alt vanlige brukere kan
- Ser ekte identitet bak kallenavn
- Kan refreshe/slette chat
- Kan kicke/banne brukere
- Kontrollerer polls og countdowns
- Admin-panel synlig kun for admin

---

## 🎭 Feature 1: Kamuflasje-Skins

Appen kan bytte utseende for å se ut som legitime verktøy.

### Skin 1: Google Docs (default)
- Tittel: "Norsk - Kapittel 4 Notater"
- Fake menylinje (File, Edit, View, etc.)
- Fake dokument-tekst i bakgrunnen (om Ibsen/Et dukkehjem)
- Chat ser ut som "kommentarer" i margen
- Bruker Google Docs farger og fonter

### Skin 2: Wikipedia
- Tittel: "Fotosyntese - Wikipedia"
- Wikipedia-logo og layout
- Fake artikkel om fotosyntese
- Chat i "Talk"-seksjonen
- Blå lenker, serif font

### Skin 3: Stack Overflow
- Tittel: "How to fix NullPointerException - Stack Overflow"
- Orange/hvit fargeskjema
- Fake kode-spørsmål
- Chat ser ut som "comments"

### Skin 4: Google Translate
- To tekst-bokser side om side
- Chat-meldinger ser ut som "oversettelser"
- Språkvelger dropdown (fake)

### Skin 5: Kahoot (venter)
- Lilla bakgrunn
- "Waiting for players..." melding
- PIN-kode felt (fake)
- Chat i "player list" område

### Skin 6: Office 365 Word
- Microsoft-stil menylinje
- Ribbon interface (fake)
- Dokument-område med chat

### Skin-bytte
- Hurtigtast: `Ctrl+Shift+[1-6]`
- Dropdown i hjørnet (disguised som noe annet)
- Animert overgang (0.3s fade)
- Husker valgt skin i localStorage

---

## 💬 Feature 2: Sanntids Chat

### Grunnleggende chat
- Meldinger vises i sanntid for alle
- Kallenavn + melding + tidsstempel
- Maks 500 tegn per melding
- Emoji-støtte
- Auto-scroll til nyeste melding

### Kallenavn-system
- Ved første besøk: popup for å velge kallenavn
- Lagres i localStorage + server
- Kan endres via innstillinger
- Admin ser: "xX_Gaming_Xx" → "Jonas Haugen"

### Chat-historikk
- Siste 100 meldinger lagres på server
- Lastes ved oppstart
- Admin kan tømme historikk

### Disguise-modus
- Chat-feltet ser ut som del av skin
- Google Docs: "Legg til kommentar..."
- Wikipedia: "Edit this section..."
- Input-feltet matcher skin-design

---

## 📊 Feature 3: Live Polls

### Poll-typer
1. **Skala (1-10):** "Hvor kjedelig er timen?"
2. **Ja/Nei:** "Tror du vi får lekser?"
3. **Flervalg:** "Hva blir lunsj?" (maks 4 valg)

### Funksjonalitet
- Alle kan se resultater i sanntid
- Animert bar chart
- Viser antall stemmer
- Anonym (ingen ser hvem som stemte hva)
- Admin kan opprette nye polls
- Admin kan resette/slette polls

### UI
- Kompakt visning i sidebar
- Utvidbar for å se detaljer
- Progress bars med prosent

---

## ⏱️ Feature 4: Felles Countdown

### Countdowns
- **Til friminutt:** Basert på timeplan
- **Til helg:** Fredag 14:00
- **Custom:** Admin kan sette egne

### Visning
- Stort, synlig tall
- Format: `MM:SS` eller `HH:MM:SS`
- Fargeendring når det nærmer seg (grønn → gul → rød)
- Confetti-animasjon når den når 0

### Synkronisering
- Server-basert tid (ikke klient)
- Alle ser samme countdown
- Auto-oppdaterer hvert sekund

---

## 🔮 Feature 5: Prediction Market

### Konsept
- Alle stemmer på utfall
- Etter hendelsen: admin markerer riktig svar
- De som gjettet riktig får poeng

### Eksempler
- "Kommer læreren til å gi lekser?" → Ja/Nei
- "Hvor mange minutter blir læreren forsinket?" → 0/1-2/3-5/5+
- "Hvem kommer sist til timen?" → Flervalg

### Leaderboard
- Viser hvem som har flest riktige
- Oppdateres etter hver resolved prediction
- Kallenavn, ikke ekte navn

---

## 👥 Feature 6: Buddy Check-in

### Online-status
- 🟢 Online (aktiv siste 2 min)
- 🟡 Idle (aktiv siste 10 min)
- ⚫ Offline

### Visning
- Kompakt liste i sidebar
- Viser kallenavn + status
- Klikk for å se "sist aktiv"

### Teknisk
- Heartbeat hvert 30. sekund
- Server tracker siste aktivitet
- Auto-cleanup etter 10 min inaktivitet

---

## 🐸 Feature 7: Klasse-Pet (Clash Royale-stil)

Se `PET.md` for komplett spesifikasjon.

### Kort oppsummering
- 6 skins: Goblin, Mini Pekka, Knight, Hog Rider, Mega Knight, Bandit
- Tilstander: Happy, Sleepy, Hyped, Grumpy, Party
- Interaksjoner: Mate, trene
- Collective feeding (3+ samtidig = spesial)
- Party mode: Fredager etter 10:00
- Alle kan interagere, stats er delt

---

## 👑 Feature 8: Admin Panel

### Tilgang
- Aktiveres med hemmelig kode ved login
- Eller permanent flagg i database for Noah

### Funksjoner

```
┌─────────────────────────────────────────┐
│ 👑 ADMIN PANEL                         │
├─────────────────────────────────────────┤
│                                         │
│ 📋 BRUKERE                              │
│ ├─ Se kallenavn → ekte navn            │
│ ├─ Kick bruker (temp)                  │
│ └─ Ban bruker (permanent)              │
│                                         │
│ 💬 CHAT                                 │
│ ├─ Tøm all historikk                   │
│ └─ Slett enkeltmeldinger               │
│                                         │
│ 📊 POLLS                                │
│ ├─ Opprett ny poll                     │
│ ├─ Avslutt poll                        │
│ └─ Slett poll                          │
│                                         │
│ ⏱️ COUNTDOWN                            │
│ ├─ Sett ny countdown                   │
│ └─ Reset countdown                     │
│                                         │
│ 🔮 PREDICTIONS                          │
│ ├─ Opprett prediction                  │
│ ├─ Resolve (marker riktig svar)        │
│ └─ Slett prediction                    │
│                                         │
│ 🐸 PET                                  │
│ ├─ Bytt skin                           │
│ ├─ Reset stats                         │
│ └─ Trigger spesial-event               │
│                                         │
└─────────────────────────────────────────┘
```

### UI
- Floating panel i hjørnet
- Kan minimeres
- Kun synlig for admin
- Matches aktiv skin (disguised)

---

## 🔐 Sikkerhet

### Autentisering
- Enkel: Kallenavn + browser fingerprint
- Ingen passord (lav terskel for å joine)
- Admin: Hemmelig kode eller hardkodet

### Moderering
- Admin kan slette meldinger
- Kick = 1 time utestengt
- Ban = permanent (basert på fingerprint)

### Personvern
- Ingen ekte navn lagres (unntatt admin-mapping)
- Chat slettes ved admin-refresh
- Ingen logging av IP

---

## 📱 Responsivitet

- Desktop: Full layout med sidebar
- Tablet: Kompakt sidebar
- Mobil: Bottomsheet for features, chat i fokus

---

## ⚡ Ytelse

- Initial load: < 2 sekunder
- Melding sendt → mottatt: < 100ms
- Skin-bytte: < 300ms
- Fungerer på treg skolenett
