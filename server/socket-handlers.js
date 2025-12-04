import { randomUUID } from 'crypto';

const COLLECTIVE_WINDOW_MS = 5000;
const COLLECTIVE_THRESHOLD = 3;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'noah-admin-2024';

// Track connected users
const connectedUsers = new Map();

export function setupSocketHandlers(io, db) {
    io.on('connection', (socket) => {
        console.log('New connection:', socket.id);

        let currentUser = null;

        // === USER EVENTS ===

        socket.on('user:join', ({ nickname, fingerprint, adminCode }) => {
            // Check if user exists by fingerprint
            let user = db.getUserByFingerprint(fingerprint);

            if (user) {
                // Check if banned
                if (user.is_banned) {
                    socket.emit('user:banned');
                    socket.disconnect();
                    return;
                }
                // Update nickname if changed
                if (user.nickname !== nickname) {
                    db.updateNickname(user.id, nickname);
                }
                db.updateLastSeen(user.id);
            } else {
                // Create new user
                const userId = randomUUID();
                db.createUser(userId, nickname, fingerprint);
                user = db.getUser(userId);
            }

            // Check admin code
            if (adminCode === ADMIN_SECRET) {
                db.setAdmin(user.id, true);
                user.is_admin = 1;
            }

            currentUser = user;
            connectedUsers.set(socket.id, user);

            // Send welcome data
            socket.emit('user:welcome', {
                user: {
                    id: user.id,
                    nickname: user.nickname,
                    isAdmin: user.is_admin === 1
                }
            });

            // Send chat history
            socket.emit('chat:history', {
                messages: db.getRecentMessages(100)
            });

            // Send pet state
            socket.emit('pet:state', db.getPetState());

            // Send active polls
            socket.emit('polls:list', {
                polls: db.getActivePolls().map(poll => ({
                    ...poll,
                    results: db.getPollResults(poll.id)
                }))
            });

            // Send countdowns
            socket.emit('countdowns:list', {
                countdowns: db.getActiveCountdowns()
            });

            // Send active predictions
            socket.emit('predictions:list', {
                predictions: db.getActivePredictions().map(pred => ({
                    ...pred,
                    results: db.getPredictionResults(pred.id)
                }))
            });

            // Send leaderboard
            socket.emit('prediction:leaderboard', {
                leaderboard: db.getLeaderboard()
            });

            // Send user achievements
            socket.emit('achievements:list', {
                achievements: db.getUserAchievements(user.id)
            });

            // Broadcast updated buddy list
            broadcastBuddies(io, db);
        });

        socket.on('user:heartbeat', () => {
            if (currentUser) {
                db.updateLastSeen(currentUser.id);
                broadcastBuddies(io, db);
            }
        });

        // === CHAT EVENTS ===

        socket.on('chat:send', ({ message }) => {
            if (!currentUser || !message || message.length > 500) return;

            const result = db.addMessage(currentUser.id, message.trim());

            io.emit('chat:new', {
                id: result.lastInsertRowid,
                nickname: currentUser.nickname,
                content: message.trim(),
                created_at: new Date().toISOString()
            });
        });

        // === POLL EVENTS ===

        socket.on('poll:vote', ({ pollId, optionIndex }) => {
            if (!currentUser) return;

            db.votePoll(pollId, currentUser.id, optionIndex);

            io.emit('poll:update', {
                pollId,
                results: db.getPollResults(pollId)
            });
        });

        // === PET EVENTS ===

        socket.on('pet:feed', () => {
            if (!currentUser) return;

            const pet = db.getPetState();

            // Check daily limit
            if (pet.feed_count_today >= 50) {
                socket.emit('pet:limit', { type: 'feed', message: 'Max feeds for today!' });
                return;
            }

            // Log interaction and update user stats
            db.logPetInteraction(currentUser.id, 'feed');
            db.incrementUserFeed(currentUser.id);
            db.updatePet({
                feed_count_today: pet.feed_count_today + 1
            });

            // Check for collective
            const recentFeeds = db.getRecentPetInteractions('feed', COLLECTIVE_WINDOW_MS);
            const uniqueUsers = [...new Set(recentFeeds.map(f => f.user_id))];

            if (uniqueUsers.length >= COLLECTIVE_THRESHOLD) {
                // Collective event!
                db.addPetXP(50);
                db.updatePet({
                    mood: 'hyped',
                    last_collective: new Date().toISOString(),
                    total_collectives: pet.total_collectives + 1
                });

                const nicknames = uniqueUsers.map(id => {
                    const u = db.getUser(id);
                    return u ? u.nickname : 'Unknown';
                });

                io.emit('pet:collective', {
                    triggeredBy: nicknames,
                    bonus: 'mega_happy'
                });

                // Grant collective achievements to all participants
                uniqueUsers.forEach(odecodeId => {
                    db.incrementUserCollective(odecodeId);
                    const collectiveAchievements = db.checkAndGrantAchievements(odecodeId, { type: 'collective' });
                    if (collectiveAchievements.length > 0) {
                        // Find socket for this user
                        for (const [socketId, user] of connectedUsers.entries()) {
                            if (user.id === odecodeId) {
                                io.to(socketId).emit('achievement:new', {
                                    achievements: collectiveAchievements.map(id => ({
                                        id,
                                        ...db.constructor.ACHIEVEMENTS[id]
                                    }))
                                });
                                break;
                            }
                        }
                    }
                });

                // Announce in chat
                io.emit('chat:new', {
                    id: 0,
                    nickname: '🎉 SYSTEM',
                    content: `${nicknames.join(', ')} triggered COLLECTIVE FEED! +50 XP`,
                    created_at: new Date().toISOString(),
                    isSystem: true
                });
            } else {
                // Normal feed
                db.addPetXP(5);
            }

            // Check achievements for feeder
            const newAchievements = db.checkAndGrantAchievements(currentUser.id, { type: 'feed' });
            if (newAchievements.length > 0) {
                socket.emit('achievement:new', {
                    achievements: newAchievements.map(id => ({
                        id,
                        ...db.constructor.ACHIEVEMENTS[id]
                    }))
                });
            }

            // Tamagotchi: Update hunger and check evolution
            const evolutionResult = db.feedPet();

            if (evolutionResult.evolved) {
                // Broadcast evolution event
                if (evolutionResult.type === 'ultimate-victory') {
                    io.emit('pet:ultimate-victory', {
                        message: evolutionResult.message,
                        prestige: evolutionResult.prestige
                    });
                } else if (evolutionResult.type === 'reincarnation') {
                    io.emit('pet:reincarnation', {
                        message: evolutionResult.message,
                        newCharacter: evolutionResult.pet.skin
                    });
                } else {
                    io.emit('pet:evolution', {
                        message: evolutionResult.message,
                        newStage: evolutionResult.pet.stage_name
                    });
                }

                // Announce in chat
                io.emit('chat:new', {
                    id: 0,
                    nickname: '✨ EVOLUTION',
                    content: evolutionResult.message,
                    created_at: new Date().toISOString(),
                    isSystem: true
                });
            }

            io.emit('pet:state', db.getPetState());
        });

        socket.on('pet:train', () => {
            if (!currentUser) return;

            const pet = db.getPetState();

            // Check daily limit
            if (pet.train_count_today >= 30) {
                socket.emit('pet:limit', { type: 'train', message: 'Max trains for today!' });
                return;
            }

            // Log interaction and update user stats
            db.logPetInteraction(currentUser.id, 'train');
            db.incrementUserTrain(currentUser.id);

            let newStrength = pet.strength;
            const newTrainCount = pet.train_count + 1;

            if (newTrainCount % 10 === 0) {
                newStrength++;
            }

            db.updatePet({
                train_count_today: pet.train_count_today + 1,
                train_count: newTrainCount,
                strength: newStrength
            });

            db.addPetXP(3);

            // Check achievements for trainer
            const newAchievements = db.checkAndGrantAchievements(currentUser.id, { type: 'train' });
            if (newAchievements.length > 0) {
                socket.emit('achievement:new', {
                    achievements: newAchievements.map(id => ({
                        id,
                        ...db.constructor.ACHIEVEMENTS[id]
                    }))
                });
            }

            // Tamagotchi: Update energy and check evolution
            const evolutionResult = db.trainPet();

            if (evolutionResult.evolved) {
                // Broadcast evolution event
                if (evolutionResult.type === 'ultimate-victory') {
                    io.emit('pet:ultimate-victory', {
                        message: evolutionResult.message,
                        prestige: evolutionResult.prestige
                    });
                } else if (evolutionResult.type === 'reincarnation') {
                    io.emit('pet:reincarnation', {
                        message: evolutionResult.message,
                        newCharacter: evolutionResult.pet.skin
                    });
                } else {
                    io.emit('pet:evolution', {
                        message: evolutionResult.message,
                        newStage: evolutionResult.pet.stage_name
                    });
                }

                // Announce in chat
                io.emit('chat:new', {
                    id: 0,
                    nickname: '✨ EVOLUTION',
                    content: evolutionResult.message,
                    created_at: new Date().toISOString(),
                    isSystem: true
                });
            }

            io.emit('pet:state', db.getPetState());
        });

        // === ADMIN EVENTS ===

        socket.on('admin:clearChat', () => {
            if (!currentUser || currentUser.is_admin !== 1) return;
            db.clearMessages();
            io.emit('chat:cleared');
        });

        socket.on('admin:kick', ({ odecodeId }) => {
            if (!currentUser || currentUser.is_admin !== 1) return;

            // Find and disconnect user
            for (const [socketId, user] of connectedUsers.entries()) {
                if (user.id === odecodeId) {
                    io.to(socketId).emit('user:kicked');
                    io.sockets.sockets.get(socketId)?.disconnect();
                    break;
                }
            }
        });

        socket.on('admin:ban', ({ odecodeId }) => {
            if (!currentUser || currentUser.is_admin !== 1) return;

            db.setBanned(odecodeId, true);

            // Disconnect if online
            for (const [socketId, user] of connectedUsers.entries()) {
                if (user.id === odecodeId) {
                    io.to(socketId).emit('user:banned');
                    io.sockets.sockets.get(socketId)?.disconnect();
                    break;
                }
            }

            broadcastBuddies(io, db);
        });

        socket.on('admin:newPoll', ({ question, options, pollType }) => {
            if (!currentUser || currentUser.is_admin !== 1) return;

            const pollId = randomUUID();
            db.createPoll(pollId, question, options, pollType);

            io.emit('poll:new', {
                poll: {
                    id: pollId,
                    question,
                    options,
                    poll_type: pollType,
                    results: []
                }
            });
        });

        socket.on('admin:closePoll', ({ pollId }) => {
            if (!currentUser || currentUser.is_admin !== 1) return;
            db.closePoll(pollId);
            io.emit('poll:closed', { pollId });
        });

        socket.on('admin:changePetSkin', ({ skin }) => {
            if (!currentUser || currentUser.is_admin !== 1) return;
            db.updatePet({ skin });
            io.emit('pet:state', db.getPetState());
        });

        socket.on('admin:resetPet', () => {
            if (!currentUser || currentUser.is_admin !== 1) return;
            db.updatePet({
                level: 1,
                xp: 0,
                xp_to_next: 100,
                strength: 1,
                train_count: 0,
                feed_count_today: 0,
                train_count_today: 0,
                // Tamagotchi reset
                stage: 1,
                stage_name: 'egg',
                character_index: 0,
                skin: 'goblin',
                total_feeds: 0,
                total_trains: 0,
                hunger: 100,
                energy: 100,
                mood: 'happy'
            });
            io.emit('pet:state', db.getPetState());
        });

        socket.on('admin:getUsers', () => {
            if (!currentUser || currentUser.is_admin !== 1) return;
            socket.emit('admin:userList', {
                users: db.getAllUsersWithRealNames()
            });
        });

        // === PREDICTION EVENTS ===

        socket.on('prediction:vote', ({ predictionId, optionIndex }) => {
            if (!currentUser) return;

            db.votePrediction(predictionId, currentUser.id, optionIndex);

            io.emit('prediction:update', {
                predictionId,
                results: db.getPredictionResults(predictionId)
            });
        });

        socket.on('admin:newPrediction', ({ question, options }) => {
            if (!currentUser || currentUser.is_admin !== 1) return;

            const predictionId = randomUUID();
            db.createPrediction(predictionId, question, options);

            io.emit('prediction:new', {
                prediction: {
                    id: predictionId,
                    question,
                    options,
                    is_resolved: 0,
                    correct_option: null,
                    results: []
                }
            });
        });

        socket.on('admin:resolvePrediction', ({ predictionId, correctOption }) => {
            if (!currentUser || currentUser.is_admin !== 1) return;

            const { winners, totalVotes } = db.resolvePrediction(predictionId, correctOption);
            const prediction = db.getPrediction(predictionId);

            io.emit('prediction:resolved', {
                predictionId,
                correctOption,
                winners,
                totalVotes,
                question: prediction.question,
                correctAnswer: prediction.options[correctOption]
            });

            // Announce in chat
            if (winners.length > 0) {
                io.emit('chat:new', {
                    id: 0,
                    nickname: '🔮 PREDICTION',
                    content: `"${prediction.question}" → ${prediction.options[correctOption]}! Vinnere: ${winners.join(', ')}`,
                    created_at: new Date().toISOString(),
                    isSystem: true
                });
            }

            // Send updated leaderboard
            io.emit('prediction:leaderboard', {
                leaderboard: db.getLeaderboard()
            });
        });

        // === DISCONNECT ===

        socket.on('disconnect', () => {
            console.log('Disconnected:', socket.id);
            connectedUsers.delete(socket.id);
            broadcastBuddies(io, db);
        });
    });
}

function broadcastBuddies(io, db) {
    const users = db.getOnlineUsers();
    io.emit('buddies:update', { users });
}
