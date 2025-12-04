# QUICKREF.md - Hurtigreferanse

> Rask oversikt for når du trenger å huske noe kjapt.

---

## 🎯 Prosjektet i én setning

**En hemmelig klasse-chat som ser ut som Google Docs, med pet, polls og multiplayer-features.**

---

## 👤 Hvem er dette for?

- **Noah** (15 år, admin) - Tonstad skole, 10. klasse
- **Klassekameratene** - Joiner via delt link
- **Chromebook** - Må fungere uten extensions

---

## 🛠️ Tech Stack

| Hva | Teknologi |
|-----|-----------|
| Frontend | Vanilla HTML/CSS/JS |
| Backend | Node.js + Express |
| Realtime | Socket.io |
| Database | SQLite (better-sqlite3) |
| Hosting | Railway/Vercel |

---

## 📁 Viktige filer

| Fil | Innhold |
|-----|---------|
| `CLAUDE.md` | Hovedinstruksjoner |
| `SPEC.md` | Alle features detaljert |
| `TECH.md` | Arkitektur og kode |
| `DESIGN.md` | UI/UX og skins |
| `PET.md` | Pet-system komplett |
| `STATUS.md` | Hva er gjort/gjenstår |
| `DEBUG.md` | Problemløsning |

---

## 🎭 De 6 Skins

1. **Google Docs** (default)
2. **Wikipedia**
3. **Stack Overflow**
4. **Google Translate**
5. **Kahoot**
6. **Office 365 Word**

**Hurtigtast:** `Ctrl+Shift+[1-6]`

---

## 🐸 De 6 Pet Skins

1. **Goblin** (default) - Grønn, lur
2. **Mini P.E.K.K.A** - Robot, "PANCAKES!"
3. **Knight** - Ridder, skjegg
4. **Hog Rider** - På gris, "HOG RIDAAA!"
5. **Mega Knight** - STOR, hopper
6. **Bandit** - Mystisk, dasher

---

## 😊 Pet Moods

| Mood | Trigger |
|------|---------|
| Happy 😊 | Normal/nylig interaksjon |
| Sleepy 😴 | 30+ min uten aktivitet |
| Hyped 🤩 | < 5 min til friminutt |
| Grumpy 😤 | Mandag før kl 12 |
| Party 🎉 | Fredag etter kl 10 |

---

## 🤝 Collective Feeding

- **Vindu:** 5 sekunder
- **Threshold:** 3+ brukere
- **Effekt:** +50 XP bonus, spesial-animasjon

---

## 📊 Features Oversikt

| Feature | Beskrivelse |
|---------|-------------|
| Chat | Sanntids, kallenavn |
| Polls | Live voting, anonym |
| Countdown | Synkronisert timer |
| Predictions | Stem + se hvem hadde rett |
| Buddies | Hvem er online |
| Pet | Delt maskot, alle kan mate/trene |

---

## 👑 Admin Powers

- Se kallenavn → ekte navn
- Kick/ban brukere
- Tøm chat
- Opprett/slett polls
- Kontroller countdown
- Resolve predictions
- Bytt pet skin
- Toggle party mode

---

## 🔑 Environment Variables

```bash
PORT=3000
NODE_ENV=development
ADMIN_SECRET=hemmelig-kode
DATABASE_PATH=./database/app.db
```

---

## 📜 Socket Events

### Client → Server
```
chat:send, poll:vote, pet:feed, pet:train,
prediction:vote, user:heartbeat, skin:change
```

### Server → Client
```
chat:new, chat:history, poll:update, poll:new,
pet:state, pet:collective, countdown:sync,
prediction:update, buddies:update
```

---

## 🚀 Kjør lokalt

```bash
# Install
npm install

# Init database
npm run init-db

# Start server
npm run dev

# Åpne i browser
http://localhost:3000
```

---

## ✅ Checklist før commit

- [ ] Koden fungerer
- [ ] Ingen console.log igjen
- [ ] STATUS.md oppdatert
- [ ] Tester passerer
- [ ] Ingen hardkodede secrets

---

## 🆘 Stuck?

1. Les `DEBUG.md`
2. Sjekk `TECH.md` for arkitektur
3. Google error message
4. Start på nytt med rent slate

---

## 📞 Kontekst for AI

Hvis du gir dette til en ny Claude-instans:

> "Du jobber på en hemmelig klasse-chat app for Noah (15). 
> Les CLAUDE.md først, så STATUS.md for current progress.
> Appen må fungere på Chromebook uten extensions."
