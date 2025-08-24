const winston = require('winston');
const QuizRoom = require('../Models/QuizRoom');
const User = require('../Models/User');
const { generateQuestion, verifyAnswer, shuffleDifficulties } = require('../Services/GameService');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Initialize Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

const initializeGameSocket = (io) => {
  const userSockets = new Map();

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      logger.error('No token provided for socket authentication', { socketId: socket.id });
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded._id;
      logger.info('Socket authenticated', { socketId: socket.id, userId: socket.userId });
      next();
    } catch (error) {
      logger.error('Socket authentication failed', { socketId: socket.id, error: error.message });
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('New client connected', { socketId: socket.id, userId: socket.userId });
    userSockets.set(socket.userId, socket.id);

    socket.on('error', (error) => {
      logger.error('Socket error', { socketId: socket.id, userId: socket.userId, error: error.message });
    });

    socket.onAny((event, ...args) => {
      logger.info('Received event', { event, args, socketId: socket.id, userId: socket.userId });
    });

    const ensurePlayersInRoom = async (roomId, playerIds) => {
      const roomClients = io.sockets.adapter.rooms.get(roomId) || new Set();
      for (const playerId of playerIds) {
        const playerSocketId = userSockets.get(playerId);
        if (playerSocketId && !roomClients.has(playerSocketId)) {
          const playerSocket = io.sockets.sockets.get(playerSocketId);
          if (playerSocket) {
            playerSocket.join(roomId);
            logger.info('Player rejoined room', { roomId, playerId, socketId: playerSocketId });
          }
        }
      }
    };

    const broadcastGameState = async (roomId) => {
      try {
        const quizRoom = await QuizRoom.findOne({ roomId });
        if (!quizRoom) return;

        const players = await User.find({ _id: { $in: quizRoom.players } }, '_id name');
        const playerData = players.map(p => ({ userId: p._id.toString(), name: p.name }));

        const roomData = {
          ...quizRoom.toObject(),
          creatorId: quizRoom.creatorId.toString(),
          players: playerData,
          scores: quizRoom.scores.map(score => ({
            playerId: score.playerId.toString(),
            score: score.score,
          })),
          currentQuestion: quizRoom.currentQuestion ? JSON.parse(quizRoom.currentQuestion) : null,
          currentPlayerId: quizRoom.currentPlayerIndex !== null ? quizRoom.players[quizRoom.currentPlayerIndex]?.toString() : null,
          questionCount: quizRoom.questionCount || 0,
          gameStatus: quizRoom.gameStatus || 'waiting',
        };

        await ensurePlayersInRoom(roomId, quizRoom.players.map(p => p.toString()));
        logger.info('Broadcasting gameState', {
          roomId,
          gameStatus: roomData.gameStatus,
          players: playerData.map(p => p.name),
          currentPlayerId: roomData.currentPlayerId,
          questionCount: roomData.questionCount
        });

        io.to(roomId).emit('gameState', roomData);
        return roomData;
      } catch (error) {
        logger.error('Error broadcasting game state', { roomId, error: error.message });
      }
    };

    socket.on('joinRoom', async ({ roomId, userId }, callback) => {
      try {
        const effectiveUserId = userId || socket.userId;
        logger.info('Processing joinRoom event', { roomId, userId: effectiveUserId });

        if (!mongoose.isValidObjectId(effectiveUserId)) {
          logger.error('Invalid userId format', { roomId, userId: effectiveUserId });
          socket.emit('error', { message: 'Invalid user ID format' });
          if (callback) callback({ error: 'Invalid user ID format' });
          return;
        }

        const user = await User.findById(effectiveUserId);
        if (!user) {
          logger.warn('User not found', { userId: effectiveUserId });
          socket.emit('error', { message: 'User not found' });
          if (callback) callback({ error: 'User not found' });
          return;
        }

        const quizRoom = await QuizRoom.findOne({ roomId });
        if (!quizRoom) {
          logger.warn('Game room not found', { roomId });
          socket.emit('error', { message: 'Game room not found' });
          if (callback) callback({ error: 'Game room not found' });
          return;
        }

        if (!quizRoom.players.some(p => p.equals(effectiveUserId))) {
          logger.warn('User not in room', { roomId, userId: effectiveUserId });
          socket.emit('error', { message: 'You are not in this room' });
          if (callback) callback({ error: 'You are not in this room' });
          return;
        }

        socket.join(roomId);
        logger.info(`User ${user.name} (${effectiveUserId}) joined room ${roomId}`, { socketId: socket.id });
        userSockets.set(effectiveUserId, socket.id);
        socket.to(roomId).emit('playerJoined', { userId: effectiveUserId, name: user.name });
        await broadcastGameState(roomId);
        if (callback) callback({ success: true });
      } catch (error) {
        logger.error('Error joining room', { roomId, userId: userId || socket.userId, error: error.message });
        socket.emit('error', { message: 'Failed to join room: ' + error.message });
        if (callback) callback({ error: 'Failed to join room: ' + error.message });
      }
    });

    socket.on('syncRoom', async ({ roomId }, callback) => {
      try {
        await broadcastGameState(roomId);
        if (callback) callback({ success: true });
      } catch (error) {
        logger.error('Error syncing room', { roomId, userId: socket.userId, error: error.message });
        socket.emit('error', { message: 'Failed to sync room: ' + error.message });
        if (callback) callback({ error: 'Failed to sync room: ' + error.message });
      }
    });

    socket.on('startGame', async ({ roomId }, callback) => {
      const maxRetries = 3;
      let attempt = 0;

      io.to(roomId).emit('loading', { message: 'Generating first question...' });

      while (attempt < maxRetries) {
        try {
          logger.info(`Attempt ${attempt + 1} to start game`, { roomId, userId: socket.userId });

          if (!socket.userId) {
            logger.error('No userId on socket', { roomId });
            socket.emit('error', { message: 'User not authenticated' });
            if (callback) callback({ error: 'User not authenticated' });
            io.to(roomId).emit('loadingComplete');
            return;
          }

          const session = await mongoose.startSession();
          session.startTransaction();

          try {
            const quizRoom = await QuizRoom.findOne({ roomId }).session(session);
            if (!quizRoom) {
              logger.warn('Game room not found', { roomId });
              socket.emit('error', { message: 'Game room not found' });
              if (callback) callback({ error: 'Game room not found' });
              await session.abortTransaction();
              session.endSession();
              io.to(roomId).emit('loadingComplete');
              return;
            }

            if (!quizRoom.creatorId.equals(socket.userId)) {
              logger.warn('Unauthorized game start attempt', { roomId, userId: socket.userId, creatorId: quizRoom.creatorId.toString() });
              socket.emit('error', { message: 'Only the creator can start the game' });
              if (callback) callback({ error: 'Only the creator can start the game' });
              await session.abortTransaction();
              session.endSession();
              io.to(roomId).emit('loadingComplete');
              return;
            }

            if (quizRoom.gameStatus !== 'waiting') {
              logger.warn('Invalid game start attempt', { roomId, gameStatus: quizRoom.gameStatus });
              socket.emit('error', { message: `Game cannot be started, current status: ${quizRoom.gameStatus}` });
              if (callback) callback({ error: `Game cannot be started, current status: ${quizRoom.gameStatus}` });
              await session.abortTransaction();
              session.endSession();
              io.to(roomId).emit('loadingComplete');
              return;
            }

            if (quizRoom.players.length < 2) {
              logger.warn('Not enough players to start game', { roomId, playerCount: quizRoom.players.length });
              socket.emit('error', { message: 'At least 2 players are required to start the game' });
              if (callback) callback({ error: 'At least 2 players are required to start the game' });
              await session.abortTransaction();
              session.endSession();
              io.to(roomId).emit('loadingComplete');
              return;
            }

            if (!quizRoom.difficultyOrder || quizRoom.difficultyOrder.length === 0) {
              quizRoom.difficultyOrder = shuffleDifficulties();
              logger.info('Generated difficulty order for game', {
                roomId,
                difficultyOrder: quizRoom.difficultyOrder
              });
            }

            let question;
            try {
              question = await generateQuestion(
                quizRoom.topic,
                quizRoom.usedQuestions || [],
                1,
                quizRoom.difficultyOrder
              );

              if (!question || !question.question || !question.options || !question.correctAnswer) {
                throw new Error('Invalid question format');
              }

              if (!quizRoom.usedQuestions) {
                quizRoom.usedQuestions = [];
              }
              quizRoom.usedQuestions.push(question.question);

            } catch (error) {
              logger.error('Failed to generate question', { roomId, topic: quizRoom.topic, error: error.message });
              socket.emit('error', { message: 'Failed to generate question' });
              if (callback) callback({ error: 'Failed to generate question' });
              await session.abortTransaction();
              session.endSession();
              io.to(roomId).emit('loadingComplete');
              return;
            }

            quizRoom.gameStatus = 'in_progress';
            quizRoom.currentPlayerIndex = 0;
            quizRoom.currentQuestionAttempts = 0;
            quizRoom.currentQuestion = JSON.stringify(question);
            quizRoom.questionCount = 1;
            quizRoom.scores = quizRoom.players.map(playerId => ({
              playerId,
              score: quizRoom.scores.find(s => s.playerId.equals(playerId))?.score || 0,
            }));

            await quizRoom.save({ session });
            await session.commitTransaction();
            session.endSession();

            logger.info('Game started successfully', {
              roomId,
              gameStatus: 'in_progress',
              question: question.question,
              questionCount: quizRoom.questionCount
            });

            await ensurePlayersInRoom(roomId, quizRoom.players.map(p => p.toString()));
            io.to(roomId).emit('gameStarted', { roomId, gameStatus: 'in_progress' });
            await broadcastGameState(roomId);
            io.to(roomId).emit('loadingComplete');

            if (callback) callback({ success: true });
            return;

          } catch (error) {
            logger.error('Error in startGame transaction', { roomId, userId: socket.userId, attempt: attempt + 1, error: error.message });
            await session.abortTransaction();
            session.endSession();
            throw error;
          }
        } catch (error) {
          attempt++;
          if (error.message.includes('No matching document found') && attempt < maxRetries) {
            logger.warn(`Version conflict detected, retrying startGame (attempt ${attempt + 1})`, { roomId, userId: socket.userId });
            await new Promise(resolve => setTimeout(resolve, 100 * attempt));
            continue;
          }

          logger.error('Error starting game', { roomId, userId: socket.userId, attempt: attempt + 1, error: error.message });
          socket.emit('error', { message: 'Failed to start game: ' + error.message });
          io.to(roomId).emit('loadingComplete');
          if (callback) callback({ error: 'Failed to start game: ' + error.message });
          return;
        }
      }
    });

    socket.on('submitAnswer', async ({ roomId, answer }, callback) => {
      try {
        logger.info('Received submitAnswer event', { roomId, userId: socket.userId, answer });
        io.to(roomId).emit('loading', { message: 'Processing answer...' });

        if (!socket.userId) {
          logger.error('No userId on socket', { roomId });
          socket.emit('error', { message: 'User not authenticated' });
          if (callback) callback({ error: 'User not authenticated' });
          io.to(roomId).emit('loadingComplete');
          return;
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          const quizRoom = await QuizRoom.findOne({ roomId }).session(session);
          if (!quizRoom || quizRoom.gameStatus !== 'in_progress') {
            logger.warn('Invalid answer submission', { roomId, userId: socket.userId, gameStatus: quizRoom?.gameStatus });
            socket.emit('error', { message: 'Game not in progress' });
            if (callback) callback({ error: 'Game not in progress' });
            await session.abortTransaction();
            session.endSession();
            io.to(roomId).emit('loadingComplete');
            return;
          }

          const user = await User.findById(socket.userId).session(session);
          if (!user) {
            logger.warn('User not found', { userId: socket.userId });
            socket.emit('error', { message: 'User not found' });
            if (callback) callback({ error: 'User not found' });
            await session.abortTransaction();
            session.endSession();
            io.to(roomId).emit('loadingComplete');
            return;
          }

          const currentPlayerId = quizRoom.players[quizRoom.currentPlayerIndex];
          if (!currentPlayerId || !currentPlayerId.equals(socket.userId)) {
            logger.warn('Unauthorized answer submission', {
              roomId,
              userId: socket.userId,
              currentPlayerId: currentPlayerId?.toString(),
              currentPlayerIndex: quizRoom.currentPlayerIndex
            });
            socket.emit('error', { message: 'Not your turn' });
            if (callback) callback({ error: 'Not your turn' });
            await session.abortTransaction();
            session.endSession();
            io.to(roomId).emit('loadingComplete');
            return;
          }

          const currentQuestion = JSON.parse(quizRoom.currentQuestion);
          if (!currentQuestion || !currentQuestion.correctAnswer) {
            logger.error('Invalid current question', { roomId, question: currentQuestion });
            socket.emit('error', { message: 'Invalid question data' });
            if (callback) callback({ error: 'Invalid question data' });
            await session.abortTransaction();
            session.endSession();
            io.to(roomId).emit('loadingComplete');
            return;
          }

          let isCorrect = false;
          if (answer) {
            logger.info('Verifying answer', { roomId, answer, correctAnswer: currentQuestion.correctAnswer });
            isCorrect = await verifyAnswer(currentQuestion, answer);
          } else {
            logger.info('No answer provided, treating as incorrect', { roomId, userId: socket.userId });
          }

          const scoreIndex = quizRoom.scores.findIndex(s => s.playerId.equals(socket.userId));
          if (scoreIndex === -1) {
            logger.warn('Score entry not found for user', { roomId, userId: socket.userId });
            socket.emit('error', { message: 'Score entry not found' });
            if (callback) callback({ error: 'Score entry not found' });
            await session.abortTransaction();
            session.endSession();
            io.to(roomId).emit('loadingComplete');
            return;
          }

          quizRoom.currentQuestionAttempts += 1;
          if (answer) {
            const scoreDelta = isCorrect ? 10 : -5;
            quizRoom.scores[scoreIndex].score += scoreDelta;
          }

          let needNewQuestion = false;
          let gameEnded = false;

          if (isCorrect) {
            needNewQuestion = true;
            quizRoom.currentQuestionAttempts = 0;
            quizRoom.currentPlayerIndex = (quizRoom.currentPlayerIndex + 1) % quizRoom.players.length;

            if (quizRoom.questionCount >= 10) {
              gameEnded = true;
              quizRoom.gameStatus = 'finished';
              quizRoom.currentQuestion = null;
              quizRoom.currentPlayerIndex = null;
            } else {
              io.to(roomId).emit('loading', { message: 'Generating next question...' });
              try {
                const nextQuestion = await generateQuestion(
                  quizRoom.topic,
                  quizRoom.usedQuestions || [],
                  quizRoom.questionCount + 1,
                  quizRoom.difficultyOrder
                );

                if (!nextQuestion || !nextQuestion.question || !nextQuestion.options || !nextQuestion.correctAnswer) {
                  throw new Error('Invalid question format');
                }

                if (!quizRoom.usedQuestions) {
                  quizRoom.usedQuestions = [];
                }
                quizRoom.usedQuestions.push(nextQuestion.question);

                quizRoom.currentQuestion = JSON.stringify(nextQuestion);
                quizRoom.questionCount += 1;
                logger.info('Generated new question', {
                  roomId,
                  question: nextQuestion.question,
                  questionCount: quizRoom.questionCount,
                  difficulty: nextQuestion.difficulty
                });
              } catch (error) {
                logger.error('Failed to generate new question', { roomId, topic: quizRoom.topic, error: error.message });
                socket.emit('error', { message: 'Failed to generate new question' });
                if (callback) callback({ error: 'Failed to generate new question' });
                await session.abortTransaction();
                session.endSession();
                io.to(roomId).emit('loadingComplete');
                return;
              }
            }
          } else if (quizRoom.currentQuestionAttempts >= quizRoom.players.length) {
            needNewQuestion = true;
            quizRoom.currentQuestionAttempts = 0;
            quizRoom.currentPlayerIndex = (quizRoom.currentPlayerIndex + 1) % quizRoom.players.length;

            if (quizRoom.questionCount >= 10) {
              gameEnded = true;
              quizRoom.gameStatus = 'finished';
              quizRoom.currentQuestion = null;
              quizRoom.currentPlayerIndex = null;
            } else {
              io.to(roomId).emit('loading', { message: 'Generating next question...' });
              try {
                const nextQuestion = await generateQuestion(
                  quizRoom.topic,
                  quizRoom.usedQuestions || [],
                  quizRoom.questionCount + 1,
                  quizRoom.difficultyOrder
                );

                if (!nextQuestion || !nextQuestion.question || !nextQuestion.options || !nextQuestion.correctAnswer) {
                  throw new Error('Invalid question format');
                }

                if (!quizRoom.usedQuestions) {
                  quizRoom.usedQuestions = [];
                }
                quizRoom.usedQuestions.push(nextQuestion.question);

                quizRoom.currentQuestion = JSON.stringify(nextQuestion);
                quizRoom.questionCount += 1;
                logger.info('Generated new question after all players attempted', {
                  roomId,
                  question: nextQuestion.question,
                  questionCount: quizRoom.questionCount,
                  difficulty: nextQuestion.difficulty
                });
              } catch (error) {
                logger.error('Failed to generate new question', { roomId, topic: quizRoom.topic, error: error.message });
                socket.emit('error', { message: 'Failed to generate new question' });
                if (callback) callback({ error: 'Failed to generate new question' });
                await session.abortTransaction();
                session.endSession();
                io.to(roomId).emit('loadingComplete');
                return;
              }
            }
          } else {
            quizRoom.currentPlayerIndex = (quizRoom.currentPlayerIndex + 1) % quizRoom.players.length;
          }

          await quizRoom.save({ session });
          await session.commitTransaction();
          session.endSession();

          logger.info('Answer processed successfully', {
            roomId,
            userId: socket.userId,
            isCorrect,
            score: quizRoom.scores[scoreIndex].score,
            currentPlayerIndex: quizRoom.currentPlayerIndex,
            questionCount: quizRoom.questionCount,
            gameEnded
          });

          await ensurePlayersInRoom(roomId, quizRoom.players.map(p => p.toString()));

          const eventData = {
            playerId: socket.userId,
            name: user.name,
            score: quizRoom.scores[scoreIndex].score,
            correctAnswer: currentQuestion.correctAnswer,
          };

          if (answer) {
            if (isCorrect) {
              logger.info('Emitting correctAnswer', { roomId, ...eventData });
              io.to(roomId).emit('correctAnswer', eventData);
            } else {
              logger.info('Emitting wrongAnswer', { roomId, ...eventData });
              io.to(roomId).emit('wrongAnswer', eventData);
            }
          } else {
            logger.info('Emitting noAnswer', { roomId, ...eventData });
            io.to(roomId).emit('noAnswer', eventData);
          }

          io.to(roomId).emit('scoreUpdate', {
            scores: quizRoom.scores.map(score => ({
              playerId: score.playerId.toString(),
              score: score.score,
            }))
          });

          if (gameEnded) {
            logger.info('Emitting gameEnded', { roomId, questionCount: quizRoom.questionCount });
            io.to(roomId).emit('gameEnded', { roomId, gameStatus: 'finished' });
          }

          await broadcastGameState(roomId);
          io.to(roomId).emit('loadingComplete');

          if (callback) callback({
            success: true,
            isCorrect: answer ? isCorrect : false,
            score: quizRoom.scores[scoreIndex].score
          });

        } catch (error) {
          logger.error('Error in submitAnswer transaction', { roomId, userId: socket.userId, error: error.message });
          await session.abortTransaction();
          session.endSession();
          throw error;
        }
      } catch (error) {
        logger.error('Error processing answer', { roomId, userId: socket.userId, answer, error: error.message });
        socket.emit('error', { message: 'Failed to process answer: ' + error.message });
        io.to(roomId).emit('loadingComplete');
        if (callback) callback({ error: 'Failed to process answer: ' + error.message });
      }
    });

    socket.on('leaveGame', async ({ roomId }, callback) => {
      try {
        logger.info('Received leaveGame event', { roomId, userId: socket.userId });
        io.to(roomId).emit('loading', { message: 'Processing player leave...' });

        if (!socket.userId) {
          logger.error('No userId on socket', { roomId });
          socket.emit('error', { message: 'User not authenticated' });
          if (callback) callback({ error: 'User not authenticated' });
          io.to(roomId).emit('loadingComplete');
          return;
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          const quizRoom = await QuizRoom.findOne({ roomId }).session(session);
          if (!quizRoom) {
            logger.warn('Game room not found', { roomId });
            socket.emit('error', { message: 'Game room not found' });
            if (callback) callback({ error: 'Game room not found' });
            await session.abortTransaction();
            session.endSession();
            io.to(roomId).emit('loadingComplete');
            return;
          }

          const user = await User.findById(socket.userId).session(session);
          if (!user) {
            logger.warn('User not found', { userId: socket.userId });
            socket.emit('error', { message: 'User not found' });
            if (callback) callback({ error: 'User not found' });
            await session.abortTransaction();
            session.endSession();
            io.to(roomId).emit('loadingComplete');
            return;
          }

          const wasCurrentPlayer = quizRoom.currentPlayerIndex !== null &&
                                 quizRoom.players[quizRoom.currentPlayerIndex]?.equals(socket.userId);

          quizRoom.players = quizRoom.players.filter(p => !p.equals(socket.userId));
          quizRoom.scores = quizRoom.scores.filter(s => !s.playerId.equals(socket.userId));

          userSockets.delete(socket.userId);

          if (quizRoom.players.length === 0) {
            await QuizRoom.deleteOne({ roomId }).session(session);
            logger.info('Room deleted due to no players', { roomId });
          } else {
            if (quizRoom.creatorId.equals(socket.userId)) {
              quizRoom.gameStatus = 'finished';
              quizRoom.currentQuestion = null;
              quizRoom.currentPlayerIndex = null;
            } else if (quizRoom.gameStatus === 'in_progress' && wasCurrentPlayer) {
              if (quizRoom.currentPlayerIndex >= quizRoom.players.length) {
                quizRoom.currentPlayerIndex = 0;
              }
            }

            await quizRoom.save({ session });
          }

          await session.commitTransaction();
          session.endSession();

          socket.leave(roomId);
          io.to(roomId).emit('playerLeft', { userId: socket.userId, name: user.name });

          if (quizRoom.players.length > 0) {
            await broadcastGameState(roomId);
          }
          io.to(roomId).emit('loadingComplete');

          if (callback) callback({ success: true });

        } catch (error) {
          logger.error('Error in leaveGame transaction', { roomId, userId: socket.userId, error: error.message });
          await session.abortTransaction();
          session.endSession();
          throw error;
        }
      } catch (error) {
        logger.error('Error leaving game', { roomId, userId: socket.userId, error: error.message });
        socket.emit('error', { message: 'Failed to leave game: ' + error.message });
        io.to(roomId).emit('loadingComplete');
        if (callback) callback({ error: 'Failed to leave game: ' + error.message });
      }
    });

    socket.on('endGame', async ({ roomId }, callback) => {
      try {
        logger.info('Received endGame event', { roomId, userId: socket.userId });
        io.to(roomId).emit('loading', { message: 'Ending game...' });

        if (!socket.userId) {
          logger.error('No userId on socket', { roomId });
          socket.emit('error', { message: 'User not authenticated' });
          if (callback) callback({ error: 'User not authenticated' });
          io.to(roomId).emit('loadingComplete');
          return;
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          const quizRoom = await QuizRoom.findOne({ roomId }).session(session);
          if (!quizRoom) {
            logger.warn('Game room not found', { roomId });
            socket.emit('error', { message: 'Game room not found' });
            if (callback) callback({ error: 'Game room not found' });
            await session.abortTransaction();
            session.endSession();
            io.to(roomId).emit('loadingComplete');
            return;
          }

          if (!quizRoom.creatorId.equals(socket.userId)) {
            logger.warn('Unauthorized game end attempt', { roomId, userId: socket.userId, creatorId: quizRoom.creatorId.toString() });
            socket.emit('error', { message: 'Only the creator can end the game' });
            if (callback) callback({ error: 'Only the creator can end the game' });
            await session.abortTransaction();
            session.endSession();
            io.to(roomId).emit('loadingComplete');
            return;
          }

          quizRoom.gameStatus = 'finished';
          quizRoom.currentQuestion = null;
          quizRoom.currentPlayerIndex = null;
          await quizRoom.save({ session });

          await session.commitTransaction();
          session.endSession();

          logger.info('Game ended by creator', { roomId, userId: socket.userId });
          await ensurePlayersInRoom(roomId, quizRoom.players.map(p => p.toString()));
          io.to(roomId).emit('gameEnded', { roomId, gameStatus: 'finished' });
          await broadcastGameState(roomId);
          io.to(roomId).emit('loadingComplete');

          if (callback) callback({ success: true });

        } catch (error) {
          logger.error('Error in endGame transaction', { roomId, userId: socket.userId, error: error.message });
          await session.abortTransaction();
          session.endSession();
          throw error;
        }
      } catch (error) {
        logger.error('Error ending game', { roomId, userId: socket.userId, error: error.message });
        socket.emit('error', { message: 'Failed to end game: ' + error.message });
        io.to(roomId).emit('loadingComplete');
        if (callback) callback({ error: 'Failed to end game: ' + error.message });
      }
    });

    socket.on('disconnect', async () => {
      logger.info('Client disconnected', { socketId: socket.id, userId: socket.userId });
      if (socket.userId) {
        userSockets.delete(socket.userId);
      }
    });
  });
};

module.exports = initializeGameSocket;