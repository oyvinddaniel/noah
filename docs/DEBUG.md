# DEBUG.md - Debugging Log

> Logg alle problemer og løsninger her for fremtidig referanse.

---

## 🔧 Debugging Workflow

### Når du møter et problem:

1. **Beskriv problemet klart**
   - Hva prøvde du å gjøre?
   - Hva skjedde i stedet?
   - Error message (hvis noen)?

2. **Isoler problemet**
   - Hvilken fil/funksjon?
   - Kan du reprodusere det?
   - Fungerte det før?

3. **Logg her**
   - Kopier error
   - Dokumenter løsningen
   - Legg til tags for søk

---

## 📋 Problem Log

### Template for nye problemer:

```markdown
### [DATO] Problem: [Kort beskrivelse]

**Tags:** #socket #chat #database

**Symptom:**
Hva som skjer/ikke skjer

**Error:**
```
Error message her
```

**Årsak:**
Hvorfor det skjedde

**Løsning:**
Hvordan det ble fikset

**Kode før:**
```javascript
// Gammel kode
```

**Kode etter:**
```javascript
// Ny kode
```

**Lærdom:**
Hva vi lærte av dette
```

---

## 🗂️ Løste Problemer

_Ingen ennå - legg til her etterhvert!_

---

## ⚠️ Kjente Issues (uløste)

_Ingen ennå_

---

## 🔍 Common Issues & Fixes

### Socket.io

#### Problem: CORS error
```javascript
// Feil:
const io = require('socket.io')(server);

// Riktig:
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
```

#### Problem: Socket disconnects randomly
```javascript
// Legg til ping/pong
const io = require('socket.io')(server, {
    pingTimeout: 60000,
    pingInterval: 25000
});
```

---

### SQLite (better-sqlite3)

#### Problem: Database is locked
```javascript
// Bruk WAL mode
db.pragma('journal_mode = WAL');
```

#### Problem: SQLITE_BUSY
```javascript
// Bruk timeout
const db = new Database('app.db', { 
    timeout: 5000 
});
```

---

### CSS/Skins

#### Problem: Skin transition flicker
```css
/* Bruk opacity i stedet for display */
.skin-element {
    transition: opacity 0.3s ease;
}
.skin-hidden {
    opacity: 0;
    pointer-events: none;
}
```

#### Problem: Z-index chaos
```css
/* Definer z-index scale */
:root {
    --z-background: 0;
    --z-content: 10;
    --z-sidebar: 20;
    --z-modal: 100;
    --z-tooltip: 200;
    --z-admin: 300;
}
```

---

### Chromebook-spesifikke

#### Problem: LocalStorage kvote
```javascript
// Sjekk før lagring
function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        console.warn('LocalStorage full');
        return false;
    }
}
```

#### Problem: ES6 modules ikke støttet
```html
<!-- Bruk type="module" -->
<script type="module" src="app.js"></script>
```

---

## 🧪 Debugging Tools

### Browser Console Commands

```javascript
// Sjekk socket status
socket.connected

// Manuelt send melding
socket.emit('chat:send', { message: 'test' });

// Se alle event listeners
socket._callbacks

// Force reconnect
socket.disconnect().connect();
```

### Server Debug Mode

```javascript
// I server/index.js
const DEBUG = process.env.DEBUG === 'true';

if (DEBUG) {
    io.on('connection', (socket) => {
        console.log(`[DEBUG] New connection: ${socket.id}`);
        
        socket.onAny((event, ...args) => {
            console.log(`[DEBUG] Event: ${event}`, args);
        });
    });
}
```

### Database Debug

```javascript
// Logg alle queries
db.function('debug', (sql) => {
    console.log(`[SQL] ${sql}`);
    return sql;
});
```

---

## 📊 Performance Issues

### Slow message delivery
1. Sjekk server logs for bottlenecks
2. Sjekk database query times
3. Sjekk nettverkslatency
4. Vurder message batching

### High memory usage
1. Sjekk for memory leaks i event listeners
2. Begrens chat history i minnet
3. Clear gamle pet interactions

---

## 🆘 Når ingenting fungerer

1. `npm cache clean --force`
2. Slett `node_modules` og `npm install` på nytt
3. Sjekk at Node.js versjon er riktig (v18+)
4. Restart serveren
5. Clear browser cache
6. Test i incognito mode
7. Sjekk at porten ikke er i bruk: `lsof -i :3000`

---

## 📞 Ressurser

- [Socket.io Docs](https://socket.io/docs/v4/)
- [better-sqlite3 Docs](https://github.com/WiseLibs/better-sqlite3)
- [Express Docs](https://expressjs.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
