const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
});

const QuizRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^\d{5}$/.test(v);
      },
      message: 'roomId must be a 5-digit number',
    },
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  players: {
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    required: true,
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length >= 1 && v.length <= 4;
      },
      message: 'Players array must have 1 to 4 players',
    },
  },
  currentPlayerIndex: {
    type: Number,
    default: 0,
  },
  currentQuestion: {
    type: String,
    default: null,
  },
  gameStatus: {
    type: String,
    enum: ['waiting', 'in_progress', 'finished'],
    default: 'waiting',
  },
  topic: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  scores: {
    type: [ScoreSchema],
    default: [],
  },
  currentQuestionAttempts: {
    type: Number,
    default: 0,
  },
  questionCount: {
    type: Number,
    default: 0, // Ensure questionCount is initialized
  },
  usedQuestions: {
    type: [String], // Array to store previously asked questions
    default: [],
  },
  difficultyOrder: {
    type: [String], // Array to store the predetermined difficulty order
    default: [],
  },
});

module.exports = mongoose.model('QuizRoom', QuizRoomSchema);