-- Klasse-App Database Schema

-- Brukere
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    nickname TEXT NOT NULL,
    real_name TEXT,
    fingerprint TEXT UNIQUE,
    is_admin INTEGER DEFAULT 0,
    is_banned INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME
);

-- Chat-meldinger
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Polls
CREATE TABLE IF NOT EXISTS polls (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    poll_type TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Poll-stemmer
CREATE TABLE IF NOT EXISTS poll_votes (
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
CREATE TABLE IF NOT EXISTS predictions (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_option INTEGER,
    is_resolved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Prediction-stemmer
CREATE TABLE IF NOT EXISTS prediction_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prediction_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    option_index INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prediction_id) REFERENCES predictions(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(prediction_id, user_id)
);

-- Pet state (singleton) - Tamagotchi Evolution System
CREATE TABLE IF NOT EXISTS pet (
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
    total_collectives INTEGER DEFAULT 0,
    -- Tamagotchi Evolution System
    stage INTEGER DEFAULT 1,
    stage_name TEXT DEFAULT 'egg',
    character_index INTEGER DEFAULT 0,
    total_feeds INTEGER DEFAULT 0,
    total_trains INTEGER DEFAULT 0,
    hunger INTEGER DEFAULT 100,
    energy INTEGER DEFAULT 100,
    last_decay DATETIME,
    prestige INTEGER DEFAULT 0
);

-- Pet interactions log
CREATE TABLE IF NOT EXISTS pet_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    interaction_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Leaderboard
CREATE TABLE IF NOT EXISTS leaderboard (
    user_id TEXT PRIMARY KEY,
    correct_predictions INTEGER DEFAULT 0,
    total_predictions INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Countdowns
CREATE TABLE IF NOT EXISTS countdowns (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    target_time DATETIME NOT NULL,
    is_active INTEGER DEFAULT 1
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, achievement_id)
);

-- User stats for achievement tracking
CREATE TABLE IF NOT EXISTS user_stats (
    user_id TEXT PRIMARY KEY,
    total_feeds INTEGER DEFAULT 0,
    total_trains INTEGER DEFAULT 0,
    collective_count INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_pet_interactions_created ON pet_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);

-- Insert default pet
INSERT OR IGNORE INTO pet (id) VALUES (1);
