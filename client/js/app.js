// Main App Entry Point

// Generate simple fingerprint
function generateFingerprint() {
    const stored = localStorage.getItem('klasse-fingerprint');
    if (stored) return stored;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);

    const fingerprint = btoa(
        navigator.userAgent +
        screen.width + screen.height +
        new Date().getTimezoneOffset() +
        canvas.toDataURL()
    ).substring(0, 32);

    localStorage.setItem('klasse-fingerprint', fingerprint);
    return fingerprint;
}

// State
const state = {
    user: null,
    socket: null,
    currentSkin: localStorage.getItem('klasse-skin') || 'google-docs',
    isAdmin: false
};

// DOM Elements
const elements = {
    nicknameModal: document.getElementById('nickname-modal'),
    nicknameInput: document.getElementById('nickname-input'),
    adminCheckbox: document.getElementById('admin-checkbox'),
    adminCode: document.getElementById('admin-code'),
    joinBtn: document.getElementById('join-btn'),
    app: document.getElementById('app'),
    skinSelector: document.getElementById('skin-selector'),
    userCount: document.getElementById('user-count'),
    buddiesList: document.getElementById('buddies-list'),
    countdownDisplay: document.getElementById('countdown-display'),
    petSprite: document.getElementById('pet-sprite'),
    petMood: document.getElementById('pet-mood'),
    petLevel: document.getElementById('pet-level'),
    petXpFill: document.getElementById('pet-xp-fill'),
    petStrength: document.getElementById('pet-strength'),
    feedBtn: document.getElementById('feed-btn'),
    trainBtn: document.getElementById('train-btn'),
    pollsContainer: document.getElementById('polls-container'),
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    sendBtn: document.getElementById('send-btn'),
    adminPanel: document.getElementById('admin-panel'),
    adminMinimize: document.getElementById('admin-minimize'),
    adminClearChat: document.getElementById('admin-clear-chat'),
    adminCreatePoll: document.getElementById('admin-create-poll'),
    adminChangePet: document.getElementById('admin-change-pet'),
    adminResetPet: document.getElementById('admin-reset-pet'),
    // Tamagotchi elements
    petStage: document.getElementById('pet-stage'),
    petCharacter: document.getElementById('pet-character'),
    petPrestige: document.getElementById('pet-prestige'),
    hungerFill: document.getElementById('hunger-fill'),
    hungerValue: document.getElementById('hunger-value'),
    energyFill: document.getElementById('energy-fill'),
    energyValue: document.getElementById('energy-value'),
    feedsProgress: document.getElementById('feeds-progress'),
    feedsCount: document.getElementById('feeds-count'),
    trainsProgress: document.getElementById('trains-progress'),
    trainsCount: document.getElementById('trains-count'),
    fireworksOverlay: document.getElementById('fireworks-overlay'),
    // Sidebar
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebar-toggle'),
    sidebarContent: document.getElementById('sidebar-content'),
    // Mobile sidebar
    mobileSidebarToggle: document.getElementById('mobile-sidebar-toggle'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop'),
    // Predictions
    predictionsContainer: document.getElementById('predictions-container'),
    leaderboardList: document.getElementById('leaderboard-list'),
    adminCreatePrediction: document.getElementById('admin-create-prediction'),
    adminPredictionsList: document.getElementById('admin-predictions-list'),
    // Achievements
    achievementsContainer: document.getElementById('achievements-container')
};

// Achievement definitions (mirror of server)
const ACHIEVEMENTS = {
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

// Tamagotchi constants
const STAGE_EMOJIS = {
    'egg': '🥚',
    'baby': '👶',
    'barn': '🧒',
    'tenåring': '🧑',
    'voksen': '💪',
    'gammel': '👴',
    'død': '☠️'
};

const STAGE_REQUIREMENTS = [
    { stage: 1, name: 'egg',      feeds: 0,   trains: 0   },
    { stage: 2, name: 'baby',     feeds: 10,  trains: 0   },
    { stage: 3, name: 'barn',     feeds: 30,  trains: 10  },
    { stage: 4, name: 'tenåring', feeds: 70,  trains: 35  },
    { stage: 5, name: 'voksen',   feeds: 140, trains: 85  },
    { stage: 6, name: 'gammel',   feeds: 260, trains: 170 },
    { stage: 7, name: 'død',      feeds: 400, trains: 290 }
];

const CHARACTER_NAMES = {
    'goblin': 'Goblin',
    'mini-pekka': 'Mini P.E.K.K.A',
    'knight': 'Knight',
    'hog-rider': 'Hog Rider',
    'mega-knight': 'Mega Knight',
    'boss-bandit': 'Boss Bandit'
};

// Initialize Socket
function initSocket() {
    state.socket = io();

    // Connection events
    state.socket.on('connect', () => {
        console.log('Connected to server');
    });

    state.socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });

    // User events
    state.socket.on('user:welcome', (data) => {
        state.user = data.user;
        state.isAdmin = data.user.isAdmin;

        elements.nicknameModal.classList.add('hidden');
        elements.app.classList.remove('hidden');

        if (state.isAdmin) {
            elements.adminPanel.classList.remove('hidden');
        }

        // Start heartbeat
        setInterval(() => {
            state.socket.emit('user:heartbeat');
        }, 30000);
    });

    state.socket.on('user:kicked', () => {
        alert('Du har blitt kicket!');
        location.reload();
    });

    state.socket.on('user:banned', () => {
        alert('Du har blitt utestengt!');
        localStorage.clear();
        location.reload();
    });

    // Chat events
    state.socket.on('chat:history', (data) => {
        elements.chatMessages.innerHTML = '';
        data.messages.forEach(addChatMessage);
    });

    state.socket.on('chat:new', (data) => {
        addChatMessage(data);
    });

    state.socket.on('chat:cleared', () => {
        elements.chatMessages.innerHTML = '';
        addChatMessage({
            nickname: '🔧 SYSTEM',
            content: 'Chat ble tømt av admin',
            created_at: new Date().toISOString(),
            isSystem: true
        });
    });

    // Buddies events
    state.socket.on('buddies:update', (data) => {
        updateBuddies(data.users);
    });

    // Pet events
    state.socket.on('pet:state', (data) => {
        updatePet(data);
    });

    state.socket.on('pet:collective', (data) => {
        // Show collective animation
        elements.petSprite.classList.add('collective');
        setTimeout(() => {
            elements.petSprite.classList.remove('collective');
        }, 3000);
    });

    state.socket.on('pet:limit', (data) => {
        alert(data.message);
    });

    // Tamagotchi evolution events
    state.socket.on('pet:evolution', (data) => {
        showEvolutionAnimation(data.message, data.newStage);
    });

    state.socket.on('pet:reincarnation', (data) => {
        showReincarnationAnimation(data.message, data.newCharacter);
    });

    state.socket.on('pet:ultimate-victory', (data) => {
        showUltimateVictory(data.message, data.prestige);
    });

    // Poll events
    state.socket.on('polls:list', (data) => {
        elements.pollsContainer.innerHTML = '';
        data.polls.forEach(addPoll);
    });

    state.socket.on('poll:new', (data) => {
        addPoll(data.poll);
    });

    state.socket.on('poll:update', (data) => {
        updatePollResults(data.pollId, data.results);
    });

    state.socket.on('poll:closed', (data) => {
        const pollEl = document.querySelector(`[data-poll-id="${data.pollId}"]`);
        if (pollEl) {
            pollEl.classList.add('closed');
        }
    });

    // Countdown events
    state.socket.on('countdowns:list', (data) => {
        if (data.countdowns.length > 0) {
            startCountdown(data.countdowns[0]);
        }
    });

    // Prediction events
    state.socket.on('predictions:list', (data) => {
        elements.predictionsContainer.innerHTML = '';
        data.predictions.forEach(addPrediction);
    });

    state.socket.on('prediction:new', (data) => {
        addPrediction(data.prediction);
    });

    state.socket.on('prediction:update', (data) => {
        updatePredictionResults(data.predictionId, data.results);
    });

    state.socket.on('prediction:resolved', (data) => {
        showPredictionResolved(data);
    });

    state.socket.on('prediction:leaderboard', (data) => {
        updateLeaderboard(data.leaderboard);
    });

    // Achievement events
    state.socket.on('achievement:new', (data) => {
        data.achievements.forEach(achievement => {
            showAchievementUnlocked(achievement);
            addAchievementToDisplay(achievement);
        });
    });

    state.socket.on('achievements:list', (data) => {
        updateAchievementsDisplay(data.achievements);
    });
}

// Chat functions
function addChatMessage(msg) {
    const div = document.createElement('div');
    div.className = 'chat-message' + (msg.isSystem ? ' system' : '');
    div.innerHTML = `
        <div class="chat-nickname">${escapeHtml(msg.nickname)}</div>
        <div class="chat-content">${escapeHtml(msg.content)}</div>
        <div class="chat-time">${formatTime(msg.created_at)}</div>
    `;
    elements.chatMessages.appendChild(div);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function sendMessage() {
    const message = elements.chatInput.value.trim();
    if (!message) return;

    state.socket.emit('chat:send', { message });
    elements.chatInput.value = '';
}

// Buddies functions
function updateBuddies(users) {
    const online = users.filter(u => u.status === 'online');
    const idle = users.filter(u => u.status === 'idle');

    elements.userCount.textContent = `${online.length} online`;

    elements.buddiesList.innerHTML = '';

    online.forEach(user => {
        const li = document.createElement('li');
        li.innerHTML = `<span>🟢</span> ${escapeHtml(user.nickname)}`;
        elements.buddiesList.appendChild(li);
    });

    idle.forEach(user => {
        const li = document.createElement('li');
        li.innerHTML = `<span>🟡</span> ${escapeHtml(user.nickname)} <small>(idle)</small>`;
        elements.buddiesList.appendChild(li);
    });
}

// Pet functions
const moodEmojis = {
    happy: '😊',
    sleepy: '😴',
    hyped: '🤩',
    grumpy: '😤',
    party: '🎉'
};

function updatePet(pet) {
    // Basic stats
    elements.petMood.textContent = `${moodEmojis[pet.mood] || '😊'} ${pet.mood.charAt(0).toUpperCase() + pet.mood.slice(1)}`;
    elements.petLevel.textContent = `Level ${pet.level}`;
    elements.petStrength.textContent = `💪 ${pet.strength}`;

    const xpPercent = (pet.xp / pet.xp_to_next) * 100;
    elements.petXpFill.style.width = `${xpPercent}%`;

    // Update sprite class with character and stage
    elements.petSprite.className = `pet-${pet.skin} pet-stage-${pet.stage_name}`;

    if (pet.party_mode) {
        elements.petSprite.classList.add('party-mode');
    }

    // Tamagotchi: Stage and Character display
    const stageEmoji = STAGE_EMOJIS[pet.stage_name] || '🥚';
    const stageName = pet.stage_name.charAt(0).toUpperCase() + pet.stage_name.slice(1);
    elements.petStage.textContent = `${stageEmoji} ${stageName}`;

    const characterName = CHARACTER_NAMES[pet.skin] || pet.skin;
    elements.petCharacter.textContent = characterName;

    // Prestige display
    if (pet.prestige > 0) {
        elements.petPrestige.textContent = `⭐ ${pet.prestige}`;
        elements.petPrestige.classList.remove('hidden');
    } else {
        elements.petPrestige.classList.add('hidden');
    }

    // Tamagotchi: Hunger and Energy bars
    const hunger = pet.hunger ?? 100;
    const energy = pet.energy ?? 100;

    elements.hungerFill.style.width = `${hunger}%`;
    elements.hungerValue.textContent = `${hunger}%`;
    elements.hungerFill.className = `need-bar-fill ${hunger < 30 ? 'low' : hunger < 60 ? 'medium' : ''}`;

    elements.energyFill.style.width = `${energy}%`;
    elements.energyValue.textContent = `${energy}%`;
    elements.energyFill.className = `need-bar-fill ${energy < 30 ? 'low' : energy < 60 ? 'medium' : ''}`;

    // Tamagotchi: Evolution progress
    const totalFeeds = pet.total_feeds || 0;
    const totalTrains = pet.total_trains || 0;

    // Get next stage requirements
    const nextReq = STAGE_REQUIREMENTS[pet.stage];
    if (nextReq) {
        const feedsNeeded = nextReq.feeds;
        const trainsNeeded = nextReq.trains;

        const feedsPercent = feedsNeeded > 0 ? Math.min(100, (totalFeeds / feedsNeeded) * 100) : 100;
        const trainsPercent = trainsNeeded > 0 ? Math.min(100, (totalTrains / trainsNeeded) * 100) : 100;

        elements.feedsProgress.style.width = `${feedsPercent}%`;
        elements.feedsCount.textContent = `${totalFeeds}/${feedsNeeded}`;

        elements.trainsProgress.style.width = `${trainsPercent}%`;
        elements.trainsCount.textContent = `${totalTrains}/${trainsNeeded}`;
    } else {
        // Max stage reached
        elements.feedsProgress.style.width = '100%';
        elements.feedsCount.textContent = `${totalFeeds}/MAX`;
        elements.trainsProgress.style.width = '100%';
        elements.trainsCount.textContent = `${totalTrains}/MAX`;
    }
}

// Evolution animation functions
function showEvolutionAnimation(message, newStage) {
    // Flash the pet sprite
    elements.petSprite.classList.add('evolving');

    // Show notification
    showNotification(message, 'evolution');

    setTimeout(() => {
        elements.petSprite.classList.remove('evolving');
    }, 3000);
}

function showReincarnationAnimation(message, newCharacter) {
    // Death then rebirth animation
    elements.petSprite.classList.add('dying');

    setTimeout(() => {
        elements.petSprite.classList.remove('dying');
        elements.petSprite.classList.add('reborn');
        showNotification(message, 'reincarnation');

        setTimeout(() => {
            elements.petSprite.classList.remove('reborn');
        }, 2000);
    }, 1500);
}

function showUltimateVictory(message, prestige) {
    // Show fireworks overlay
    elements.fireworksOverlay.classList.remove('hidden');
    elements.fireworksOverlay.querySelector('p').textContent = message;

    // Create firework particles
    createFireworks();

    // Hide after celebration
    setTimeout(() => {
        elements.fireworksOverlay.classList.add('hidden');
    }, 10000);
}

function createFireworks() {
    const container = document.getElementById('fireworks-animation');
    container.innerHTML = '';

    // Create multiple firework bursts
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = Math.random() * 100 + '%';
            firework.style.top = Math.random() * 100 + '%';
            firework.style.animationDelay = Math.random() * 0.5 + 's';

            // Random color
            const colors = ['#ff0', '#f0f', '#0ff', '#f00', '#0f0', '#00f', '#ff6600'];
            firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            container.appendChild(firework);

            // Remove after animation
            setTimeout(() => {
                firework.remove();
            }, 2000);
        }, i * 400);
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `pet-notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Poll functions
function addPoll(poll) {
    const div = document.createElement('div');
    div.className = 'poll';
    div.dataset.pollId = poll.id;

    let optionsHtml = '';
    poll.options.forEach((opt, i) => {
        const count = poll.results?.find(r => r.option_index === i)?.count || 0;
        optionsHtml += `
            <div class="poll-option" data-option="${i}">
                <div class="poll-option-bar">
                    <div class="poll-option-fill" style="width: 0%"></div>
                    <span class="poll-option-label">${escapeHtml(opt)}</span>
                </div>
                <span class="poll-option-count">${count}</span>
            </div>
        `;
    });

    div.innerHTML = `
        <div class="poll-question">${escapeHtml(poll.question)}</div>
        ${optionsHtml}
    `;

    // Add click handlers
    div.querySelectorAll('.poll-option').forEach(opt => {
        opt.addEventListener('click', () => {
            state.socket.emit('poll:vote', {
                pollId: poll.id,
                optionIndex: parseInt(opt.dataset.option)
            });
        });
    });

    elements.pollsContainer.appendChild(div);

    // Update results if available
    if (poll.results) {
        updatePollResults(poll.id, poll.results);
    }
}

function updatePollResults(pollId, results) {
    const pollEl = document.querySelector(`[data-poll-id="${pollId}"]`);
    if (!pollEl) return;

    const total = results.reduce((sum, r) => sum + r.count, 0);

    pollEl.querySelectorAll('.poll-option').forEach(opt => {
        const index = parseInt(opt.dataset.option);
        const result = results.find(r => r.option_index === index);
        const count = result?.count || 0;
        const percent = total > 0 ? (count / total) * 100 : 0;

        opt.querySelector('.poll-option-fill').style.width = `${percent}%`;
        opt.querySelector('.poll-option-count').textContent = count;
    });
}

// Prediction functions
function addPrediction(prediction) {
    const div = document.createElement('div');
    div.className = 'prediction' + (prediction.is_resolved ? ' resolved' : '');
    div.dataset.predictionId = prediction.id;

    const options = typeof prediction.options === 'string'
        ? JSON.parse(prediction.options)
        : prediction.options;

    let optionsHtml = '';
    options.forEach((opt, i) => {
        const count = prediction.results?.find(r => r.option_index === i)?.count || 0;
        const isCorrect = prediction.is_resolved && prediction.correct_option === i;
        optionsHtml += `
            <div class="prediction-option ${isCorrect ? 'correct' : ''}" data-option="${i}">
                <div class="prediction-option-bar">
                    <div class="prediction-option-fill" style="width: 0%"></div>
                    <span class="prediction-option-label">${escapeHtml(opt)}</span>
                </div>
                <span class="prediction-option-count">${count}</span>
                ${isCorrect ? '<span class="correct-badge">✓</span>' : ''}
            </div>
        `;
    });

    div.innerHTML = `
        <div class="prediction-question">🔮 ${escapeHtml(prediction.question)}</div>
        ${optionsHtml}
        ${prediction.is_resolved ? '<div class="prediction-resolved-badge">Avsluttet</div>' : ''}
    `;

    // Add click handlers (only for unresolved predictions)
    if (!prediction.is_resolved) {
        div.querySelectorAll('.prediction-option').forEach(opt => {
            opt.addEventListener('click', () => {
                state.socket.emit('prediction:vote', {
                    predictionId: prediction.id,
                    optionIndex: parseInt(opt.dataset.option)
                });
            });
        });
    }

    elements.predictionsContainer.appendChild(div);

    // Update results if available
    if (prediction.results) {
        updatePredictionResults(prediction.id, prediction.results);
    }
}

function updatePredictionResults(predictionId, results) {
    const predEl = document.querySelector(`[data-prediction-id="${predictionId}"]`);
    if (!predEl) return;

    const total = results.reduce((sum, r) => sum + r.count, 0);

    predEl.querySelectorAll('.prediction-option').forEach(opt => {
        const index = parseInt(opt.dataset.option);
        const result = results.find(r => r.option_index === index);
        const count = result?.count || 0;
        const percent = total > 0 ? (count / total) * 100 : 0;

        opt.querySelector('.prediction-option-fill').style.width = `${percent}%`;
        opt.querySelector('.prediction-option-count').textContent = count;
    });
}

function showPredictionResolved(data) {
    const predEl = document.querySelector(`[data-prediction-id="${data.predictionId}"]`);
    if (predEl) {
        predEl.classList.add('resolved');

        // Mark correct option
        predEl.querySelectorAll('.prediction-option').forEach(opt => {
            const index = parseInt(opt.dataset.option);
            if (index === data.correctOption) {
                opt.classList.add('correct');
                if (!opt.querySelector('.correct-badge')) {
                    opt.innerHTML += '<span class="correct-badge">✓</span>';
                }
            }
        });

        // Add resolved badge
        if (!predEl.querySelector('.prediction-resolved-badge')) {
            const badge = document.createElement('div');
            badge.className = 'prediction-resolved-badge';
            badge.textContent = 'Avsluttet';
            predEl.appendChild(badge);
        }
    }

    // Show notification if user won
    if (data.winners && data.winners.length > 0) {
        showNotification(`🎉 Vinnere: ${data.winners.join(', ')} gjettet riktig!`, 'prediction-win');
    }
}

function updateLeaderboard(leaderboard) {
    elements.leaderboardList.innerHTML = '';

    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        li.innerHTML = `${medal} <span class="lb-name">${escapeHtml(entry.nickname)}</span> <span class="lb-score">${entry.correct_predictions} riktige</span>`;
        elements.leaderboardList.appendChild(li);
    });

    if (leaderboard.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Ingen resultater ennå';
        li.className = 'no-results';
        elements.leaderboardList.appendChild(li);
    }
}

// Achievement functions
const unlockedAchievements = new Set();

function showAchievementUnlocked(achievement) {
    // Create popup notification
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
        <div class="achievement-popup-icon">${achievement.badge}</div>
        <div class="achievement-popup-content">
            <div class="achievement-popup-title">Achievement Unlocked!</div>
            <div class="achievement-popup-name">${achievement.name}</div>
            <div class="achievement-popup-desc">${achievement.description}</div>
        </div>
    `;

    document.body.appendChild(popup);

    // Animate in
    setTimeout(() => popup.classList.add('show'), 10);

    // Remove after delay
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 500);
    }, 4000);

    // Add to local set
    unlockedAchievements.add(achievement.id);
}

function addAchievementToDisplay(achievement) {
    if (!elements.achievementsContainer) return;

    // Check if already displayed
    if (elements.achievementsContainer.querySelector(`[data-achievement="${achievement.id}"]`)) {
        return;
    }

    const badge = document.createElement('div');
    badge.className = 'achievement-badge unlocked';
    badge.dataset.achievement = achievement.id;
    badge.title = `${achievement.name}: ${achievement.description}`;
    badge.innerHTML = `<span class="badge-icon">${achievement.badge}</span>`;

    elements.achievementsContainer.appendChild(badge);
}

function updateAchievementsDisplay(userAchievements) {
    if (!elements.achievementsContainer) return;

    elements.achievementsContainer.innerHTML = '';

    // Show all achievements (locked and unlocked)
    const unlockedIds = new Set(userAchievements.map(a => a.achievement_id));

    Object.entries(ACHIEVEMENTS).forEach(([id, achievement]) => {
        const isUnlocked = unlockedIds.has(id);
        const badge = document.createElement('div');
        badge.className = `achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}`;
        badge.dataset.achievement = id;
        badge.title = isUnlocked
            ? `${achievement.name}: ${achievement.description}`
            : `??? - Locked`;
        badge.innerHTML = `<span class="badge-icon">${isUnlocked ? achievement.badge : '🔒'}</span>`;

        elements.achievementsContainer.appendChild(badge);

        if (isUnlocked) {
            unlockedAchievements.add(id);
        }
    });
}

// Countdown functions
let countdownInterval = null;

function startCountdown(countdown) {
    if (countdownInterval) clearInterval(countdownInterval);

    const targetTime = new Date(countdown.target_time).getTime();

    function update() {
        const now = Date.now();
        const remaining = targetTime - now;

        if (remaining <= 0) {
            elements.countdownDisplay.textContent = '🎉 FRIMINUTT!';
            elements.countdownDisplay.classList.add('countdown-done');
            clearInterval(countdownInterval);
            return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        elements.countdownDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Color based on time
        if (remaining > 600000) {
            elements.countdownDisplay.style.color = '#4CAF50'; // Green
        } else if (remaining > 300000) {
            elements.countdownDisplay.style.color = '#FFC107'; // Yellow
        } else {
            elements.countdownDisplay.style.color = '#f44336'; // Red
        }
    }

    update();
    countdownInterval = setInterval(update, 1000);
}

// Skin functions
function changeSkin(skinId) {
    document.body.dataset.skin = skinId;
    const link = document.getElementById('skin-stylesheet');
    link.href = `css/skins/${skinId}.css`;
    localStorage.setItem('klasse-skin', skinId);
    state.currentSkin = skinId;

    // Update page title based on skin
    const titles = {
        'google-docs': 'Norsk - Kapittel 4 Notater - Google Dokumenter',
        'wikipedia': 'Fotosyntese - Wikipedia',
        'stackoverflow': 'How to fix NullPointerException - Stack Overflow',
        'google-translate': 'Google Oversetter',
        'kahoot': 'Kahoot! - Venter på spillere...',
        'office365': 'Document1 - Word'
    };
    document.title = titles[skinId] || 'Klasse-App';
}

// Admin functions
function initAdmin() {
    elements.adminClearChat.addEventListener('click', () => {
        if (confirm('Tømme all chat?')) {
            state.socket.emit('admin:clearChat');
        }
    });

    elements.adminCreatePoll.addEventListener('click', () => {
        const question = document.getElementById('poll-question').value.trim();
        const optionsStr = document.getElementById('poll-options').value.trim();
        const pollType = document.getElementById('poll-type').value;

        if (!question) {
            alert('Skriv inn et spørsmål');
            return;
        }

        let options;
        if (pollType === 'yesno') {
            options = ['Ja', 'Nei'];
        } else if (pollType === 'scale') {
            options = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        } else {
            options = optionsStr.split(',').map(o => o.trim()).filter(o => o);
            if (options.length < 2) {
                alert('Legg til minst 2 alternativer (separert med komma)');
                return;
            }
        }

        state.socket.emit('admin:newPoll', { question, options, pollType });

        document.getElementById('poll-question').value = '';
        document.getElementById('poll-options').value = '';
    });

    elements.adminChangePet.addEventListener('click', () => {
        const skin = document.getElementById('admin-pet-skin').value;
        state.socket.emit('admin:changePetSkin', { skin });
    });

    elements.adminResetPet.addEventListener('click', () => {
        if (confirm('Resette pet stats?')) {
            state.socket.emit('admin:resetPet');
        }
    });

    elements.adminMinimize.addEventListener('click', () => {
        elements.adminPanel.querySelector('.admin-content').classList.toggle('hidden');
    });

    // Prediction admin
    elements.adminCreatePrediction.addEventListener('click', () => {
        const question = document.getElementById('prediction-question').value.trim();
        const optionsStr = document.getElementById('prediction-options').value.trim();

        if (!question) {
            alert('Skriv inn et spørsmål');
            return;
        }

        const options = optionsStr.split(',').map(o => o.trim()).filter(o => o);
        if (options.length < 2) {
            alert('Legg til minst 2 alternativer (separert med komma)');
            return;
        }

        state.socket.emit('admin:newPrediction', { question, options });

        document.getElementById('prediction-question').value = '';
        document.getElementById('prediction-options').value = '';
    });

    // Request prediction list for admin panel
    state.socket.on('predictions:list', (data) => {
        updateAdminPredictionsList(data.predictions);
    });
}

function updateAdminPredictionsList(predictions) {
    if (!elements.adminPredictionsList) return;

    const unresolvedPredictions = predictions.filter(p => !p.is_resolved);
    elements.adminPredictionsList.innerHTML = '';

    if (unresolvedPredictions.length === 0) {
        elements.adminPredictionsList.innerHTML = '<p style="font-size: 12px; color: #666;">Ingen aktive predictions</p>';
        return;
    }

    unresolvedPredictions.forEach(pred => {
        const options = typeof pred.options === 'string' ? JSON.parse(pred.options) : pred.options;
        const div = document.createElement('div');
        div.className = 'admin-prediction-item';
        div.innerHTML = `
            <div class="admin-pred-question">${escapeHtml(pred.question)}</div>
            <select class="admin-pred-select" data-prediction-id="${pred.id}">
                <option value="">Velg riktig svar...</option>
                ${options.map((opt, i) => `<option value="${i}">${escapeHtml(opt)}</option>`).join('')}
            </select>
            <button class="admin-pred-resolve" data-prediction-id="${pred.id}">Avslutt</button>
        `;

        div.querySelector('.admin-pred-resolve').addEventListener('click', () => {
            const select = div.querySelector('.admin-pred-select');
            const correctOption = parseInt(select.value);

            if (isNaN(correctOption)) {
                alert('Velg riktig svar først');
                return;
            }

            if (confirm(`Avslutt prediction med "${options[correctOption]}" som riktig svar?`)) {
                state.socket.emit('admin:resolvePrediction', {
                    predictionId: pred.id,
                    correctOption
                });
            }
        });

        elements.adminPredictionsList.appendChild(div);
    });
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
}

// Event listeners
function setupEventListeners() {
    // Admin toggle
    elements.adminCheckbox.addEventListener('change', (e) => {
        elements.adminCode.style.display = e.target.checked ? 'block' : 'none';
    });

    // Join button
    elements.joinBtn.addEventListener('click', () => {
        const nickname = elements.nicknameInput.value.trim();
        if (!nickname) {
            alert('Velg et kallenavn!');
            return;
        }

        const fingerprint = generateFingerprint();
        const adminCode = elements.adminCheckbox.checked ? elements.adminCode.value : null;

        state.socket.emit('user:join', { nickname, fingerprint, adminCode });

        localStorage.setItem('klasse-nickname', nickname);
    });

    // Enter key for nickname
    elements.nicknameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') elements.joinBtn.click();
    });

    // Skin selector
    elements.skinSelector.addEventListener('change', (e) => {
        changeSkin(e.target.value);
    });

    // Keyboard shortcuts for skins
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey) {
            const skinMap = {
                '1': 'google-docs',
                '2': 'wikipedia',
                '3': 'stackoverflow',
                '4': 'google-translate',
                '5': 'kahoot',
                '6': 'office365'
            };
            if (skinMap[e.key]) {
                changeSkin(skinMap[e.key]);
                elements.skinSelector.value = skinMap[e.key];
                e.preventDefault();
            }
        }
    });

    // Chat
    elements.sendBtn.addEventListener('click', sendMessage);
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Pet
    elements.feedBtn.addEventListener('click', () => {
        state.socket.emit('pet:feed');
        elements.petSprite.classList.add('feeding');
        setTimeout(() => elements.petSprite.classList.remove('feeding'), 500);
    });

    elements.trainBtn.addEventListener('click', () => {
        state.socket.emit('pet:train');
        elements.petSprite.classList.add('training');
        setTimeout(() => elements.petSprite.classList.remove('training'), 500);
    });

    // Sidebar toggle (desktop)
    elements.sidebarToggle.addEventListener('click', () => {
        elements.sidebar.classList.toggle('collapsed');
        localStorage.setItem('klasse-sidebar-collapsed', elements.sidebar.classList.contains('collapsed'));
    });

    // Mobile sidebar toggle
    function openMobileSidebar() {
        elements.sidebar.classList.add('mobile-open');
        elements.sidebarBackdrop.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileSidebar() {
        elements.sidebar.classList.remove('mobile-open');
        elements.sidebarBackdrop.classList.remove('show');
        document.body.style.overflow = '';
    }

    elements.mobileSidebarToggle.addEventListener('click', () => {
        if (elements.sidebar.classList.contains('mobile-open')) {
            closeMobileSidebar();
        } else {
            openMobileSidebar();
        }
    });

    elements.sidebarBackdrop.addEventListener('click', closeMobileSidebar);

    // Close mobile sidebar when pressing Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.sidebar.classList.contains('mobile-open')) {
            closeMobileSidebar();
        }
    });

    // Close mobile sidebar on window resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileSidebar();
        }
    });
}

// Initialize app
function init() {
    // Load saved nickname
    const savedNickname = localStorage.getItem('klasse-nickname');
    if (savedNickname) {
        elements.nicknameInput.value = savedNickname;
    }

    // Load saved skin
    changeSkin(state.currentSkin);
    elements.skinSelector.value = state.currentSkin;

    // Load saved sidebar state
    const sidebarCollapsed = localStorage.getItem('klasse-sidebar-collapsed') === 'true';
    if (sidebarCollapsed) {
        elements.sidebar.classList.add('collapsed');
    }

    initSocket();
    setupEventListeners();
    initAdmin();
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
