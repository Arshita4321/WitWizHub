import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaSignOutAlt, FaStopCircle, FaMedal, FaClock } from 'react-icons/fa';
import { DESIGN_TOKENS } from '../styles/designTokens';

const T = DESIGN_TOKENS.colors;
const typography = DESIGN_TOKENS.typography;
const spacing = DESIGN_TOKENS.spacing;
const borderRadius = DESIGN_TOKENS.borderRadius;
const shadows = DESIGN_TOKENS.shadows;

// Rank colors
const RANK_COLORS = [T.warning, T.textMuted, '#cd7f32'];
const RANK_LABELS = ['1st', '2nd', '3rd'];

// Colorful border palette for cards
const CARD_COLORS = [
  { hex: '#F472B6', glow: 'rgba(244, 114, 182, 0.4)', gradient: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)' },  // Pink
  { hex: '#A78BFA', glow: 'rgba(167, 139, 250, 0.4)', gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' },  // Purple
  { hex: '#60A5FA', glow: 'rgba(96, 165, 250, 0.4)', gradient: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)' },  // Blue
  { hex: '#34D399', glow: 'rgba(52, 211, 153, 0.4)', gradient: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' },  // Emerald
  { hex: '#FBBF24', glow: 'rgba(251, 191, 36, 0.4)', gradient: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)' },  // Amber
  { hex: '#FB7185', glow: 'rgba(251, 113, 133, 0.4)', gradient: 'linear-gradient(135deg, #FB7185 0%, #F43F5E 100%)' },  // Rose
  { hex: '#22D3EE', glow: 'rgba(34, 211, 238, 0.4)', gradient: 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)' },  // Cyan
  { hex: '#F87171', glow: 'rgba(248, 113, 113, 0.4)', gradient: 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)' },  // Red
];

const getCardColor = (index) => CARD_COLORS[index % CARD_COLORS.length];

const GameRoom = ({ gameState, isCreator, startGame, submitAnswer, leaveGame, endGame, currentAnswer, setCurrentAnswer, userId, socket }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Landing page state
  const [landingTopic, setLandingTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [playerCount, setPlayerCount] = useState(2);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isConnected, setIsConnected] = useState(true);

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
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: T.textDim, fontFamily: typography.fontFamily.sans }}>
        <div style={{ 
          background: 'linear-gradient(135deg, ' + T.accent + '40, ' + T.success + '40)',
          padding: '2rem',
          borderRadius: borderRadius.xl,
          boxShadow: shadows.xl,
          textAlign: 'center'
        }}>
          <svg style={{ animation: 'spin 1s linear infinite', width: 32, height: 32, marginBottom: '1rem' }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke={T.border} strokeWidth="3" />
            <path d="M4 12a8 8 0 018-8" stroke={T.accent} strokeWidth="3" strokeLinecap="round" />
          </svg>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium, color: T.text }}>Loading game…</div>
        </div>
      </div>
    );
  }

  const { roomId, topic, gameStatus, players, scores, currentQuestion, currentPlayerId, questionCount } = gameState;
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);
  const isMyTurn = currentPlayerId === userId;

  // ── Status label ────────────────────────────────────────────────────────────
  const statusEl = () => {
    if (gameStatus === 'waiting') return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, background: 'rgba(245,158,11,0.1)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.25)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.warning }} />
        Waiting for players · {players.length}/4
      </span>
    );
    if (gameStatus === 'in_progress') return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, background: 'rgba(16,185,129,0.1)', color: T.successLt, border: '1px solid rgba(16,185,129,0.25)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.success, boxShadow: '0 0 4px #10b981' }} />
        In Progress
      </span>
    );
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, background: 'rgba(99,102,241,0.1)', color: T.accentLt, border: '1px solid rgba(99,102,241,0.25)' }}>
        🏁 Finished
      </span>
    );
  };

  // Game room UI (rendered once gameState is available)
  return (
    <div style={{ position: 'relative', fontFamily: typography.fontFamily.sans, background: 'linear-gradient(135deg, ' + T.bg + ' 0%, #1a1f3c 100%)', minHeight: '100vh', padding: spacing[8] }}>
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 50, borderRadius: '1rem', backdropFilter: 'blur(4px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: T.textMuted, fontSize: '0.9rem' }}>
              <svg style={{ animation: 'spin 1s linear infinite', width: 20, height: 20 }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke={T.border} strokeWidth="3" />
                <path d="M4 12a8 8 0 018-8" stroke={T.accent} strokeWidth="3" strokeLinecap="round" />
              </svg>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              {loadingMessage || 'Loading…'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Room card ── */}
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35 }}
        style={{
          background: 'linear-gradient(145deg, ' + T.surface + ' 0%, ' + T.card + ' 100%)',
          border: `2px solid ${CARD_COLORS[0].hex}`,
          borderRadius: borderRadius['2xl'],
          boxShadow: `0 0 30px ${CARD_COLORS[0].glow}30, ${shadows['2xl']}`,
          overflow: 'hidden',
        }}
      >
        {/* ── Card header ── */}
        <div style={{ 
          padding: spacing[6], 
          borderBottom: `2px solid ${CARD_COLORS[0].hex}40`, 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing[3],
          background: 'linear-gradient(90deg, ' + CARD_COLORS[0].hex + '15 0%, transparent 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Room ID badge */}
            <div style={{ 
              background: CARD_COLORS[0].gradient, 
              border: `2px solid ${CARD_COLORS[0].hex}`, 
              borderRadius: borderRadius.lg, 
              padding: spacing[2] + ' ' + spacing[3],
              boxShadow: `0 4px 12px ${CARD_COLORS[0].glow}`
            }}>
              <span style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block' }}>Room</span>
              <span style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: '#fff', letterSpacing: '0.1em' }}>{roomId}</span>
            </div>
            {/* Topic */}
            <div>
              <span style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: CARD_COLORS[1].hex, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block' }}>Topic</span>
              <span style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: CARD_COLORS[1].hex, textShadow: `0 0 10px ${CARD_COLORS[1].glow}` }}>{topic}</span>
            </div>
            {statusEl()}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <motion.button
              onClick={leaveGame}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex', alignItems: 'center', gap: spacing[2],
                padding: spacing[2] + ' ' + spacing[4], borderRadius: borderRadius.md,
                background: 'transparent', border: `2px solid ${CARD_COLORS[6].hex}`,
                color: CARD_COLORS[6].hex, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium,
                cursor: 'pointer', fontFamily: typography.fontFamily.sans, transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = CARD_COLORS[6].hex; e.currentTarget.style.color = CARD_COLORS[6].hex; e.currentTarget.style.background = CARD_COLORS[6].hex + '15'; e.currentTarget.style.boxShadow = `0 4px 12px ${CARD_COLORS[6].glow}`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = CARD_COLORS[6].hex; e.currentTarget.style.color = CARD_COLORS[6].hex; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <FaSignOutAlt style={{ fontSize: typography.fontSize.sm }} /> Leave
            </motion.button>
            {isCreator && gameStatus !== 'finished' && (
              <motion.button
                onClick={endGame}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: spacing[2],
                  padding: spacing[2] + ' ' + spacing[4], borderRadius: borderRadius.md,
                  background: CARD_COLORS[7].gradient, border: `2px solid ${CARD_COLORS[7].hex}`,
                  color: '#fff', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer', fontFamily: typography.fontFamily.sans, transition: 'all 0.3s ease',
                  boxShadow: `0 4px 12px ${CARD_COLORS[7].glow}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 16px ${CARD_COLORS[7].glow}`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 4px 12px ${CARD_COLORS[7].glow}`; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <FaStopCircle style={{ fontSize: typography.fontSize.sm }} /> End Game
              </motion.button>
            )}
          </div>
        </div>

        {/* ── Progress bar (in_progress only) ── */}
        {gameStatus === 'in_progress' && questionCount !== undefined && (
          <div style={{ 
            padding: spacing[3] + ' ' + spacing[6], 
            borderBottom: `1px solid ${T.borderHi}`, 
            background: 'linear-gradient(90deg, ' + T.card + ' 0%, ' + T.surface + ' 100%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[2] }}>
              <span style={{ fontSize: typography.fontSize.xs, color: T.textDim, fontWeight: typography.fontWeight.medium }}>Question Progress</span>
              <span style={{ fontSize: typography.fontSize.xs, color: T.successLt, fontWeight: typography.fontWeight.semibold }}>{questionCount} / 10</span>
            </div>
            <div style={{ height: '6px', background: T.bg, borderRadius: borderRadius.full, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(questionCount / 10) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ 
                  height: '100%', 
                  background: 'linear-gradient(90deg, ' + T.accent + ' 0%, ' + T.success + ' 100%)', 
                  borderRadius: borderRadius.full,
                  boxShadow: '0 0 10px ' + T.accent + '40'
                }}
              />
            </div>
          </div>
        )}

        {/* ── Body ── */}
        <div style={{ padding: spacing[6] }}>

          {/* ═══ FINISHED: Scoreboard ═══ */}
          {gameStatus === 'finished' ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[5] }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                  padding: spacing[2],
                  borderRadius: borderRadius.md,
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
                  border: '2px solid #FBBF24'
                }}>
                  <FaTrophy style={{ color: '#fff', fontSize: typography.fontSize.lg }} />
                </div>
                <h3 style={{ margin: 0, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: T.text, background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Final Scoreboard</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sortedScores.map((score, index) => {
                  const player = players.find(p => p.userId === score.playerId);
                  const isMe = score.playerId === userId;
                  const rankColor = getCardColor(index);
                  return (
                    <motion.div
                      key={score.playerId}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: spacing[4],
                        padding: spacing[3] + ' ' + spacing[4], borderRadius: borderRadius.lg,
                        background: isMe 
                          ? `linear-gradient(135deg, ${rankColor.hex}20 0%, ${rankColor.hex}10 100%)` 
                          : T.card,
                        border: `2px solid ${isMe ? rankColor.hex : rankColor.hex}60`,
                        boxShadow: isMe 
                          ? `0 4px 16px ${rankColor.glow}` 
                          : `0 2px 8px ${rankColor.glow}20`,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = rankColor.hex;
                        e.currentTarget.style.boxShadow = `0 4px 16px ${rankColor.glow}`;
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = isMe ? rankColor.hex : `${rankColor.hex}60`;
                        e.currentTarget.style.boxShadow = isMe 
                          ? `0 4px 16px ${rankColor.glow}` 
                          : `0 2px 8px ${rankColor.glow}20`;
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      {/* Rank */}
                      <span style={{ 
                        width: '2rem', textAlign: 'center', fontSize: index === 0 ? '1.2rem' : '0.9rem', 
                        fontWeight: 700, color: rankColor.hex, flexShrink: 0,
                        textShadow: `0 0 10px ${rankColor.glow}`
                      }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                      </span>
                      {/* Name */}
                      <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: isMe ? 600 : 500, color: isMe ? rankColor.hex : T.text }}>
                        {player?.name || score.playerId}
                        {isMe && <span style={{ marginLeft: '0.4rem', fontSize: '0.72rem', color: rankColor.hex, opacity: 0.8 }}>(you)</span>}
                      </span>
                      {/* Score */}
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: rankColor.hex, textShadow: `0 0 8px ${rankColor.glow}` }}>{score.score}</span>
                        <span style={{ fontSize: '0.72rem', color: T.textDim, marginLeft: '0.25rem' }}>pts</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          ) : (
            <>
              {/* ═══ PLAYERS LIST ═══ */}
              <div style={{ marginBottom: spacing[5] }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[4] }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.success, flexShrink: 0, boxShadow: '0 0 8px ' + T.success + '60' }} />
                  <h3 style={{ margin: 0, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Players · {players.length}/4
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {players.map((player, playerIndex) => {
                    const isActive = player.userId === currentPlayerId && gameStatus === 'in_progress';
                    const isMe = player.userId === userId;
                    const playerScore = scores.find(s => s.playerId === player.userId)?.score || 0;
                    const playerColor = getCardColor(playerIndex);
                    return (
                      <motion.div
                        key={player.userId}
                        whileHover={!isActive ? { scale: 1.02, y: -2 } : {}}
                        style={{
                          padding: spacing[3] + ' ' + spacing[4],
                          borderRadius: borderRadius.lg,
                          background: isActive 
                            ? `linear-gradient(135deg, ${playerColor.hex}20 0%, ${playerColor.hex}10 100%)` 
                            : T.card,
                          border: `2px solid ${isActive ? playerColor.hex : playerColor.hex}60`,
                          transition: 'all 0.25s ease',
                          boxShadow: isActive 
                            ? `0 4px 16px ${playerColor.glow}` 
                            : `0 2px 8px ${playerColor.glow}20`,
                          cursor: 'default',
                        }}
                        onMouseEnter={e => {
                          if (!isActive) {
                            e.currentTarget.style.borderColor = playerColor.hex;
                            e.currentTarget.style.boxShadow = `0 4px 16px ${playerColor.glow}`;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isActive) {
                            e.currentTarget.style.borderColor = `${playerColor.hex}60`;
                            e.currentTarget.style.boxShadow = `0 2px 8px ${playerColor.glow}20`;
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {/* Avatar circle */}
                            <div style={{ 
                              width: 32, height: 32, borderRadius: '50%', 
                              background: isActive 
                                ? playerColor.gradient
                                : `linear-gradient(135deg, ${playerColor.hex}80 0%, ${playerColor.hex}40 100%)`, 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', 
                              fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: '#fff', flexShrink: 0,
                              boxShadow: isActive 
                                ? `0 4px 12px ${playerColor.glow}` 
                                : `0 2px 8px ${playerColor.glow}40`,
                              border: `2px solid ${playerColor.hex}`,
                            }}>
                              {(player.name || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: isMe ? T.accentLt : T.text }}>
                                {player.name || player.userId}
                                {isMe && <span style={{ marginLeft: spacing[1], fontSize: typography.fontSize.xs, color: T.textDim }}>(you)</span>}
                              </p>
                              {isActive && (
                                <span style={{ fontSize: typography.fontSize.xs, color: T.successLt, fontWeight: typography.fontWeight.medium }}>
                                  ▶ Current turn
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: T.text }}>{playerScore}</span>
                            <span style={{ fontSize: typography.fontSize.xs, color: T.textDim, display: 'block' }}>pts</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* ═══ START GAME (waiting + creator) ═══ */}
              {gameStatus === 'waiting' && isCreator && players.length >= 2 && (
                <motion.button
                  onClick={startGame}
                  disabled={isLoading}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: spacing[3] + ' ' + spacing[8], marginBottom: spacing[5],
                    background: 'linear-gradient(135deg, #A78BFA 0%, #60A5FA 50%, #34D399 100%)',
                    color: '#fff',
                    border: '2px solid #A78BFA', borderRadius: borderRadius.lg,
                    fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold,
                    cursor: 'pointer', fontFamily: typography.fontFamily.sans,
                    transition: 'all 0.3s ease', display: 'block',
                    boxShadow: '0 6px 20px rgba(167, 139, 250, 0.4)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(167, 139, 250, 0.6)'; e.currentTarget.style.borderColor = '#60A5FA'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(167, 139, 250, 0.4)'; e.currentTarget.style.borderColor = '#A78BFA'; }}
                >
                  Start Game →
                </motion.button>
              )}

              {gameStatus === 'waiting' && isCreator && players.length < 2 && (
                <motion.div
                  style={{ 
                    fontSize: typography.fontSize.sm, color: T.textDim, margin: '0 0 ' + spacing[5], 
                    padding: spacing[3] + ' ' + spacing[4], 
                    background: 'linear-gradient(135deg, ' + T.card + ' 0%, ' + T.surface + ' 100%)', 
                    borderRadius: borderRadius.lg, 
                    border: `1px solid ${T.borderHi}`,
                    textAlign: 'center'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Waiting for at least 2 players to start the game…
                </motion.div>
              )}

              {gameStatus === 'waiting' && !isCreator && (
                <motion.div
                  style={{ 
                    fontSize: typography.fontSize.sm, color: T.textDim, margin: '0 0 ' + spacing[5], 
                    padding: spacing[3] + ' ' + spacing[4], 
                    background: 'linear-gradient(135deg, ' + T.card + ' 0%, ' + T.surface + ' 100%)', 
                    borderRadius: borderRadius.lg, 
                    border: `1px solid ${T.borderHi}`,
                    textAlign: 'center'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Waiting for the room creator to start the game…
                </motion.div>
              )}

              {/* ═══ QUESTION ═══ */}
              {gameStatus === 'in_progress' && currentQuestion && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={questionCount}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    style={{ 
                      background: 'linear-gradient(145deg, ' + T.card + ' 0%, ' + T.surface + ' 100%)', 
                      border: `2px solid ${CARD_COLORS[2].hex}`, borderRadius: borderRadius.xl, overflow: 'hidden',
                      boxShadow: `0 8px 24px ${CARD_COLORS[2].glow}30, ${shadows.lg}`
                    }}
                  >
                    {/* Question header */}
                    <div style={{ 
                      padding: spacing[4] + ' ' + spacing[5], 
                      borderBottom: `2px solid ${CARD_COLORS[2].hex}40`, 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: `linear-gradient(90deg, ${CARD_COLORS[2].hex}15 0%, transparent 100%)`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          background: CARD_COLORS[2].gradient,
                          color: '#fff', 
                          borderRadius: borderRadius.md, 
                          padding: spacing[1] + ' ' + spacing[3], 
                          fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold,
                          boxShadow: `0 4px 12px ${CARD_COLORS[2].glow}`
                        }}>
                          Q{questionCount}
                        </span>
                        {isMyTurn && (
                          <motion.span
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            style={{ 
                              display: 'inline-flex', alignItems: 'center', gap: spacing[1], 
                              fontSize: typography.fontSize.xs, color: CARD_COLORS[4].hex, fontWeight: typography.fontWeight.semibold,
                              background: CARD_COLORS[4].hex + '20',
                              padding: spacing[1] + ' ' + spacing[2],
                              borderRadius: borderRadius.md,
                              border: `1px solid ${CARD_COLORS[4].hex}40`,
                              boxShadow: `0 0 8px ${CARD_COLORS[4].glow}`
                            }}
                          >
                            ⭐ Your Turn
                          </motion.span>
                        )}
                      </div>
                      <div style={{ 
                        background: T.card, 
                        padding: spacing[1] + ' ' + spacing[2],
                        borderRadius: borderRadius.md,
                        border: `1px solid ${T.borderHi}`
                      }}>
                        <FaClock style={{ color: T.textMuted, fontSize: typography.fontSize.sm }} />
                      </div>
                    </div>

                    <div style={{ padding: spacing[5] }}>
                      {isMyTurn ? (
                        <>
                          {/* Question text */}
                          <p style={{ 
                            margin: '0 0 ' + spacing[5], 
                            fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium, 
                            color: T.text, lineHeight: typography.lineHeight.relaxed 
                          }}>
                            {currentQuestion.question}
                          </p>

                          {/* Options */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: spacing[3], marginBottom: spacing[4] }}>
                            {currentQuestion.options.map((option, index) => {
                              const letters = ['A', 'B', 'C', 'D'];
                              const isSelected = currentAnswer === option;
                              const optionColor = getCardColor(index);
                              return (
                                <motion.button
                                  key={index}
                                  onClick={() => setCurrentAnswer(option)}
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.99 }}
                                  disabled={isLoading}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: spacing[3],
                                    padding: spacing[3] + ' ' + spacing[4], borderRadius: borderRadius.lg,
                                    background: isSelected 
                                      ? optionColor.gradient
                                      : T.card,
                                    border: `2px solid ${isSelected ? optionColor.hex : optionColor.hex}40`,
                                    color: isSelected ? '#fff' : T.textMuted,
                                    fontSize: typography.fontSize.base, fontWeight: isSelected ? typography.fontWeight.semibold : typography.fontWeight.normal,
                                    cursor: 'pointer', fontFamily: typography.fontFamily.sans,
                                    textAlign: 'left', transition: 'all 0.3s ease',
                                    boxShadow: isSelected 
                                      ? `0 4px 16px ${optionColor.glow}` 
                                      : `0 2px 8px ${optionColor.glow}20`,
                                  }}
                                  onMouseEnter={e => { 
                                    if (!isSelected) { 
                                      e.currentTarget.style.borderColor = optionColor.hex; 
                                      e.currentTarget.style.color = T.text;
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                      e.currentTarget.style.boxShadow = `0 4px 16px ${optionColor.glow}`;
                                    } 
                                  }}
                                  onMouseLeave={e => { 
                                    if (!isSelected) { 
                                      e.currentTarget.style.borderColor = `${optionColor.hex}40`; 
                                      e.currentTarget.style.color = T.textMuted;
                                      e.currentTarget.style.transform = 'translateY(0)';
                                      e.currentTarget.style.boxShadow = `0 2px 8px ${optionColor.glow}20`;
                                    } 
                                  }}
                                >
                                  <span style={{ 
                                    width: spacing[6], height: spacing[6], borderRadius: borderRadius.md, 
                                    background: isSelected ? '#fff' : optionColor.gradient, 
                                    color: isSelected ? optionColor.hex : '#fff', 
                                    fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    boxShadow: isSelected ? shadows.sm : `0 2px 8px ${optionColor.glow}`,
                                    border: `1px solid ${optionColor.hex}`,
                                  }}>
                                    {letters[index]}
                                  </span>
                                  {option}
                                </motion.button>
                              );
                            })}
                          </div>

                          {/* Submit */}
                          <motion.button
                            onClick={submitAnswer}
                            disabled={isLoading || !currentAnswer}
                            whileHover={(!isLoading && currentAnswer) ? { scale: 1.02, y: -2 } : {}}
                            whileTap={(!isLoading && currentAnswer) ? { scale: 0.98 } : {}}
                            style={{
                              padding: spacing[3] + ' ' + spacing[7],
                              background: currentAnswer 
                                ? CARD_COLORS[3].gradient
                                : T.card,
                              color: currentAnswer ? '#fff' : T.textDim,
                              border: `2px solid ${currentAnswer ? CARD_COLORS[3].hex : T.borderHi}`,
                              borderRadius: borderRadius.lg,
                              fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold,
                              cursor: (isLoading || !currentAnswer) ? 'not-allowed' : 'pointer',
                              fontFamily: typography.fontFamily.sans, transition: 'all 0.3s ease',
                              boxShadow: currentAnswer 
                                ? `0 6px 20px ${CARD_COLORS[3].glow}` 
                                : shadows.sm,
                            }}
                            onMouseEnter={e => { if (currentAnswer) { e.currentTarget.style.boxShadow = `0 8px 24px ${CARD_COLORS[3].glow}`; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                            onMouseLeave={e => { if (currentAnswer) { e.currentTarget.style.boxShadow = `0 6px 20px ${CARD_COLORS[3].glow}`; e.currentTarget.style.transform = 'translateY(0)'; } }}
                          >
                            Submit Answer
                          </motion.button>
                        </>
                      ) : (
                        <div style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', color: T.textMuted }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.success, animation: 'pulse 1.5s ease-in-out infinite' }} />
                          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
                          <span style={{ fontSize: '0.875rem' }}>
                            Waiting for{' '}
                            <strong style={{ color: T.text }}>{players.find(p => p.userId === currentPlayerId)?.name || 'player'}</strong>
                            {' '}to answer…
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default GameRoom;