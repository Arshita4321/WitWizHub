const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const winston = require('winston');
const Joi = require('joi');
const QuizRoom = require('../Models/QuizRoom');
const User = require('../Models/User');
const mongoose = require('mongoose');

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
    logger.error('No token provided', { endpoint: req.originalUrl, method: req.method });
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded._id };
    logger.info('JWT decoded', { userId: decoded._id });
    next();
  } catch (error) {
    logger.error('Invalid token', { endpoint: req.originalUrl, method: req.method, error: error.message });
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

router.get('/user-object-id', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('_id');
    if (!user) {
      logger.warn('User not found', { userId: req.user._id });
      return res.status(404).json({ error: 'User not found' });
    }
    logger.info('Fetched user ObjectId', { userObjectId: user._id.toString() });
    res.json({ userObjectId: user._id.toString() });
  } catch (error) {
    logger.error('Error fetching user ObjectId', { endpoint: req.originalUrl, method: req.method, error: error.message });
    res.status(500).json({ error: 'Failed to fetch user ObjectId', details: error.message });
  }
});

router.get('/user-id', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('userId');
    if (!user) {
      logger.warn('User not found', { userId: req.user._id });
      return res.status(404).json({ error: 'User not found' });
    }
    logger.info('Fetched user ID', { userId: user.userId });
    res.json({ userId: user.userId });
  } catch (error) {
    logger.error('Error fetching user ID', { endpoint: req.originalUrl, method: req.method, error: error.message });
    res.status(500).json({ error: 'Failed to fetch user ID', details: error.message });
  }
});

const validateCreateRoom = (req, res, next) => {
  logger.info('Received create room request', { body: req.body });
  const schema = Joi.object({
    topic: Joi.string().trim().min(3).required().messages({
      'string.base': 'Topic must be a string',
      'string.min': 'Topic must be at least 3 characters long',
      'any.required': 'Topic is required',
    }),
    roomId: Joi.string().pattern(/^\d{5}$/).required().messages({
      'string.base': 'roomId must be a string',
      'string.pattern.base': 'roomId must be a 5-digit number',
      'any.required': 'roomId is required',
    }),
  });

  const { error } = schema.validate(req.body, { convert: true });
  if (error) {
    logger.error('Validation error', {
      endpoint: req.originalUrl,
      method: req.method,
      error: error.details[0].message,
      body: req.body,
    });
    return res.status(400).json({ error: 'Bad Request', details: error.details[0].message });
  }
  next();
};

const validateJoinRoom = (req, res, next) => {
  logger.info('Received join room request', { body: req.body });
  const schema = Joi.object({
    roomId: Joi.string().pattern(/^\d{5}$/).required().messages({
      'string.base': 'roomId must be a string',
      'string.pattern.base': 'roomId must be a 5-digit number',
      'any.required': 'roomId is required',
    }),
  });

  const { error } = schema.validate(req.body, { convert: true });
  if (error) {
    logger.error('Validation error', {
      endpoint: req.originalUrl,
      method: req.method,
      error: error.details[0].message,
      body: req.body,
    });
    return res.status(400).json({ error: 'Bad Request', details: error.details[0].message });
  }
  next();
};

router.post('/create', isAuthenticated, validateCreateRoom, async (req, res) => {
  try {
    const { topic, roomId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      logger.warn('User not found', { userId: req.user._id });
      return res.status(404).json({ error: 'User not found' });
    }
    const existingRoom = await QuizRoom.findOne({ roomId });
    if (existingRoom) {
      logger.warn('Room ID already exists', { roomId, userId: req.user._id });
      return res.status(400).json({ error: 'Room ID already in use. Please choose another.' });
    }

    const quizRoom = new QuizRoom({
      roomId,
      creatorId: req.user._id,
      players: [req.user._id],
      topic,
      scores: [{ playerId: req.user._id, score: 0 }],
    });
    await quizRoom.save();
    logger.info('Game room created', { roomId, creatorId: req.user._id, players: quizRoom.players.map(p => p.toString()) });
    res.json({ roomId, message: 'Game room created successfully' });
  } catch (error) {
    logger.error('Error creating game room', { endpoint: req.originalUrl, method: req.method, error: error.message });
    res.status(500).json({ error: 'Failed to create game room', details: error.message });
  }
});

router.post('/join', isAuthenticated, validateJoinRoom, async (req, res) => {
  try {
    const { roomId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      logger.warn('User not found', { userId: req.user._id });
      return res.status(404).json({ error: 'User not found' });
    }
    const quizRoom = await QuizRoom.findOne({ roomId });
    if (!quizRoom) {
      logger.warn('Game room not found', { roomId });
      return res.status(404).json({ error: 'Game room not found' });
    }
    if (quizRoom.players.length >= 4) {
      logger.warn('Game room full', { roomId });
      return res.status(400).json({ error: 'Game room is full' });
    }
    if (quizRoom.players.some(p => p.equals(req.user._id))) {
      logger.warn('User already in game room', { roomId, userId: req.user._id });
      return res.status(400).json({ error: 'You are already in this room' });
    }
    quizRoom.players.push(req.user._id);
    quizRoom.scores.push({ playerId: req.user._id, score: 0 });
    await quizRoom.save();
    logger.info('User joined game room', { 
      roomId, 
      userId: req.user._id.toString(), 
      players: quizRoom.players.map(p => p.toString()),
      scores: quizRoom.scores.map(s => ({ playerId: s.playerId.toString(), score: s.score }))
    });
    res.json({ message: 'Joined game room successfully' });
  } catch (error) {
    logger.error('Error joining game room', { endpoint: req.originalUrl, method: req.method, error: error.message });
    res.status(500).json({ error: 'Failed to join game room', details: error.message });
  }
});

router.get('/room/:roomId', isAuthenticated, async (req, res) => {
  try {
    const quizRoom = await QuizRoom.findOne({ roomId: req.params.roomId });
    if (!quizRoom) {
      logger.warn('Game room not found', { roomId: req.params.roomId });
      return res.status(404).json({ error: 'Game room not found' });
    }
    const players = await User.find({ _id: { $in: quizRoom.players } }, '_id name');
    const roomData = {
      ...quizRoom.toObject(),
      creatorId: quizRoom.creatorId.toString(),
      players: players.map(p => ({ userId: p._id.toString(), name: p.name })),
      currentQuestion: quizRoom.currentQuestion ? JSON.parse(quizRoom.currentQuestion) : null,
      scores: quizRoom.scores.map(score => ({
        playerId: score.playerId.toString(),
        score: score.score,
      })),
      currentPlayerId: quizRoom.currentPlayerIndex !== null ? quizRoom.players[quizRoom.currentPlayerIndex].toString() : null,
    };
    logger.info('Fetched game room', { roomId: req.params.roomId, players: roomData.players.map(p => p.name) });
    res.json(roomData);
  } catch (error) {
    logger.error('Error fetching game room', { endpoint: req.originalUrl, method: req.method, error: error.message });
    res.status(500).json({ error: 'Failed to fetch game room', details: error.message });
  }
});

router.use((req, res, next) => {
  let data = '';
  req.on('data', chunk => { data += chunk; });
  req.on('end', () => { req.rawBody = data; });
  next();
});

module.exports = router;