const io = require('socket.io-client');
const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 15,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
  const roomId = '54628'; // Use correct roomId from database
  const userId = '688672c94150541ed0a29ac8'; // Matches creatorId
  socket.emit('joinRoom', { roomId, userId }, (response) => {
    if (response && response.error) {
      console.error('Join room failed:', response.error);
    } else {
      console.log('Join room successful');
    }
  });
  setTimeout(() => {
    socket.emit('startGame', { roomId }, (response) => {
      if (response && response.error) {
        console.error('Start game failed:', response.error);
      } else {
        console.log('Start game event emitted successfully');
      }
    });
  }, 1000); // Delay to ensure joinRoom completes
});

socket.on('playerJoined', (data) => {
  console.log('Player joined:', data);
});

socket.on('gameState', (data) => {
  console.log('Game state:', data);
});

socket.on('gameStarted', (data) => {
  console.log('Game started:', JSON.stringify(data, null, 2));
});

socket.on('nextQuestion', (data) => {
  console.log('Next question:', data);
});

socket.on('error', (data) => {
  console.error('Error:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});