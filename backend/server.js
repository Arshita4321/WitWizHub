require('dotenv').config({ path: './.env' });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const AuthRouter = require('./Routes/AuthRouter');
const MessageRouter = require('./Routes/MessageRouter');
const QuestionRouter = require('./Routes/QuestionRouter');
const NotesRouter = require('./Routes/NotesRouter');
const StudyPlannerRouter = require('./Routes/StudyPlannerRouter');

const app = express();

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

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
  });

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'https://hoppscotch.io'] }));
app.use(express.json());
app.use(bodyParser.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
}));
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
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
        console.log(`Reminder: Subject ${subject.name} has ${topics.length} topics due soon`);
        // Frontend notification (e.g., WebSocket) can be added here
      }
    }
  } catch (err) {
    console.error('Cron reminder error:', err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});