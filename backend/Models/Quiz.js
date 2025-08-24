const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  topic: { type: String, required: true },
});

const quizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  topics: [{ type: String, required: true }],
  level: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now },
});

const quizResultSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ questionId: mongoose.Schema.Types.ObjectId, selectedAnswer: String }],
  score: { type: Number, required: true },
  incorrectTopics: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const Quiz = mongoose.model('Quiz', quizSchema);
const QuizResult = mongoose.model('QuizResult', quizResultSchema);

module.exports = { Quiz, QuizResult };