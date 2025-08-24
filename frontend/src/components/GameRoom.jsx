import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaSignOutAlt, FaStopCircle } from 'react-icons/fa';

const GameRoom = ({ gameState, isCreator, startGame, submitAnswer, leaveGame, endGame, currentAnswer, setCurrentAnswer, userId, socket }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    if (!socket) return;

    socket.on('loading', ({ message }) => {
      setIsLoading(true);
      setLoadingMessage(message);
    });

    socket.on('loadingComplete', () => {
      setIsLoading(false);
      setLoadingMessage('');
    });

    return () => {
      socket.off('loading');
      socket.off('loadingComplete');
    };
  }, [socket]);

  if (!gameState) {
    return <div>Loading game state...</div>;
  }

  const { roomId, topic, gameStatus, players, scores, currentQuestion, currentPlayerId, questionCount } = gameState;

  return (
    <div className="relative">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-2xl"
        >
          <div className="text-white text-lg font-semibold flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {loadingMessage || 'Loading...'}
          </div>
        </motion.div>
      )}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#E5E7EB]/80 rounded-2xl shadow-2xl p-8 border border-[#1E1B4B]/20"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Room: {roomId} 🎮</h2>
            <p className="text-lg">Topic: {topic} 📚</p>
            <p className="text-lg">
              Status:{' '}
              {gameStatus === 'waiting'
                ? `Waiting for players (${players.length}/4) ⏳`
                : gameStatus === 'in_progress'
                ? `In Progress 🚀 (Question ${questionCount}/10)`
                : 'Finished 🏁'}
            </p>
          </div>
          <div className="flex space-x-4">
            <motion.button
              onClick={leaveGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#1E1B4B] text-[#2DD4BF] px-4 py-2 rounded-lg flex items-center"
              disabled={isLoading}
            >
              <FaSignOutAlt className="mr-2" /> Leave Game
            </motion.button>
            {isCreator && gameStatus !== 'finished' && (
              <motion.button
                onClick={endGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#1E1B4B] text-[#A855F7] px-4 py-2 rounded-lg flex items-center"
                disabled={isLoading}
              >
                <FaStopCircle className="mr-2" /> End Game
              </motion.button>
            )}
          </div>
        </div>

        {gameStatus === 'finished' ? (
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FaTrophy className="mr-2 text-[#FFD700]" /> Scoreboard
            </h3>
            <ul className="space-y-2">
              {scores
                .sort((a, b) => b.score - a.score)
                .map((score, index) => {
                  const player = players.find(p => p.userId === score.playerId);
                  return (
                    <li key={score.playerId} className="flex justify-between p-2 bg-[#1E1B4B]/10 rounded-lg">
                      <span>
                        {index + 1}. {player?.name || score.playerId} {score.playerId === userId ? '(You)' : ''}
                      </span>
                      <span>{score.score} 🌟</span>
                    </li>
                  );
                })}
            </ul>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-4">Players 👥</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {players.map(player => (
                <li
                  key={player.userId}
                  className={`p-4 rounded-lg ${
                    player.userId === currentPlayerId && gameStatus === 'in_progress'
                      ? 'bg-[#2DD4BF]/30 border-[#2DD4BF]'
                      : 'bg-[#1E1B4B]/10'
                  } border`}
                >
                  {player.name} {player.userId === userId ? '(You)' : ''} - Score:{' '}
                  {scores.find(s => s.playerId === player.userId)?.score || 0} 🌟
                  {player.userId === currentPlayerId && gameStatus === 'in_progress' && ' (Current Turn)'}
                </li>
              ))}
            </ul>

            {gameStatus === 'waiting' && isCreator && players.length >= 2 && (
              <motion.button
                onClick={startGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#1E1B4B] text-[#2DD4BF] px-6 py-3 rounded-lg mb-6"
                disabled={isLoading}
              >
                Start Game
              </motion.button>
            )}

            {gameStatus === 'in_progress' && currentQuestion && (
              <div>
                <h3 className="text-xl font-bold mb-4">Question {questionCount}/10 ❓</h3>
                {currentPlayerId === userId ? (
                  <div>
                    <p className="text-lg mb-4">Your Turn! 🎉</p>
                    <p className="text-lg mb-4">{currentQuestion.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {currentQuestion.options.map((option, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setCurrentAnswer(option)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-4 rounded-lg border ${
                            currentAnswer === option ? 'bg-[#2DD4BF] text-[#1E1B4B]' : 'bg-[#1E1B4B]/10'
                          }`}
                          disabled={isLoading}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                    <motion.button
                      onClick={submitAnswer}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#1E1B4B] text-[#2DD4BF] px-6 py-3 rounded-lg"
                      disabled={isLoading || !currentAnswer}
                    >
                      Submit Answer
                    </motion.button>
                  </div>
                ) : (
                  <p className="text-lg">
                    Waiting for {players.find(p => p.userId === currentPlayerId)?.name || 'player'}... ⏳
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default GameRoom;