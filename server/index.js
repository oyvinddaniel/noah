import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

import AppDatabase from './db.js';
import { setupSocketHandlers } from './socket-handlers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const DATABASE_PATH = process.env.DATABASE_PATH || './database/app.db';

// Initialize Express
const app = express();
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Initialize Database
const db = new AppDatabase(DATABASE_PATH);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '..', 'client')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '..', 'client', 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup Socket.io handlers
setupSocketHandlers(io, db);

// Periodic tasks
// Update pet mood based on time
setInterval(() => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    let mood = 'happy';

    // Party mode: Friday after 10:00
    if (day === 5 && hour >= 10) {
        mood = 'party';
        db.updatePet({ party_mode: 1, mood: 'party' });
    } else if (day === 1 && hour < 12) {
        // Grumpy: Monday before 12:00
        mood = 'grumpy';
        db.updatePet({ party_mode: 0, mood: 'grumpy' });
    } else {
        db.updatePet({ party_mode: 0 });
    }

    // Broadcast pet state every minute
    io.emit('pet:state', db.getPetState());
}, 60000);

// Reset daily pet limits at midnight
const resetDailyLimits = () => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        db.updatePet({ feed_count_today: 0, train_count_today: 0 });
    }
};
setInterval(resetDailyLimits, 60000);

// Tamagotchi: Decay hunger/energy over time (every 10 minutes)
setInterval(() => {
    const updatedPet = db.decayNeeds();
    io.emit('pet:state', updatedPet);
}, 600000); // 10 minutes

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down...');
    db.close();
    process.exit(0);
});

// Start server
server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║         🎭 Klasse-App Server 🎭           ║
╠═══════════════════════════════════════════╣
║  Server running on http://localhost:${PORT}  ║
║  Environment: ${process.env.NODE_ENV || 'development'}               ║
╚═══════════════════════════════════════════╝
    `);
});
