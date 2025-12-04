# PET.md - Klasse-Pet Spesifikasjon

## 🎮 Oversikt

Klasse-peten er en delt maskot som alle i klassen kan interagere med. Inspirert av Clash Royale-karakterer, med fokus på kollektiv interaksjon.

---

## 🎨 Pet Skins (Clash Royale-inspirert)

### 1. Goblin (Default)
**Utseende:** Grønn, liten, skarp nese, spisse ører, lur smil
**Personlighet:** Energisk, kaotisk, litt ondsinnet på en morsom måte
**Idle animasjon:** Hopper fra fot til fot, gnir hendene
**Feed reaksjon:** Spiser grådig, rapejsyder
**Train reaksjon:** Gjør push-ups med dårlig form, ser stolt ut

```
    ╭───╮
   ╱ ◉ ◉ ╲
  │   ▼   │
   ╲ ═══ ╱
    │ │ │
   ╱│   │╲
```

### 2. Mini P.E.K.K.A
**Utseende:** Liten robot-ridder, blå rustning, glødende øyne, sommerfuglnett
**Personlighet:** Aggressivt søt, besatt av sommerfugler og "pancakes"
**Idle animasjon:** Ser seg rundt etter sommerfugler
**Feed reaksjon:** "PANCAKES!" - hopper av glede
**Train reaksjon:** Svinger sverdet i luften

```
    ╔═══╗
    ║◈ ◈║
    ║ ─ ║
    ╚═╦═╝
   ╔══╩══╗
   ║ ├─┤ ║
   ╚══╦══╝
     ═╩═
```

### 3. Knight
**Utseende:** Klassisk ridder, gyllent skjegg, brun kappe
**Personlighet:** Ærlig, litt overmoden, "good stats for cost"
**Idle animasjon:** Står stødig, stryker skjegget
**Feed reaksjon:** Nikker fornøyd, tommel opp
**Train reaksjon:** Sverd-øvelser, parerer usynlig fiende

```
    ╭─▲─╮
    │◕ ◕│
    │ ▽ │
    │═══│
   ╱│ │ │╲
    │ │ │
    ╱   ╲
```

### 4. Hog Rider
**Utseende:** Muskuløs mann på villsvin, hammer, mohawk
**Personlighet:** ADHD-energi, roper alltid, ingen innendørs-stemme
**Idle animasjon:** Grisen stamper, rider holder seg fast
**Feed reaksjon:** "HOG RIDAAA!" - grisen spiser
**Train reaksjon:** Svinger hammeren, nesten faller av

```
      ╭───╮
      │◕ ◕│
   ╭──┴─┬─┴──╮
   │ 🐗 │ ⚒️ │
   ╰────┴────╯
```

### 5. Mega Knight
**Utseende:** STOR rustning, glødende blå øyne, hopper
**Personlighet:** Dominerende, liker å lande på ting, dramatisk
**Idle animasjon:** Puster tungt, rustningen klirrer
**Feed reaksjon:** Løfter maten, smasker høyt
**Train reaksjon:** HOPPER - lander med slam

```
   ╔═══════╗
   ║ ◈   ◈ ║
   ║   ▼   ║
   ╠═══════╣
   ║ ┌─┬─┐ ║
   ║ │ │ │ ║
   ╚═╧═╧═╧═╝
```

### 6. Bandit (Boss Bandit)
**Utseende:** Mystisk kvinne, maske, dash-pose
**Personlighet:** Kul, mystisk, snakker lite men handler raskt
**Idle animasjon:** Lener seg tilbake, ser rundt
**Feed reaksjon:** Dash til maten, forsvinner, kommer tilbake
**Train reaksjon:** Dash-dash-dash rundt i boksen

```
    ╭─────╮
    │ ◕ ◕ │
    │ ███ │
    ╰──┬──╯
      ╱│╲
     ╱ │ ╲
    ╱  │  ╲
```

---

## 😊 Tilstander (Moods)

### Happy 😊
**Trigger:** Normal tilstand, nylig matet/trent
**Visuelt:** Smiler, øyne lyser
**Animasjon:** Bouncer lett

### Sleepy 😴
**Trigger:** Ingen interaksjoner på 30+ min
**Visuelt:** Lukkede øyne, Z-er
**Animasjon:** Sakte breathing, Z-bobler

### Hyped 🤩
**Trigger:** Under countdown < 5 min til friminutt
**Visuelt:** Store øyne, hopper
**Animasjon:** Rask bouncing, sparkles

### Grumpy 😤
**Trigger:** Mandager før kl 12:00
**Visuelt:** Rynket panne, sur munn
**Animasjon:** Krysser armene, rister hodet

### Party 🎉
**Trigger:** Fredager etter kl 10:00
**Visuelt:** Party hat, konfetti rundt
**Animasjon:** Danser, kaster konfetti

---

## 🎮 Interaksjoner

### Feed (Mate) 🍖
**Effekt:**
- +5 XP
- Mood → Happy (midlertidig)
- Animasjon: Spiser

**Cooldown:** 1 minutt per bruker
**Limit:** Maks 50 feeds per dag (totalt for alle)

### Train (Trene) 🏋️
**Effekt:**
- +3 XP
- +1 Strength (hver 10. trening)
- Animasjon: Trener

**Cooldown:** 2 minutter per bruker
**Limit:** Maks 30 treninger per dag

---

## 🤝 Collective Feeding

### Hvordan det fungerer
1. Når en bruker mater, åpnes et 5-sekunders vindu
2. Hvis 3+ unike brukere mater innen vinduet:
   - **COLLECTIVE TRIGGER!**

### Collective Event
**Visuelt:**
- Pet glør i regnbuefarger
- Konfetti-eksplosjon
- Spesiell animasjon per skin

**Effekter:**
- +50 XP (bonus)
- Alle som deltok får achievement
- Pet mood → Hyped i 5 min
- Melding i chat: "🎉 xX_Gamer, EmmaW og poteten trigget COLLECTIVE FEED!"

### Spesial-animasjoner per skin

| Skin | Collective Animasjon |
|------|---------------------|
| Goblin | Ler hysterisk, kaster gull |
| Mini P.E.K.K.A | Spinner med sverdet, sommerfugler |
| Knight | Reiser sverd til himmelen, lysstråle |
| Hog Rider | Grisen flyr kortvarig, "YYEAAAH!" |
| Mega Knight | Mega-hopp, skjermen rister |
| Bandit | Dash-blur over hele pet-area |

---

## 📈 Leveling System

### XP til neste level

| Level | XP Required | Total XP |
|-------|-------------|----------|
| 1 | 0 | 0 |
| 2 | 100 | 100 |
| 3 | 150 | 250 |
| 4 | 200 | 450 |
| 5 | 300 | 750 |
| 6 | 400 | 1150 |
| 7 | 500 | 1650 |
| 8 | 650 | 2300 |
| 9 | 800 | 3100 |
| 10 | 1000 | 4100 |
| 11+ | +200 per level | ... |

### Level-up Rewards
- **Level 5:** Unlock alternativ idle-animasjon
- **Level 10:** Unlock "golden" variant av skin
- **Level 15:** Unlock spesial-emote i chat
- **Level 20:** Unlock "legendary" effekter

---

## 💪 Strength System

### Hvordan Strength fungerer
- Starter på 1
- +1 for hver 10. trening
- Vises som tall med 💪 emoji

### Strength milestones
| Strength | Tittel | Visuell endring |
|----------|--------|-----------------|
| 1-5 | Weak | Normal størrelse |
| 6-10 | Average | Litt større |
| 11-20 | Strong | Synlige muskler |
| 21-35 | Buff | Betydelig større |
| 36-50 | Mega Buff | Comically stor |
| 51+ | ABSOLUTE UNIT | Fyller hele boksen |

---

## 🎉 Party Mode

### Aktivering
- Automatisk: Fredager etter kl 10:00
- Manuelt: Admin kan aktivere

### Effekter
- Pet har party-hat
- Bakgrunn: Disco-farger
- Konfetti faller kontinuerlig
- Spesiell musikk-note animasjon
- +2x XP på alle interaksjoner

### Deaktivering
- Automatisk: Lørdag kl 00:00
- Manuelt: Admin kan deaktivere

---

## 🗄️ Database Schema

```sql
-- Pet state (singleton)
CREATE TABLE pet (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    skin TEXT DEFAULT 'goblin',
    mood TEXT DEFAULT 'happy',
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    xp_to_next INTEGER DEFAULT 100,
    strength INTEGER DEFAULT 1,
    train_count INTEGER DEFAULT 0,
    last_fed DATETIME,
    last_trained DATETIME,
    feed_count_today INTEGER DEFAULT 0,
    train_count_today INTEGER DEFAULT 0,
    party_mode INTEGER DEFAULT 0,
    last_collective DATETIME,
    total_collectives INTEGER DEFAULT 0
);

-- Interaction log
CREATE TABLE pet_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    interaction_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Achievement tracking
CREATE TABLE pet_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    achievement TEXT NOT NULL,
    achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🏆 Achievements

| Achievement | Krav | Badge |
|------------|------|-------|
| First Feed | Mat peten første gang | 🍖 |
| First Train | Tren peten første gang | 🏋️ |
| Collective Participant | Delta i collective feed | 🤝 |
| Dedicated Trainer | 50 treninger totalt | 💪 |
| Pet Whisperer | 100 matinger totalt | 🐾 |
| Party Animal | Interager under party mode | 🎉 |
| Early Bird | Mat peten før kl 08:00 | 🌅 |
| Night Owl | Mat peten etter kl 22:00 | 🦉 |
| Collective Master | Trigger 10 collectives | ⭐ |

---

## 🔧 Admin Controls

### Pet Management
```
┌─────────────────────────────────┐
│ 🐸 PET ADMIN                    │
├─────────────────────────────────┤
│                                 │
│ Current Skin: [Goblin ▼]        │
│                                 │
│ [Change Skin]                   │
│                                 │
│ Stats:                          │
│ • Level: 7                      │
│ • XP: 423/500                   │
│ • Strength: 15                  │
│                                 │
│ [Reset Stats]  [Max Level]      │
│                                 │
│ Party Mode: [OFF]               │
│ [Toggle Party]                  │
│                                 │
│ [Trigger Collective Event]      │
│                                 │
│ Daily Limits:                   │
│ • Feeds: 34/50                  │
│ • Trains: 21/30                 │
│                                 │
│ [Reset Daily Limits]            │
│                                 │
└─────────────────────────────────┘
```

---

## 🎨 Asset Requirements

### Sprites needed (per skin)
1. `idle_1.png` - Idle frame 1
2. `idle_2.png` - Idle frame 2
3. `feed_1.png` - Feed animation frame 1
4. `feed_2.png` - Feed animation frame 2
5. `feed_3.png` - Feed animation frame 3
6. `train_1.png` - Train animation frame 1
7. `train_2.png` - Train animation frame 2
8. `train_3.png` - Train animation frame 3
9. `collective.png` - Collective special
10. `party.png` - Party mode variant

### Størrelse
- Base: 128x128 px
- @2x: 256x256 px (for retina)

### Format
- PNG med transparency
- Optimized for web (< 50KB per sprite)

---

## 💡 Implementation Notes

### Collective Detection Algorithm
```javascript
const COLLECTIVE_WINDOW = 5000; // 5 seconds
const COLLECTIVE_THRESHOLD = 3; // 3 users

function checkCollective(newFeed) {
    const now = Date.now();
    const windowStart = now - COLLECTIVE_WINDOW;
    
    // Get feeds in window
    const recentFeeds = db.getInteractions('feed', windowStart);
    
    // Add current feed
    recentFeeds.push(newFeed);
    
    // Count unique users
    const uniqueUsers = new Set(recentFeeds.map(f => f.userId));
    
    if (uniqueUsers.size >= COLLECTIVE_THRESHOLD) {
        triggerCollective(Array.from(uniqueUsers));
        return true;
    }
    
    return false;
}
```

### Party Mode Check
```javascript
function isPartyTime() {
    const now = new Date();
    return now.getDay() === 5 && now.getHours() >= 10;
}
```
