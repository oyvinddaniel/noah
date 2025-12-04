# TECH.md - Teknisk Arkitektur

## 🏗️ Overordnet Arkitektur

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│                 │ ◄─────────────────► │                 │
│  Client (Web)   │                     │  Server (Node)  │
│                 │ ◄─────────────────► │                 │
└─────────────────┘     HTTP/REST       └────────┬────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │  SQLite DB      │
                                        └─────────────────┘
```

---

## 🖥️ Frontend

### Stack
- **HTML5** - Semantisk markup
- **CSS3** - Vanilla CSS, ingen preprocessor
- **JavaScript** - Vanilla ES6+, ingen framework
- **Socket.io Client** - Sanntids kommunikasjon

### Hvorfor vanilla?
- Fungerer garantert på Chromebook
- Ingen build-step nødvendig
- Enkel å debugge
- Rask lasting

### Filstruktur

```
client/
├── index.html          # Hoved HTML-fil
├── css/
│   ├── main.css        # Grunnleggende styling
│   ├── components.css  # Chat, polls, etc.
│   └── skins/
│       ├── google-docs.css
│       ├── wikipedia.css
│       ├── stackoverflow.css
│       ├── google-translate.css
│       ├── kahoot.css
│       └── office365.css
├── js/
│   ├── app.js          # Main entry, init
│   ├── socket.js       # Socket.io wrapper
│   ├── chat.js         # Chat-logikk
│   ├── polls.js        # Poll-system
│   ├── pet.js          # Pet-logikk og animasjoner
│   ├── countdown.js    # Countdown-timer
│   ├── predictions.js  # Prediction market
│   ├── buddies.js      # Online-status
│   ├── skins.js        # Skin-bytte logikk
│   ├── admin.js        # Admin panel (lazy-loaded)
│   └── utils.js        # Hjelpefunksjoner
└── assets/
    ├── pets/           # Pet sprites (PNG)
    └── sounds/         # Lydeffekter (hvis vi legger til)
```

### JavaScript Moduler

```javascript
// app.js - Entry point
import { initSocket } from './socket.js';
import { initChat } from './chat.js';
import { initPolls } from './polls.js';
import { initPet } from './pet.js';
import { initCountdown } from './countdown.js';
import { initSkins } from './skins.js';
import { initBuddies } from './buddies.js';

async function init() {
    await initSocket();
    initChat();
    initPolls();
    initPet();
    initCountdown();
    initSkins();
    initBuddies();
    
    // Admin panel lastes kun hvis bruker er admin
    if (isAdmin()) {
        const { initAdmin } = await import('./admin.js');
        initAdmin();
    }
}

document.addEventListener('DOMContentLoaded', init);
```

---

## 🖧 Backend

### Stack
- **Node.js** (v18+)
- **Express** - HTTP server
- **Socket.io** - WebSocket wrapper
- **better-sqlite3** - SQLite driver (synkron, rask)

### Filstruktur

```
server/
├── index.js            # Entry point, Express setup
├── socket-handlers.js  # Alle socket event handlers
├── db.js               # Database wrapper
├── admin.js            # Admin-spesifikk logikk
├── middleware/
│   └── auth.js         # Enkel autentisering
└── utils/
    ├── fingerprint.js  # Browser fingerprinting
    └── time.js         # Tids-utilities
```

### Socket Events

```javascript
// CLIENT → SERVER
'chat:send'         // { message: string }
'poll:vote'         // { pollId: string, option: number }
'pet:feed'          // { }
'pet:train'         // { }
'prediction:vote'   // { predId: string, option: number }
'user:heartbeat'    // { }
'skin:change'       // { skinId: string }

// SERVER → CLIENT
'chat:new'          // { id, nickname, message, timestamp }
'chat:history'      // { messages: [] }
'poll:update'       // { pollId, results: {} }
'poll:new'          // { poll: {} }
'pet:state'         // { mood, level, lastFed, etc. }
'pet:collective'    // { event: 'special', triggeredBy: [] }
'countdown:sync'    // { remaining: seconds }
'prediction:update' // { predId, votes: {} }
'buddies:update'    // { users: [{ nickname, status }] }

// ADMIN-ONLY EVENTS
'admin:kick'        // { odecodeId: string }
'admin:ban'         // { odecodeId: string }
'admin:clearChat'   // { }
'admin:newPoll'     // { question, options }
'admin:resolvePred' // { predId, correctOption }
```

---

## 🗄️ Database

### SQLite Schema

```sql
-- database/schema.sql

-- Brukere
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    nickname TEXT NOT NULL,
    real_name TEXT,          -- Kun satt for admin-mapping
    fingerprint TEXT UNIQUE,
    is_admin INTEGER DEFAULT 0,
    is_banned INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME
);

-- Chat-meldinger
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Polls
CREATE TABLE polls (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    options TEXT NOT NULL,   -- JSON array
    poll_type TEXT NOT NULL, -- 'scale', 'yesno', 'multi'
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Poll-stemmer
CREATE TABLE poll_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    poll_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    option_index INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES polls(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(poll_id, user_id)
);

-- Predictions
CREATE TABLE predictions (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    options TEXT NOT NULL,   -- JSON array
    correct_option INTEGER,  -- NULL til resolved
    is_resolved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Prediction-stemmer
CREATE TABLE prediction_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prediction_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    option_index INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prediction_id) REFERENCES predictions(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(prediction_id, user_id)
);

-- Pet state (singleton)
CREATE TABLE pet (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    skin TEXT DEFAULT 'goblin',
    mood TEXT DEFAULT 'happy',
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    strength INTEGER DEFAULT 1,
    last_fed DATETIME,
    feed_count_today INTEGER DEFAULT 0,
    party_mode INTEGER DEFAULT 0
);

-- Pet interactions log (for collective feeding)
CREATE TABLE pet_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    interaction_type TEXT NOT NULL, -- 'feed', 'train'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Leaderboard (prediction scores)
CREATE TABLE leaderboard (
    user_id TEXT PRIMARY KEY,
    correct_predictions INTEGER DEFAULT 0,
    total_predictions INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Countdowns
CREATE TABLE countdowns (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    target_time DATETIME NOT NULL,
    is_active INTEGER DEFAULT 1
);

-- Indexes
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_pet_interactions_created ON pet_interactions(created_at);
```

---

## 🔄 Sanntids-logikk

### Collective Feeding Detection

```javascript
// server/socket-handlers.js

const COLLECTIVE_WINDOW_MS = 5000; // 5 sekunder
const COLLECTIVE_THRESHOLD = 3;    // 3 personer

async function handlePetFeed(socket, db) {
    const now = Date.now();
    
    // Logg denne interaksjonen
    db.logPetInteraction(socket.userId, 'feed');
    
    // Hent alle feeds siste 5 sekunder
    const recentFeeds = db.getRecentPetInteractions('feed', COLLECTIVE_WINDOW_MS);
    
    // Sjekk om vi har nok unike brukere
    const uniqueUsers = [...new Set(recentFeeds.map(f => f.user_id))];
    
    if (uniqueUsers.length >= COLLECTIVE_THRESHOLD) {
        // Trigger collective event!
        io.emit('pet:collective', {
            event: 'special',
            triggeredBy: uniqueUsers.map(id => db.getNickname(id)),
            bonus: 'mega_happy'
        });
        
        // Gi ekstra XP
        db.addPetXP(50);
    } else {
        // Normal feed
        db.addPetXP(5);
    }
    
    // Broadcast oppdatert pet state
    io.emit('pet:state', db.getPetState());
}
```

### Party Mode Check

```javascript
// server/utils/time.js

function isPartyTime() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 5 = Friday
    const hour = now.getHours();
    
    // Fredag etter kl 10:00
    return day === 5 && hour >= 10;
}

// Sjekkes hvert minutt
setInterval(() => {
    const shouldBeParty = isPartyTime();
    const currentState = db.getPetState();
    
    if (shouldBeParty && !currentState.party_mode) {
        db.setPetPartyMode(true);
        io.emit('pet:state', db.getPetState());
    } else if (!shouldBeParty && currentState.party_mode) {
        db.setPetPartyMode(false);
        io.emit('pet:state', db.getPetState());
    }
}, 60000);
```

---

## 🚀 Deployment

### Option 1: Railway (anbefalt)
```bash
# railway.json
{
    "build": {
        "builder": "NIXPACKS"
    },
    "deploy": {
        "startCommand": "node server/index.js"
    }
}
```

### Option 2: Vercel + Serverless
- Frontend: Vercel static
- Backend: Vercel serverless functions
- DB: Turso (SQLite edge)

### Option 3: Render
```yaml
# render.yaml
services:
  - type: web
    name: klasse-app
    env: node
    buildCommand: npm install
    startCommand: node server/index.js
```

---

## 🧪 Testing

### Test-oppsett
```bash
npm install --save-dev jest supertest socket.io-client
```

### Eksempel test
```javascript
// tests/chat.test.js
const io = require('socket.io-client');

describe('Chat', () => {
    let socket;
    
    beforeEach((done) => {
        socket = io('http://localhost:3000');
        socket.on('connect', done);
    });
    
    afterEach(() => {
        socket.disconnect();
    });
    
    test('should receive message after sending', (done) => {
        socket.emit('chat:send', { message: 'Hello' });
        
        socket.on('chat:new', (data) => {
            expect(data.message).toBe('Hello');
            done();
        });
    });
});
```

---

## 📦 Dependencies

### package.json
```json
{
    "name": "klasse-app",
    "version": "1.0.0",
    "scripts": {
        "start": "node server/index.js",
        "dev": "nodemon server/index.js",
        "test": "jest",
        "init-db": "node scripts/init-db.js"
    },
    "dependencies": {
        "express": "^4.18.2",
        "socket.io": "^4.6.1",
        "better-sqlite3": "^9.2.2",
        "cors": "^2.8.5",
        "dotenv": "^16.3.1"
    },
    "devDependencies": {
        "nodemon": "^3.0.2",
        "jest": "^29.7.0",
        "supertest": "^6.3.3",
        "socket.io-client": "^4.6.1"
    }
}
```

---

## 🔧 Environment Variables

```bash
# .env
PORT=3000
NODE_ENV=development
ADMIN_SECRET=super-secret-code-123
DATABASE_PATH=./database/app.db
```

---

## 🐛 Debugging Tips

1. **Socket.io issues:** Sjekk CORS-config
2. **Database locked:** Bruk WAL mode
3. **Chromebook-problemer:** Test i Chrome DevTools med throttling
4. **Skin CSS:** Bruk CSS custom properties for enkel switching
