import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AppDatabase {
    constructor(dbPath) {
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
        this.initSchema();
    }

    initSchema() {
        const schemaPath = join(__dirname, '..', 'database', 'schema.sql');
        const schema = readFileSync(schemaPath, 'utf8');
        this.db.exec(schema);
    }

    // === USERS ===

    createUser(id, nickname, fingerprint) {
        const stmt = this.db.prepare(`
            INSERT INTO users (id, nickname, fingerprint, last_seen)
            VALUES (?, ?, ?, datetime('now'))
        `);
        return stmt.run(id, nickname, fingerprint);
    }

    getUser(id) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id);
    }

    getUserByFingerprint(fingerprint) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE fingerprint = ?');
        return stmt.get(fingerprint);
    }

    updateNickname(id, nickname) {
        const stmt = this.db.prepare('UPDATE users SET nickname = ? WHERE id = ?');
        return stmt.run(nickname, id);
    }

    updateLastSeen(id) {
        const stmt = this.db.prepare(`UPDATE users SET last_seen = datetime('now') WHERE id = ?`);
        return stmt.run(id);
    }

    setAdmin(id, isAdmin) {
        const stmt = this.db.prepare('UPDATE users SET is_admin = ? WHERE id = ?');
        return stmt.run(isAdmin ? 1 : 0, id);
    }

    setBanned(id, isBanned) {
        const stmt = this.db.prepare('UPDATE users SET is_banned = ? WHERE id = ?');
        return stmt.run(isBanned ? 1 : 0, id);
    }

    getOnlineUsers(minutesAgo = 2) {
        const stmt = this.db.prepare(`
            SELECT id, nickname, last_seen,
                CASE
                    WHEN last_seen > datetime('now', '-2 minutes') THEN 'online'
                    WHEN last_seen > datetime('now', '-10 minutes') THEN 'idle'
                    ELSE 'offline'
                END as status
            FROM users
            WHERE is_banned = 0
            ORDER BY last_seen DESC
        `);
        return stmt.all();
    }

    getAllUsersWithRealNames() {
        const stmt = this.db.prepare('SELECT id, nickname, real_name FROM users WHERE is_banned = 0');
        return stmt.all();
    }

    // === MESSAGES ===

    addMessage(userId, content) {
        const stmt = this.db.prepare(`
            INSERT INTO messages (user_id, content)
            VALUES (?, ?)
        `);
        return stmt.run(userId, content);
    }

    getRecentMessages(limit = 100) {
        const stmt = this.db.prepare(`
            SELECT m.id, m.content, m.created_at, u.nickname
            FROM messages m
            JOIN users u ON m.user_id = u.id
            ORDER BY m.created_at DESC
            LIMIT ?
        `);
        return stmt.all(limit).reverse();
    }

    clearMessages() {
        const stmt = this.db.prepare('DELETE FROM messages');
        return stmt.run();
    }

    deleteMessage(id) {
        const stmt = this.db.prepare('DELETE FROM messages WHERE id = ?');
        return stmt.run(id);
    }

    // === POLLS ===

    createPoll(id, question, options, pollType) {
        const stmt = this.db.prepare(`
            INSERT INTO polls (id, question, options, poll_type)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(id, question, JSON.stringify(options), pollType);
    }

    getPoll(id) {
        const stmt = this.db.prepare('SELECT * FROM polls WHERE id = ?');
        const poll = stmt.get(id);
        if (poll) {
            poll.options = JSON.parse(poll.options);
        }
        return poll;
    }

    getActivePolls() {
        const stmt = this.db.prepare('SELECT * FROM polls WHERE is_active = 1 ORDER BY created_at DESC');
        return stmt.all().map(poll => ({
            ...poll,
            options: JSON.parse(poll.options)
        }));
    }

    votePoll(pollId, userId, optionIndex) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO poll_votes (poll_id, user_id, option_index)
            VALUES (?, ?, ?)
        `);
        return stmt.run(pollId, userId, optionIndex);
    }

    getPollResults(pollId) {
        const stmt = this.db.prepare(`
            SELECT option_index, COUNT(*) as count
            FROM poll_votes
            WHERE poll_id = ?
            GROUP BY option_index
        `);
        return stmt.all(pollId);
    }

    closePoll(id) {
        const stmt = this.db.prepare('UPDATE polls SET is_active = 0 WHERE id = ?');
        return stmt.run(id);
    }

    // === PET ===

    getPetState() {
        const stmt = this.db.prepare('SELECT * FROM pet WHERE id = 1');
        return stmt.get();
    }

    updatePet(updates) {
        const keys = Object.keys(updates);
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const stmt = this.db.prepare(`UPDATE pet SET ${setClause} WHERE id = 1`);
        return stmt.run(...Object.values(updates));
    }

    addPetXP(amount) {
        const pet = this.getPetState();
        let newXP = pet.xp + amount;
        let newLevel = pet.level;
        let xpToNext = pet.xp_to_next;

        while (newXP >= xpToNext) {
            newXP -= xpToNext;
            newLevel++;
            xpToNext = this.calculateXPForLevel(newLevel);
        }

        this.updatePet({ xp: newXP, level: newLevel, xp_to_next: xpToNext });
        return { level: newLevel, xp: newXP, xp_to_next: xpToNext };
    }

    calculateXPForLevel(level) {
        if (level <= 1) return 100;
        if (level === 2) return 100;
        if (level === 3) return 150;
        if (level === 4) return 200;
        if (level === 5) return 300;
        if (level === 6) return 400;
        if (level === 7) return 500;
        if (level === 8) return 650;
        if (level === 9) return 800;
        if (level === 10) return 1000;
        return 1000 + (level - 10) * 200;
    }

    logPetInteraction(userId, type) {
        const stmt = this.db.prepare(`
            INSERT INTO pet_interactions (user_id, interaction_type)
            VALUES (?, ?)
        `);
        return stmt.run(userId, type);
    }

    getRecentPetInteractions(type, windowMs) {
        const stmt = this.db.prepare(`
            SELECT * FROM pet_interactions
            WHERE interaction_type = ?
            AND created_at > datetime('now', '-' || ? || ' seconds')
        `);
        return stmt.all(type, Math.floor(windowMs / 1000));
    }

    // === TAMAGOTCHI EVOLUTION SYSTEM ===

    static STAGE_REQUIREMENTS = [
        { stage: 1, name: 'egg',      feeds: 0,   trains: 0   },
        { stage: 2, name: 'baby',     feeds: 10,  trains: 0   },
        { stage: 3, name: 'barn',     feeds: 30,  trains: 10  },
        { stage: 4, name: 'tenåring', feeds: 70,  trains: 35  },
        { stage: 5, name: 'voksen',   feeds: 140, trains: 85  },
        { stage: 6, name: 'gammel',   feeds: 260, trains: 170 },
        { stage: 7, name: 'død',      feeds: 400, trains: 290 }
    ];

    static CHARACTERS = [
        'goblin', 'mini-pekka', 'knight',
        'hog-rider', 'mega-knight', 'boss-bandit'
    ];

    static STAGE_EMOJIS = {
        'egg': '🥚',
        'baby': '👶',
        'barn': '🧒',
        'tenåring': '🧑',
        'voksen': '💪',
        'gammel': '👴',
        'død': '☠️'
    };

    getNextStageRequirements(currentStage) {
        if (currentStage >= 7) return null;
        return AppDatabase.STAGE_REQUIREMENTS[currentStage];
    }

    checkEvolution() {
        const pet = this.getPetState();
        const nextReq = this.getNextStageRequirements(pet.stage);

        if (!nextReq) return { evolved: false, pet };

        if (pet.total_feeds >= nextReq.feeds && pet.total_trains >= nextReq.trains) {
            if (pet.stage === 6) {
                // Going to death stage
                return this.evolveToDeath();
            } else {
                return this.evolveToNextStage();
            }
        }

        return { evolved: false, pet };
    }

    evolveToNextStage() {
        const pet = this.getPetState();
        const newStage = pet.stage + 1;
        const stageName = AppDatabase.STAGE_REQUIREMENTS[newStage - 1].name;

        this.updatePet({
            stage: newStage,
            stage_name: stageName
        });

        return {
            evolved: true,
            type: 'stage',
            pet: this.getPetState(),
            message: `🎉 Peten vokste til ${stageName}!`
        };
    }

    evolveToDeath() {
        const pet = this.getPetState();
        const isLastCharacter = pet.character_index === 5;

        if (isLastCharacter) {
            // Ultimate Victory - Boss Bandit died!
            return this.triggerUltimateVictory();
        } else {
            // Reincarnate to next character
            return this.reincarnate();
        }
    }

    reincarnate() {
        const pet = this.getPetState();
        const newCharacterIndex = pet.character_index + 1;
        const newCharacter = AppDatabase.CHARACTERS[newCharacterIndex];

        this.updatePet({
            stage: 1,
            stage_name: 'egg',
            character_index: newCharacterIndex,
            skin: newCharacter,
            total_feeds: 0,
            total_trains: 0,
            hunger: 100,
            energy: 100,
            mood: 'happy'
        });

        return {
            evolved: true,
            type: 'reincarnation',
            pet: this.getPetState(),
            message: `✨ Peten reinkarnerte som ${newCharacter}! 🥚`
        };
    }

    triggerUltimateVictory() {
        const pet = this.getPetState();
        const newPrestige = (pet.prestige || 0) + 1;

        this.updatePet({
            stage: 1,
            stage_name: 'egg',
            character_index: 0,
            skin: 'goblin',
            total_feeds: 0,
            total_trains: 0,
            hunger: 100,
            energy: 100,
            mood: 'happy',
            prestige: newPrestige
        });

        return {
            evolved: true,
            type: 'ultimate-victory',
            pet: this.getPetState(),
            prestige: newPrestige,
            message: '🎆 LEGENDARY! Klassen fullførte alle evolusjoner! 🎆'
        };
    }

    // Decay needs over time
    decayNeeds() {
        const pet = this.getPetState();
        const now = new Date();
        const lastDecay = pet.last_decay ? new Date(pet.last_decay) : now;
        const hoursSinceDecay = (now - lastDecay) / (1000 * 60 * 60);

        if (hoursSinceDecay < 1) return pet; // Decay hourly

        const hungerDecay = Math.floor(hoursSinceDecay * 5);
        const energyDecay = Math.floor(hoursSinceDecay * 3);

        const newHunger = Math.max(0, pet.hunger - hungerDecay);
        const newEnergy = Math.max(0, pet.energy - energyDecay);

        // Update mood based on needs
        let newMood = pet.mood;
        if (newHunger < 30 || newEnergy < 30) {
            newMood = 'sleepy';
        } else if (newHunger < 50 || newEnergy < 50) {
            newMood = 'grumpy';
        }

        this.updatePet({
            hunger: newHunger,
            energy: newEnergy,
            mood: newMood,
            last_decay: now.toISOString()
        });

        return this.getPetState();
    }

    feedPet() {
        const pet = this.getPetState();
        const newHunger = Math.min(100, pet.hunger + 20);
        const newTotalFeeds = (pet.total_feeds || 0) + 1;

        this.updatePet({
            hunger: newHunger,
            total_feeds: newTotalFeeds,
            last_fed: new Date().toISOString()
        });

        return this.checkEvolution();
    }

    trainPet() {
        const pet = this.getPetState();
        const newEnergy = Math.min(100, pet.energy + 15);
        const newTotalTrains = (pet.total_trains || 0) + 1;

        this.updatePet({
            energy: newEnergy,
            total_trains: newTotalTrains,
            last_trained: new Date().toISOString()
        });

        return this.checkEvolution();
    }

    getEvolutionProgress() {
        const pet = this.getPetState();
        const nextReq = this.getNextStageRequirements(pet.stage);

        if (!nextReq) {
            return {
                currentStage: pet.stage_name,
                character: AppDatabase.CHARACTERS[pet.character_index],
                feedsNeeded: 0,
                trainsNeeded: 0,
                feedsProgress: pet.total_feeds,
                trainsProgress: pet.total_trains,
                isMaxStage: true
            };
        }

        return {
            currentStage: pet.stage_name,
            character: AppDatabase.CHARACTERS[pet.character_index],
            feedsNeeded: nextReq.feeds,
            trainsNeeded: nextReq.trains,
            feedsProgress: pet.total_feeds,
            trainsProgress: pet.total_trains,
            isMaxStage: false
        };
    }

    // === COUNTDOWNS ===

    createCountdown(id, label, targetTime) {
        const stmt = this.db.prepare(`
            INSERT INTO countdowns (id, label, target_time)
            VALUES (?, ?, ?)
        `);
        return stmt.run(id, label, targetTime);
    }

    getActiveCountdowns() {
        const stmt = this.db.prepare(`
            SELECT * FROM countdowns
            WHERE is_active = 1 AND target_time > datetime('now')
            ORDER BY target_time ASC
        `);
        return stmt.all();
    }

    // === PREDICTIONS ===

    createPrediction(id, question, options) {
        const stmt = this.db.prepare(`
            INSERT INTO predictions (id, question, options)
            VALUES (?, ?, ?)
        `);
        return stmt.run(id, question, JSON.stringify(options));
    }

    getPrediction(id) {
        const stmt = this.db.prepare('SELECT * FROM predictions WHERE id = ?');
        const prediction = stmt.get(id);
        if (prediction) {
            prediction.options = JSON.parse(prediction.options);
        }
        return prediction;
    }

    getActivePredictions() {
        const stmt = this.db.prepare('SELECT * FROM predictions WHERE is_resolved = 0 ORDER BY created_at DESC');
        return stmt.all().map(p => ({
            ...p,
            options: JSON.parse(p.options)
        }));
    }

    getResolvedPredictions(limit = 10) {
        const stmt = this.db.prepare('SELECT * FROM predictions WHERE is_resolved = 1 ORDER BY created_at DESC LIMIT ?');
        return stmt.all(limit).map(p => ({
            ...p,
            options: JSON.parse(p.options)
        }));
    }

    votePrediction(predictionId, userId, optionIndex) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO prediction_votes (prediction_id, user_id, option_index)
            VALUES (?, ?, ?)
        `);
        return stmt.run(predictionId, userId, optionIndex);
    }

    getUserPredictionVote(predictionId, userId) {
        const stmt = this.db.prepare('SELECT option_index FROM prediction_votes WHERE prediction_id = ? AND user_id = ?');
        const result = stmt.get(predictionId, userId);
        return result ? result.option_index : null;
    }

    getPredictionResults(predictionId) {
        const stmt = this.db.prepare(`
            SELECT option_index, COUNT(*) as count
            FROM prediction_votes
            WHERE prediction_id = ?
            GROUP BY option_index
        `);
        return stmt.all(predictionId);
    }

    resolvePrediction(predictionId, correctOption) {
        // Mark prediction as resolved
        const updateStmt = this.db.prepare(`
            UPDATE predictions SET is_resolved = 1, correct_option = ?
            WHERE id = ?
        `);
        updateStmt.run(correctOption, predictionId);

        // Get all votes for this prediction
        const votesStmt = this.db.prepare('SELECT user_id, option_index FROM prediction_votes WHERE prediction_id = ?');
        const votes = votesStmt.all(predictionId);

        // Update leaderboard for each user
        const winners = [];
        votes.forEach(vote => {
            // Initialize user in leaderboard if not exists
            this.db.prepare(`
                INSERT OR IGNORE INTO leaderboard (user_id, correct_predictions, total_predictions)
                VALUES (?, 0, 0)
            `).run(vote.user_id);

            // Increment total predictions
            this.db.prepare(`
                UPDATE leaderboard SET total_predictions = total_predictions + 1
                WHERE user_id = ?
            `).run(vote.user_id);

            // If correct, increment correct predictions
            if (vote.option_index === correctOption) {
                this.db.prepare(`
                    UPDATE leaderboard SET correct_predictions = correct_predictions + 1
                    WHERE user_id = ?
                `).run(vote.user_id);

                const user = this.getUser(vote.user_id);
                if (user) {
                    winners.push(user.nickname);
                }
            }
        });

        return { winners, totalVotes: votes.length };
    }

    getLeaderboard(limit = 10) {
        const stmt = this.db.prepare(`
            SELECT l.user_id, l.correct_predictions, l.total_predictions, u.nickname
            FROM leaderboard l
            JOIN users u ON l.user_id = u.id
            ORDER BY l.correct_predictions DESC, l.total_predictions ASC
            LIMIT ?
        `);
        return stmt.all(limit);
    }

    getUserStats(userId) {
        const stmt = this.db.prepare('SELECT * FROM leaderboard WHERE user_id = ?');
        return stmt.get(userId) || { correct_predictions: 0, total_predictions: 0 };
    }

    // === ACHIEVEMENTS ===

    // Achievement definitions
    static ACHIEVEMENTS = {
        'first-feed': { name: 'First Feed', badge: '🍖', description: 'Mat peten første gang' },
        'first-train': { name: 'First Train', badge: '🏋️', description: 'Tren peten første gang' },
        'collective-participant': { name: 'Collective Participant', badge: '🤝', description: 'Delta i collective feed' },
        'dedicated-trainer': { name: 'Dedicated Trainer', badge: '💪', description: '50 treninger totalt' },
        'pet-whisperer': { name: 'Pet Whisperer', badge: '🐾', description: '100 matinger totalt' },
        'party-animal': { name: 'Party Animal', badge: '🎉', description: 'Interager under party mode' },
        'early-bird': { name: 'Early Bird', badge: '🌅', description: 'Mat peten før kl 08:00' },
        'night-owl': { name: 'Night Owl', badge: '🦉', description: 'Mat peten etter kl 22:00' },
        'collective-master': { name: 'Collective Master', badge: '⭐', description: 'Trigger 10 collectives' }
    };

    ensureUserStats(userId) {
        const stmt = this.db.prepare(`
            INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)
        `);
        stmt.run(userId);
    }

    getUserPetStats(userId) {
        this.ensureUserStats(userId);
        const stmt = this.db.prepare('SELECT * FROM user_stats WHERE user_id = ?');
        return stmt.get(userId);
    }

    incrementUserFeed(userId) {
        this.ensureUserStats(userId);
        const stmt = this.db.prepare(`
            UPDATE user_stats SET total_feeds = total_feeds + 1 WHERE user_id = ?
        `);
        stmt.run(userId);
        return this.getUserPetStats(userId);
    }

    incrementUserTrain(userId) {
        this.ensureUserStats(userId);
        const stmt = this.db.prepare(`
            UPDATE user_stats SET total_trains = total_trains + 1 WHERE user_id = ?
        `);
        stmt.run(userId);
        return this.getUserPetStats(userId);
    }

    incrementUserCollective(userId) {
        this.ensureUserStats(userId);
        const stmt = this.db.prepare(`
            UPDATE user_stats SET collective_count = collective_count + 1 WHERE user_id = ?
        `);
        stmt.run(userId);
        return this.getUserPetStats(userId);
    }

    grantAchievement(userId, achievementId) {
        try {
            const stmt = this.db.prepare(`
                INSERT INTO achievements (user_id, achievement_id)
                VALUES (?, ?)
            `);
            stmt.run(userId, achievementId);
            return true; // New achievement granted
        } catch (e) {
            // Already has this achievement (UNIQUE constraint)
            return false;
        }
    }

    hasAchievement(userId, achievementId) {
        const stmt = this.db.prepare(`
            SELECT 1 FROM achievements WHERE user_id = ? AND achievement_id = ?
        `);
        return !!stmt.get(userId, achievementId);
    }

    getUserAchievements(userId) {
        const stmt = this.db.prepare(`
            SELECT achievement_id, achieved_at FROM achievements WHERE user_id = ?
            ORDER BY achieved_at DESC
        `);
        return stmt.all(userId);
    }

    checkAndGrantAchievements(userId, context = {}) {
        const newAchievements = [];
        const stats = this.getUserPetStats(userId);
        const pet = this.getPetState();
        const hour = new Date().getHours();

        // First Feed
        if (context.type === 'feed' && stats.total_feeds === 1) {
            if (this.grantAchievement(userId, 'first-feed')) {
                newAchievements.push('first-feed');
            }
        }

        // First Train
        if (context.type === 'train' && stats.total_trains === 1) {
            if (this.grantAchievement(userId, 'first-train')) {
                newAchievements.push('first-train');
            }
        }

        // Collective Participant
        if (context.type === 'collective') {
            if (this.grantAchievement(userId, 'collective-participant')) {
                newAchievements.push('collective-participant');
            }
        }

        // Dedicated Trainer (50 trains)
        if (stats.total_trains >= 50) {
            if (this.grantAchievement(userId, 'dedicated-trainer')) {
                newAchievements.push('dedicated-trainer');
            }
        }

        // Pet Whisperer (100 feeds)
        if (stats.total_feeds >= 100) {
            if (this.grantAchievement(userId, 'pet-whisperer')) {
                newAchievements.push('pet-whisperer');
            }
        }

        // Party Animal
        if (pet.party_mode && (context.type === 'feed' || context.type === 'train')) {
            if (this.grantAchievement(userId, 'party-animal')) {
                newAchievements.push('party-animal');
            }
        }

        // Early Bird (before 8:00)
        if (context.type === 'feed' && hour < 8) {
            if (this.grantAchievement(userId, 'early-bird')) {
                newAchievements.push('early-bird');
            }
        }

        // Night Owl (after 22:00)
        if (context.type === 'feed' && hour >= 22) {
            if (this.grantAchievement(userId, 'night-owl')) {
                newAchievements.push('night-owl');
            }
        }

        // Collective Master (10 collectives)
        if (stats.collective_count >= 10) {
            if (this.grantAchievement(userId, 'collective-master')) {
                newAchievements.push('collective-master');
            }
        }

        return newAchievements;
    }

    close() {
        this.db.close();
    }
}

export default AppDatabase;
