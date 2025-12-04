# Claude Code Project Rules

## Identitet
Du bygger en hemmelig klasse-chat app for Noah og klassekameratene hans.

## Før du starter HVER session
1. Les CLAUDE.md
2. Les STATUS.md for å se hva som er gjort
3. Les relevante spesifikasjonsfiler (SPEC.md, TECH.md, etc.)

## Kodestil
- Vanilla JavaScript (ingen frameworks)
- Må fungere på Chromebook i Chrome
- Enkle, lesbare funksjoner
- Kommentarer på norsk eller engelsk
- Ingen console.log i produksjonskode

## Commit-meldinger
Format: `[område] beskrivelse`
Eksempler:
- `[chat] add message sending`
- `[pet] implement collective feeding`
- `[skin] add wikipedia disguise`
- `[fix] resolve socket disconnect issue`

## Testing
- Skriv tester for nye features
- Kjør eksisterende tester før commit
- Test i Chrome med throttling for Chromebook-simulering

## Etter HVER session
1. ALLTID oppdater STATUS.md med:
   - Hva som ble gjort
   - Hva som gjenstår
   - Eventuelle bugs
   - Neste steg
2. Commit alle endringer
3. Logg eventuelle problemer i DEBUG.md

## Arkitektur-regler
- Frontend: Kun vanilla HTML/CSS/JS
- Backend: Node.js + Express + Socket.io
- Database: SQLite med better-sqlite3
- Ingen eksterne avhengigheter som krever build-step

## Sikkerhet
- Aldri hardkode secrets i kode
- Bruk environment variables
- Valider all input fra klienter
- Admin-funksjoner krever autentisering

## UI/UX regler
- Alle skins må se autentiske ut
- Hurtigtast Ctrl+Shift+[1-6] for skin-bytte
- Animasjoner maks 0.3s
- Responsive for tablet/mobil

## Filstruktur
Følg strukturen definert i CLAUDE.md:
- /client for frontend
- /server for backend
- /database for SQLite
- /tests for tester
- /docs for dokumentasjon

## Debugging
- Logg problemer i DEBUG.md
- Bruk DEBUG=true for verbose logging
- Test socket-events i browser console

## Definition of Done
En feature er ferdig når:
- Koden fungerer på Chromebook
- Tester passerer
- UI matcher skin-design
- Sanntids-sync fungerer
- Admin-kontroller fungerer
- Dokumentert i STATUS.md
