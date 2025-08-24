const express = require('express');
const router = express.Router();
const { generateAIQuestions, generateAIRevisionSheet } = require('../Services/aiService');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const Joi = require('joi');

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

const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    logger.error('No token provided', { endpoint: '/api/quiz/generate', method: 'POST' });
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded._id };
    next();
  } catch (error) {
    logger.error('Invalid token', { endpoint: '/api/quiz/generate', method: 'POST', error: error.message });
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

const validateQuizCreation = (req, res, next) => {
  const schema = Joi.object({
    subject: Joi.string().trim().min(1).required().messages({
      'string.empty': 'Subject is required',
      'string.min': 'Subject must be at least 1 character long',
    }),
    topics: Joi.array().items(Joi.string().trim().min(1)).min(1).required().messages({
      'array.min': 'Topics must be a non-empty array',
      'string.empty': 'Topic names cannot be empty',
    }),
    numQuestions: Joi.number().integer().min(1).max(50).required().messages({
      'number.base': 'Number of questions must be a number',
      'number.min': 'Number of questions must be at least 1',
      'number.max': 'Number of questions cannot exceed 50',
    }),
    level: Joi.string().valid('easy', 'medium', 'hard').required().messages({
      'any.only': 'Level must be one of easy, medium, hard',
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    logger.error('Validation error', { endpoint: '/api/quiz/generate', method: 'POST', error: error.details[0].message });
    return res.status(400).json({ error: 'Bad Request', details: error.details[0].message });
  }
  next();
};

router.post('/generate', isAuthenticated, validateQuizCreation, async (req, res) => {
  const { subject, topics, numQuestions, level } = req.body;
  logger.info('Generating quiz', { subject, topics, numQuestions, level, userId: req.user._id });
  try {
    const questions = await generateAIQuestions(subject, topics, numQuestions, level);
    if (!questions || questions.length === 0) {
      logger.warn('No questions generated', { subject, topics, numQuestions, level });
      return res.status(400).json({ error: 'No questions generated' });
    }
    res.json({ questions });
  } catch (error) {
    logger.error('Quiz generation failed', { endpoint: '/api/quiz/generate', method: 'POST', error: error.message });
    res.status(500).json({ error: 'Quiz generation failed', details: error.message });
  }
});

router.post('/submit', isAuthenticated, async (req, res) => {
  const { questions, answers } = req.body;
  logger.info('Submitting quiz', { userId: req.user._id, questionsCount: questions.length });
  try {
    let score = 0;
    let wrongTopics = [];
    questions.forEach((q, i) => {
      const selectedAnswer = answers[i]?.trim().toLowerCase();
      const correctAnswer = q.correctAnswer?.trim().toLowerCase();
      logger.info('Answer comparison', { question: q.question, selectedAnswer, correctAnswer });
      if (selectedAnswer === correctAnswer) score++;
      else wrongTopics.push(q.topic || 'Unknown');
    });
    const revisionSheet = await generateAIRevisionSheet(wrongTopics);
    res.json({ score, total: questions.length, wrongTopics, revisionSheet });
  } catch (error) {
    logger.error('Submission failed', { endpoint: '/api/quiz/submit', method: 'POST', error: error.message });
    res.status(500).json({ error: 'Submission failed', details: error.message });
  }
});

module.exports = router;