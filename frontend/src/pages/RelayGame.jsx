import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';
import GameRoom from '../components/GameRoom';
import Watermark from '../components/Watermark';
import {
  FaGamepad, FaBolt, FaRocket, FaKey, FaClipboard, FaTrophy, FaMedal,
  FaChartLine, FaCrown, FaStar, FaUsers, FaDoorOpen, FaUserPlus,
  FaQuestion, FaBullseye, FaChevronDown,
} from 'react-icons/fa';
import { API_BASE_URL } from "../config/api.js";

// Use environment variable (same as your other components)

let socket = null;

const RelayGame = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [topic, setTopic] = useState('');
  const [gameState, setGameState] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [userId, setUserId] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [playerCount, setPlayerCount] = useState(4);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;

    if (socket) {
      socket.disconnect();
    }

    socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      withCredentials: true,
      auth: { token },
    });

    return socket;
  }, []);

  // Socket event handlers
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      toast.error('Please log in to play the game');
      navigate('/login');
      return;
    }

    // Initialize socket
    const socketInstance = initializeSocket();
    if (!socketInstance) return;

    // Fetch user ID
    const fetchUserId = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/game/user-object-id`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`User ObjectId fetch failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('User ObjectId response:', data);
        
        if (!data.userObjectId) {
          throw new Error('No userObjectId found in response');
        }
        
        setUserId(data.userObjectId);
      } catch (error) {
        console.error('Fetch user ObjectId error:', error);
        toast.error('Failed to fetch user ID: ' + error.message);
        navigate('/login');
      }
    };

    fetchUserId();

    // Socket event listeners
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setSocketConnected(true);
      toast.success('Connected to game server');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connect error:', error.message);
      setSocketConnected(false);
      toast.error('Failed to connect to server: ' + error.message);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
      toast.info('Disconnected from server');
    });

    socketInstance.on('playerJoined', (data) => {
      console.log('Player joined:', data);
      toast.success(`${data.name || data.userId} joined the game!`);
    });

    socketInstance.on('playerLeft', (data) => {
      console.log('Player left:', data);
      toast.info(`${data.name || data.userId} left the game`);
    });

    socketInstance.on('gameState', (data) => {
      console.log('Game state received:', data);
      setGameState(prevState => {
        const newState = {
          ...data,
          players: data.players || [],
          scores: data.scores || [],
          currentPlayerId: data.currentPlayerId,
          questionCount: data.questionCount || 0,
        };
        
        // Update creator status
        if (data.creatorId === userId) {
          setIsCreator(true);
        }
        
        console.log('Updated game state:', newState);
        return newState;
      });
    });

    socketInstance.on('gameStarted', (data) => {
      console.log('Game started event received:', data);
      toast.success('Game started!');
      setGameState(prevState => ({
        ...prevState,
        gameStatus: 'in_progress',
        questionCount: 1,
      }));
    });

    socketInstance.on('correctAnswer', (data) => {
      console.log('Correct answer:', data);
      toast.success(`✅ Correct answer by ${data.name}! +10 points`);
      setCurrentAnswer('');
    });

    socketInstance.on('wrongAnswer', (data) => {
      console.log('Wrong answer:', data);
      toast.error(`❌ Wrong answer by ${data.name}! -5 points`);
      setCurrentAnswer('');
    });

    socketInstance.on('noAnswer', (data) => {
      console.log('No answer:', data);
      toast.info(`⏰ ${data.name} didn't answer in time`);
      setCurrentAnswer('');
    });

    socketInstance.on('scoreUpdate', (data) => {
      console.log('Score update:', data);
      setGameState(prevState => ({
        ...prevState,
        scores: data.scores,
      }));
    });

    socketInstance.on('gameEnded', (data) => {
      console.log('Game ended:', data);
      setGameState(prevState => ({
        ...prevState,
        gameStatus: 'finished',
        currentQuestion: null,
        currentPlayerId: null,
      }));
      toast.info('🏁 Game has ended! Check the scoreboard.');
    });

    socketInstance.on('error', (data) => {
      console.error('Socket error:', data);
      toast.error(data.message);
    });

    // Cleanup
    return () => {
      if (socketInstance) {
        socketInstance.removeAllListeners();
        socketInstance.disconnect();
      }
    };
  }, [navigate, initializeSocket, userId]);

  const createRoom = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    
    if (!userId) {
      toast.error('User ID not loaded. Please try again.');
      return;
    }
    
    const roomIdToUse = roomId || Math.floor(10000 + Math.random() * 90000).toString();
    
    try {
      console.log('Creating room with:', { topic, roomId: roomIdToUse, userId });
      
      const response = await fetch(`${API_BASE_URL}/api/game/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: topic.trim(), roomId: roomIdToUse }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || response.statusText);
      }
      
      const data = await response.json();
      console.log('Create room response:', data);
      
      setRoomId(data.roomId);
      setIsCreator(true);
      setIsJoined(true);
      
      // Join the socket room
      if (socket && socketConnected) {
        socket.emit('joinRoom', { roomId: data.roomId, userId }, (response) => {
          if (response && response.error) {
            console.error('Join room failed:', response.error);
            toast.error('Failed to join room: ' + response.error);
          } else {
            console.log('Successfully joined room');
          }
        });
      }
      
      toast.success('Room created successfully!');
      
    } catch (error) {
      console.error('Create room error:', error);
      toast.error('Failed to create room: ' + error.message);
    }
  };

  const joinRoom = async () => {
    if (!roomId || !/^\d{5}$/.test(roomId)) {
      toast.error('Please enter a valid 5-digit room ID');
      return;
    }
    
    if (!userId) {
      toast.error('User ID not loaded. Please try again.');
      return;
    }
    
    try {
      console.log('Joining room:', { roomId, userId });
      
      const response = await fetch(`${API_BASE_URL}/api/game/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 400 && errorData.error === 'You are already in this room') {
          setIsJoined(true);
          
          // Join the socket room
          if (socket && socketConnected) {
            socket.emit('joinRoom', { roomId, userId }, (response) => {
              if (response && response.error) {
                console.error('WebSocket joinRoom failed:', response.error);
                toast.error('Failed to join room (WebSocket): ' + response.error);
              } else {
                console.log('WebSocket joinRoom successful');
              }
            });
          }
          
          toast.success('Already in room, joined successfully!');
          return;
        }
        
        throw new Error(errorData.error || response.statusText);
      }
      
      const data = await response.json();
      console.log('Join room response:', data);
      
      setIsJoined(true);
      
      // Join the socket room
      if (socket && socketConnected) {
        socket.emit('joinRoom', { roomId, userId }, (response) => {
          if (response && response.error) {
            console.error('Join room failed:', response.error);
            toast.error('Failed to join room: ' + response.error);
          } else {
            console.log('Join room successful');
          }
        });
      }
      
      toast.success('Joined room successfully!');
      
    } catch (error) {
      console.error('Join room error:', error);
      toast.error('Failed to join room: ' + error.message);
    }
  };

  const startGame = async () => {
    if (!roomId) {
      console.error('Cannot start game: roomId is empty');
      toast.error('Cannot start game: No room ID');
      return;
    }
    
    if (!isCreator) {
      console.error('Cannot start game: user is not creator');
      toast.error('Only the room creator can start the game');
      return;
    }
    
    if (!socket || !socketConnected) {
      toast.error('Not connected to server');
      return;
    }
    
    console.log('Starting game:', { roomId, userId });
    
    socket.emit('startGame', { roomId }, (response) => {
      if (response && response.error) {
        console.error('Start game failed:', response.error);
        toast.error('Failed to start game: ' + response.error);
      } else {
        console.log('Start game successful');
      }
    });
  };

  const submitAnswer = async () => {
    if (!currentAnswer) {
      toast.error('Please select an answer');
      return;
    }
    
    if (!socket || !socketConnected) {
      toast.error('Not connected to server');
      return;
    }
    
    console.log('Submitting answer:', { roomId, userId, answer: currentAnswer });
    
    socket.emit('submitAnswer', { roomId, answer: currentAnswer }, (response) => {
      if (response && response.error) {
        console.error('Submit answer failed:', response.error);
        toast.error('Failed to submit answer: ' + response.error);
      } else {
        console.log('Answer submitted successfully:', response);
      }
    });
  };

  const skipQuestion = async () => {
    if (!socket || !socketConnected) {
      toast.error('Not connected to server');
      return;
    }
    
    console.log('Skipping question:', { roomId, userId });
    
    socket.emit('submitAnswer', { roomId, answer: null }, (response) => {
      if (response && response.error) {
        console.error('Skip question failed:', response.error);
        toast.error('Failed to skip question: ' + response.error);
      } else {
        console.log('Question skipped successfully:', response);
      }
    });
  };

  const leaveGame = async () => {
    if (!roomId) {
      toast.error('No room to leave');
      return;
    }
    
    if (!socket || !socketConnected) {
      toast.error('Not connected to server');
      return;
    }
    
    console.log('Leaving game:', { roomId, userId });
    
    socket.emit('leaveGame', { roomId }, (response) => {
      if (response && response.error) {
        console.error('Leave game failed:', response.error);
        toast.error('Failed to leave game: ' + response.error);
      } else {
        console.log('Leave game successful');
        setIsJoined(false);
        setGameState(null);
        setRoomId('');
        setTopic('');
        setIsCreator(false);
        toast.success('You have left the game');
      }
    });
  };

  const endGame = async () => {
    if (!roomId) {
      toast.error('No room to end');
      return;
    }
    
    if (!isCreator) {
      toast.error('Only the creator can end the game');
      return;
    }
    
    if (!socket || !socketConnected) {
      toast.error('Not connected to server');
      return;
    }
    
    console.log('Ending game:', { roomId, userId });
    
    socket.emit('endGame', { roomId }, (response) => {
      if (response && response.error) {
        console.error('End game failed:', response.error);
        toast.error('Failed to end game: ' + response.error);
      } else {
        console.log('End game successful');
        toast.success('Game ended by creator');
      }
    });
  };

  const pasteRoomId = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const digits = text.replace(/\D/g, '').slice(0, 5);
      if (digits) {
        setRoomId(digits);
      } else {
        toast.error('Clipboard does not contain a valid room ID');
      }
    } catch (error) {
      toast.error('Could not read from clipboard');
    }
  };

  // ── Design tokens ──────────────────────────────────────────────────────────
  const T = {
    bg:         '#0f172a',
    surface:    '#1e293b',
    card:       '#162032',
    border:     '#334155',
    borderHi:   '#475569',
    text:       '#f1f5f9',
    textMuted:  '#94a3b8',
    textDim:    '#64748b',
    accent:     '#6366f1',
    accentLt:   '#a5b4fc',
    accentBg:   'rgba(99,102,241,0.08)',
    success:    '#10b981',
    danger:     '#ef4444',
  };

  // Palette matching the reference design
  const purple = { hex: '#A78BFA', grad: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', glow: 'rgba(167,139,250,0.4)' };
  const blue   = { hex: '#60A5FA', grad: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)', glow: 'rgba(96,165,250,0.4)' };
  const green  = { hex: '#34D399', grad: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)', glow: 'rgba(52,211,153,0.4)' };
  const gold   = { hex: '#FBBF24', grad: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)', glow: 'rgba(251,191,36,0.4)' };
  const rose   = { hex: '#FB7185', grad: 'linear-gradient(135deg, #FB7185 0%, #F43F5E 100%)', glow: 'rgba(251,113,133,0.4)' };
  const pink   = { hex: '#F472B6', grad: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)', glow: 'rgba(244,114,182,0.4)' };

  const inputSt = {
    width: '100%',
    background: 'rgba(15, 23, 42, 0.8)',
    border: `2px solid ${T.border}`,
    borderRadius: '0.75rem',
    color: T.text,
    fontSize: '0.95rem',
    padding: '0.75rem 1rem',
    outline: 'none',
    fontFamily: 'Inter, "Segoe UI", system-ui, sans-serif',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  const difficultyPalette = { easy: green, medium: gold, hard: rose };

  const howToPlaySteps = [
    { icon: FaUsers,     color: purple, title: '1. Create or Join', desc: 'Create a room or join with a 5-digit ID' },
    { icon: FaGamepad,   color: green,  title: '2. Play with Friends', desc: 'At least 2 players\nMax 4 players' },
    { icon: FaQuestion,  color: gold,   title: '3. Answer Questions', desc: 'Take turns answering\n10 multiple-choice questions' },
    { icon: FaTrophy,    color: pink,   title: '4. Win the Game', desc: 'Highest score at the end\nwins the game!' },
  ];

  const liveRooms = [
    { name: 'Math Wizards',   icon: '✕✕', color: purple, players: 3 },
    { name: 'History Buffs',  icon: '🏛',  color: green,  players: 2 },
    { name: 'OS Masters',     icon: '🖥',  color: blue,   players: 4 },
  ];

  const yourStats = [
    { icon: FaTrophy,     color: gold,  value: '12',  label: 'Total Games' },
    { icon: FaBullseye,   color: green, value: '78%', label: 'Accuracy' },
    { icon: FaMedal,      color: gold,  value: '7',   label: 'Wins' },
    { icon: FaChartLine,  color: rose,  value: '#14', label: 'Global Rank' },
  ];

  const leaderboard = [
    { name: 'QuizMaster', score: 2450, medal: gold },
    { name: 'Brainiac',   score: 2110, medal: '#94A3B8' },
    { name: 'ThinkPro',   score: 1980, medal: '#cd7f32' },
    { name: 'Arshita',    score: 1680, rank: 4, isMe: true },
  ];

  const sectionCardSt = {
    background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
    borderRadius: '1.5rem',
    padding: '1.5rem',
    backdropFilter: 'blur(10px)',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', fontFamily: 'Inter, "Segoe UI", system-ui, sans-serif', padding: isJoined ? '2.5rem 1rem' : '3.75rem 1.5rem' }}>
      <Watermark />

      {!isJoined ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{ maxWidth: '1200px', margin: '0 auto' }}
        >
          {/* ── Hero ── */}
          <div style={{ position: 'relative', textAlign: 'center', marginBottom: '3.75rem' }}>
            {/* Decorative trophy (left) */}
            <div style={{ position: 'absolute', left: 0, top: '-10px', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.9 }} className="relay-hero-decor">
              <div style={{
                width: 130, height: 130, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, rgba(167,139,250,0) 70%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FaTrophy style={{ fontSize: '58px', color: gold.hex, filter: `drop-shadow(0 0 16px ${gold.glow})` }} />
              </div>
            </div>

            {/* Decorative gamepad (right) */}
            <div style={{ position: 'absolute', right: 0, top: '-10px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.9 }} className="relay-hero-decor">
              <div style={{
                width: 130, height: 130, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0) 70%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FaGamepad style={{ fontSize: '58px', color: purple.hex, filter: `drop-shadow(0 0 16px ${purple.glow})` }} />
              </div>
            </div>

            <span style={{
              display: 'inline-block', padding: '0.3rem 0.9rem', borderRadius: '999px',
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
              color: T.accentLt, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: '1rem',
            }}>
              Multiplayer
            </span>

            <h1 style={{ margin: '0 0 0.75rem', fontSize: '3.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              <span style={{ color: T.text }}>Relay </span>
              <span style={{
                background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Quiz</span>{' '}
              <FaBolt style={{ fontSize: '2rem', color: '#818CF8', verticalAlign: 'middle', filter: 'drop-shadow(0 0 10px rgba(129,140,248,0.7))' }} />
            </h1>

            <p style={{ margin: '0 0 1.25rem', fontSize: '1rem', color: T.textMuted }}>
              Take turns answering questions — outscore your opponents to win!
            </p>

            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 500,
              background: socketConnected ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
              color: socketConnected ? green.hex : '#fca5a5',
              border: `1px solid ${socketConnected ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: socketConnected ? green.hex : T.danger, boxShadow: socketConnected ? `0 0 8px ${green.hex}` : 'none' }} />
              {socketConnected ? 'Connected to server' : 'Disconnected'}
            </span>
          </div>

          {/* ── Create / Join cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3.75rem' }} className="relay-two-col">
            {/* Create a Room */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              style={{ ...sectionCardSt, border: '2px solid rgba(167, 139, 250, 0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', padding: '2rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '0.9rem', background: purple.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 14px ${purple.glow}` }}>
                  <FaUserPlus style={{ color: '#fff', fontSize: '1.15rem' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: T.text }}>Create a Room</h2>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', color: T.textMuted }}>Setup your room, invite friends and start the game</p>
                </div>
              </div>

              {/* Topic */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: T.textMuted, marginBottom: '0.5rem' }}>Topic</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="e.g. Operating Systems, Mathematics, History"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    style={{ ...inputSt, paddingRight: '2.5rem' }}
                    onFocus={e => { e.target.style.borderColor = purple.hex; }}
                    onBlur={e => { e.target.style.borderColor = T.border; }}
                  />
                  <FaChevronDown style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: T.textDim, fontSize: '0.8rem', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Difficulty */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: T.textMuted, marginBottom: '0.5rem' }}>Difficulty</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['easy', 'medium', 'hard'].map((diff) => {
                    const c = difficultyPalette[diff];
                    const active = difficulty === diff;
                    return (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        style={{
                          flex: 1, padding: '0.7rem', borderRadius: '0.75rem',
                          background: active ? c.grad : 'rgba(15, 23, 42, 0.8)',
                          border: `2px solid ${active ? c.hex : T.border}`,
                          color: active ? '#fff' : T.textMuted,
                          fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                          transition: 'all 0.15s', fontFamily: 'inherit',
                        }}
                      >
                        {diff === 'medium' && <FaStar style={{ fontSize: '0.7rem' }} />}
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Players */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: T.textMuted, marginBottom: '0.5rem' }}>Players</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: T.textDim }}>2</span>
                  <input
                    type="range" min="2" max="4" value={playerCount}
                    onChange={(e) => setPlayerCount(Number(e.target.value))}
                    style={{ flex: 1, accentColor: purple.hex, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: T.textDim }}>4</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: T.textDim, marginTop: '0.35rem' }}>Max 4 players</div>
              </div>

              <motion.button
                onClick={createRoom}
                disabled={!socketConnected}
                whileHover={socketConnected ? { scale: 1.02 } : {}}
                whileTap={socketConnected ? { scale: 0.98 } : {}}
                style={{
                  width: '100%', padding: '0.95rem', borderRadius: '0.75rem',
                  background: socketConnected ? purple.grad : T.card,
                  border: 'none', color: socketConnected ? '#fff' : T.textDim,
                  fontSize: '1rem', fontWeight: 600, cursor: socketConnected ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem',
                  boxShadow: socketConnected ? `0 4px 20px ${purple.glow}` : 'none', fontFamily: 'inherit',
                }}
              >
                <FaRocket /> Create Game
              </motion.button>
            </motion.div>

            {/* Join a Room */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
              style={{ ...sectionCardSt, border: '2px solid rgba(96, 165, 250, 0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', padding: '2rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '0.9rem', background: blue.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 14px ${blue.glow}` }}>
                  <FaDoorOpen style={{ color: '#fff', fontSize: '1.15rem' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: T.text }}>Join a Room</h2>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', color: T.textMuted }}>Enter the 5-digit room ID shared by host</p>
                </div>
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: T.textMuted, marginBottom: '0.5rem' }}>Room ID</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Enter 5-digit room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    style={{ ...inputSt, flex: 1, letterSpacing: '0.15em' }}
                    onFocus={e => { e.target.style.borderColor = blue.hex; }}
                    onBlur={e => { e.target.style.borderColor = T.border; }}
                  />
                  <button
                    onClick={pasteRoomId}
                    title="Paste room ID from clipboard"
                    style={{
                      padding: '0 1rem', borderRadius: '0.75rem', background: 'rgba(71, 85, 105, 0.35)',
                      border: `2px solid ${T.border}`, color: T.textMuted, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <FaClipboard />
                  </button>
                </div>
              </div>

              {/* Spacer to align Join button with Create button */}
              <div style={{ height: '4.6rem' }} />

              <motion.button
                onClick={joinRoom}
                disabled={!socketConnected}
                whileHover={socketConnected ? { scale: 1.02 } : {}}
                whileTap={socketConnected ? { scale: 0.98 } : {}}
                style={{
                  width: '100%', padding: '0.95rem', borderRadius: '0.75rem',
                  background: socketConnected ? blue.grad : T.card,
                  border: 'none', color: socketConnected ? '#fff' : T.textDim,
                  fontSize: '1rem', fontWeight: 600, cursor: socketConnected ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem',
                  boxShadow: socketConnected ? `0 4px 20px ${blue.glow}` : 'none', fontFamily: 'inherit',
                }}
              >
                <FaKey /> Join Game
              </motion.button>
            </motion.div>
          </div>

          {/* ── How to play ── */}
          <div style={{ marginBottom: '3.75rem' }}>
            <div style={{ ...sectionCardSt, border: `1px solid ${T.border}`, padding: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', padding: '1.75rem' }} className="relay-four-col">
                {howToPlaySteps.map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.08 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}
                  >
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${step.color.hex}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <step.icon style={{ fontSize: '1.4rem', color: step.color.hex }} />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 0.35rem', fontSize: '0.95rem', fontWeight: 700, color: T.text }}>{step.title}</h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: T.textMuted, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Live Rooms / Your Stats / Leaderboard ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '3.75rem' }} className="relay-three-col">
            {/* Live Rooms */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              style={{ ...sectionCardSt, border: '2px solid rgba(52, 211, 153, 0.3)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaGamepad style={{ color: green.hex, fontSize: '0.95rem' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: T.text }}>Live Rooms</h3>
                </div>
                <a href="#" style={{ fontSize: '0.8rem', color: green.hex, textDecoration: 'none' }}>View all →</a>
              </div>
              {liveRooms.map((room, i) => {
                const full = room.players >= 4;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.7rem 0.85rem', borderRadius: '0.75rem', background: 'rgba(15,23,42,0.5)', marginBottom: '0.6rem', border: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '0.6rem', background: `${room.color.hex}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>{room.icon}</div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: T.text, whiteSpace: 'nowrap' }}>{room.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.78rem', color: T.textMuted }}>{room.players} / 4 players</span>
                      <button disabled={full} style={{
                        padding: '0.35rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.78rem', fontWeight: 600,
                        background: full ? 'rgba(148,163,184,0.15)' : 'rgba(52,211,153,0.15)',
                        border: `1px solid ${full ? T.textDim : green.hex}`,
                        color: full ? T.textDim : green.hex,
                        cursor: full ? 'not-allowed' : 'pointer',
                      }}>
                        {full ? 'Full' : 'Join'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Your Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
              style={{ ...sectionCardSt, border: '2px solid rgba(251, 191, 36, 0.3)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <FaChartLine style={{ color: gold.hex, fontSize: '0.95rem' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: T.text }}>Your Stats</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                {yourStats.map((stat, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.4rem', padding: '0.85rem 0.5rem', borderRadius: '0.75rem', background: 'rgba(15,23,42,0.5)' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${stat.color.hex}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <stat.icon style={{ fontSize: '1rem', color: stat.color.hex }} />
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: T.text }}>{stat.value}</div>
                    <div style={{ fontSize: '0.72rem', color: T.textMuted }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Leaderboard */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
              style={{ ...sectionCardSt, border: '2px solid rgba(244, 114, 182, 0.3)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaCrown style={{ color: pink.hex, fontSize: '0.95rem' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: T.text }}>Leaderboard</h3>
                </div>
                <a href="#" style={{ fontSize: '0.8rem', color: pink.hex, textDecoration: 'none' }}>View full →</a>
              </div>
              {leaderboard.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '0.75rem',
                  background: p.isMe ? 'rgba(99,102,241,0.15)' : 'rgba(15,23,42,0.5)',
                  border: p.isMe ? `1px solid ${T.accent}` : '1px solid transparent',
                  marginBottom: '0.5rem',
                }}>
                  {p.medal ? (
                    <FaMedal style={{ fontSize: '1.15rem', color: p.medal === gold ? gold.hex : p.medal }} />
                  ) : (
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: T.card, border: `1px solid ${T.borderHi}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: T.textMuted }}>{p.rank}</div>
                  )}
                  <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600, color: T.text }}>{p.name}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: T.text }}>{p.score}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Premium banner ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
            style={{
              padding: '1.5rem 2rem', borderRadius: '1.5rem',
              background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.08) 100%)',
              border: '2px solid rgba(251,191,36,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <FaCrown style={{ fontSize: '1.9rem', color: gold.hex }} />
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500, color: T.text }}>
                Unlock Premium for exclusive themes, avatars and power-ups!
              </p>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
              padding: '0.75rem 1.5rem', borderRadius: '0.75rem', background: purple.grad, border: 'none',
              color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap',
              boxShadow: `0 4px 16px ${purple.glow}`,
            }}>
              <FaBolt /> Upgrade Now
            </motion.button>
          </motion.div>

          <style>{`
            @media (max-width: 900px) {
              .relay-two-col, .relay-three-col, .relay-four-col { grid-template-columns: 1fr !important; }
              .relay-hero-decor { display: none !important; }
            }
          `}</style>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{ maxWidth: '860px', margin: '0 auto' }}
        >
          <GameRoom
            gameState={gameState}
            isCreator={isCreator}
            startGame={startGame}
            submitAnswer={submitAnswer}
            skipQuestion={skipQuestion}
            leaveGame={leaveGame}
            endGame={endGame}
            currentAnswer={currentAnswer}
            setCurrentAnswer={setCurrentAnswer}
            userId={userId}
            socketConnected={socketConnected}
            socket={socket}
          />
        </motion.div>
      )}
    </div>
  );
};

export default RelayGame;