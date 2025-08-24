require('dotenv').config({ path: './.env' });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const http = require('http');
const socketIo = require('socket.io');
const AuthRouter = require('./Routes/AuthRouter');
const MessageRouter = require('./Routes/MessageRouter');
const QuestionRouter = require('./Routes/QuestionRouter');
const NotesRouter = require('./Routes/NotesRouter');
const StudyPlannerRouter = require('./Routes/StudyPlannerRouter');
const QuizRouter = require('./Routes/QuizRouter');
const ChatbotRouter = require('./Routes/ChatbotRouter');
const profileRoutes = require('./Routes/ProfileRouter');
const gameRoutes = require('./Routes/GameRouter');
const initializeGameSocket = require('./Sockets/GameSocket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://hoppscotch.io', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
  pingInterval: 25000,
  allowEIO3: true,
});

// Logger setup
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

// Debug: Log environment variables
console.log('PORT:', process.env.PORT);
console.log('MONGO_URL:', process.env.MONGO_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    logger.info('MongoDB Connected');
  })
  .catch((err) => {
    logger.error('MongoDB Connection Error:', { error: err.message });
  });

// Rate limiters
const userObjectIdLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Allow 100 requests per window per IP
  message: 'Too many requests to fetch user ID, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://hoppscotch.io'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());
app.use('/api/game/user-object-id', userObjectIdLimiter); // Specific rate limiter for user-object-id
app.use(generalLimiter); // General rate limiter for other routes
app.use((req, res, next) => {
  logger.info(`Request: ${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/ding', (req, res) => {
  res.send('Dong');
});
app.use('/auth', AuthRouter);
app.use('/api/messages', MessageRouter);
app.use('/api/questions', QuestionRouter);
app.use('/api/notes', NotesRouter);
app.use('/api/study-planner', StudyPlannerRouter);
app.use('/api/quiz', QuizRouter);
app.use('/api/chatbot', ChatbotRouter);
app.use('/api/profile', profileRoutes);
app.use('/api/game', gameRoutes);

// Initialize Socket.IO
initializeGameSocket(io);

// Reminder Cron Job
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const subjects = await require('./Models/StudyPlanSubject').find({
      deadline: { $lte: threeDaysFromNow },
    });
    for (const subject of subjects) {
      const topics = subject.topics.filter(t => !t.completed && t.endTime <= threeDaysFromNow);
      if (topics.length > 0) {
        logger.info(`Reminder: Subject ${subject.name} has ${topics.length} topics due soon`);
      }
    }
  } catch (err) {
    logger.error('Cron reminder error:', { error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server is running at ${PORT}`);
});