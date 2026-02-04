import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';
import GameRoom from '../components/GameRoom';
import Watermark from '../components/Watermark';
import { FaGamepad } from 'react-icons/fa';

// Use environment variable (same as your other components)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-[#2DD4BF] to-[#A855F7] text-[#1E1B4B] p-8 relative overflow-hidden"
    >
      <Watermark />
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold text-[#E5E7EB] mb-8 text-center"
        >
          Relay Quiz Game <FaGamepad className="inline-block text-[#1E1B4B]" />
        </motion.h1>

        {/* Connection Status */}
        <div className="text-center mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-sm ${
            socketConnected 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {socketConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>

        {!isJoined ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-[#E5E7EB]/80 rounded-2xl shadow-2xl p-8 mb-8 border border-[#1E1B4B]/20"
          >
            <input
              type="text"
              placeholder="Room ID (optional for creating, 5 digits for joining)"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="w-full p-4 mb-4 rounded-lg border border-[#1E1B4B]/20 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
            />
            <input
              type="text"
              placeholder="Topic (e.g., Operating System, Mathematics, History)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-4 mb-4 rounded-lg border border-[#1E1B4B]/20 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
            />
            <div className="flex space-x-4">
              <motion.button
                onClick={createRoom}
                disabled={!socketConnected}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#1E1B4B] text-[#2DD4BF] px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Room
              </motion.button>
              <motion.button
                onClick={joinRoom}
                disabled={!socketConnected}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#1E1B4B] text-[#A855F7] px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Room
              </motion.button>
            </div>
          </motion.div>
        ) : (
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
          />
        )}
      </div>
    </motion.div>
  );
};

export default RelayGame;