const express = require('express');
const router = express.Router();
const { generateChatbotResponse } = require('../Services/chatbotService');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const Joi = require('joi');
const ChatbotMsg = require('../Models/ChatbotMsg');
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
    next();
  } catch (error) {
    logger.error('Invalid token', { endpoint: req.originalUrl, method: req.method, error: error.message });
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

const validateChatbotRequest = (req, res, next) => {
  const schema = Joi.object({
    question: Joi.string().trim().min(1).required().messages({
      'string.empty': 'Question is required',
      'string.min': 'Question must be at least 1 character long',
    }),
    chatId: Joi.string().required().messages({
      'string.empty': 'Chat ID is required',
    }),
    title: Joi.string().trim().min(1).required().messages({
      'string.empty': 'Chat title is required',
      'string.min': 'Chat title must be at least 1 character long',
    }),
    saveHistory: Joi.boolean().optional().default(true),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    logger.error('Validation error', { endpoint: req.originalUrl, method: req.method, error: error.details[0].message });
    return res.status(400).json({ error: 'Bad Request', details: error.details[0].message });
  }
  next();
};

router.post('/ask', isAuthenticated, validateChatbotRequest, async (req, res) => {
  const { question, chatId, title, saveHistory } = req.body;
  logger.info('Chatbot request', { question, userId: req.user._id, chatId, title });
  try {
    const response = await generateChatbotResponse(question, req.user._id, chatId, title, saveHistory);
    res.json(response);
  } catch (error) {
    logger.error('Chatbot response failed', { endpoint: req.originalUrl, method: req.method, error: error.message });
    res.status(500).json({ error: 'Chatbot response failed', details: error.message });
  }
});

router.get('/history', isAuthenticated, async (req, res) => {
  try {
    const chats = await ChatbotMsg.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: { chatId: '$chatId', title: '$title' },
          latestTimestamp: { $max: '$timestamp' },
          messageCount: { $sum: 1 },
        },
      },
      {
        $project: {
          chatId: '$_id.chatId',
          title: '$_id.title',
          timestamp: '$latestTimestamp',
          messageCount: 1,
          _id: 0,
        },
      },
      { $sort: { timestamp: -1 } },
    ]);
    logger.info('Chat history fetched', { userId: req.user._id, chatCount: chats.length });
    res.json(chats);
  } catch (error) {
    logger.error('Error fetching chat history', { endpoint: req.originalUrl, method: req.method, error: error.message });
    res.status(500).json({ error: 'Failed to fetch chat history', details: error.message });
  }
});

router.get('/history/:chatId', isAuthenticated, async (req, res) => {
  try {
    const messages = await ChatbotMsg.find({ 
      userId: new mongoose.Types.ObjectId(req.user._id), 
      chatId: req.params.chatId 
    }).sort({ timestamp: 1 });
    if (!messages.length) {
      logger.warn('No messages found for chat', { userId: req.user._id, chatId: req.params.chatId });
      return res.status(404).json({ error: 'Chat not found' });
    }
    logger.info('Chat messages fetched', { userId: req.user._id, chatId: req.params.chatId, messageCount: messages.length });
    res.json(messages);
  } catch (error) {
    logger.error('Error fetching chat messages', { endpoint: req.originalUrl, method: req.method, error: error.message });
    res.status(500).json({ error: 'Failed to fetch chat messages', details: error.message });
  }
});

router.delete('/history/:id', isAuthenticated, async (req, res) => {
  try {
    const message = await ChatbotMsg.findOneAndDelete({ 
      _id: new mongoose.Types.ObjectId(req.params.id), 
      userId: new mongoose.Types.ObjectId(req.user._id) 
    });
    if (!message) {
      logger.warn('Message not found or not authorized', { userId: req.user._id, messageId: req.params.id });
      return res.status(404).json({ error: 'Message not found or not authorized' });
    }
    logger.info('Message deleted', { userId: req.user._id, messageId: req.params.id });
    res.json({ message: 'Message deleted' });
  } catch (error) {
    logger.error('Error deleting message', { endpoint: req.originalUrl, method: req.method, error: error.message });
    res.status(500).json({ error: 'Failed to delete message', details: error.message });
  }
});

router.delete('/history/chat/:chatId', isAuthenticated, async (req, res) => {
  try {
    const result = await ChatbotMsg.deleteMany({ 
      userId: new mongoose.Types.ObjectId(req.user._id), 
      chatId: req.params.chatId 
    });
    if (result.deletedCount === 0) {
      logger.warn('No messages found for chat', { userId: req.user._id, chatId: req.params.chatId });
      return res.status(404).json({ error: 'Chat not found or not authorized' });
    }
    logger.info('Chat deleted', { userId: req.user._id, chatId: req.params.chatId, deletedCount: result.deletedCount });
    res.json({ message: 'Chat deleted', deletedCount: result.deletedCount });
  } catch (error) {
    logger.error('Error deleting chat', { endpoint: req.originalUrl, method: req.method, error: error.message });
    res.status(500).json({ error: 'Failed to delete chat', details: error.message });
  }
});

router.delete('/history', isAuthenticated, async (req, res) => {
  try {
    const result = await ChatbotMsg.deleteMany({ userId: new mongoose.Types.ObjectId(req.user._id) });
    logger.info('Chat history cleared', { userId: req.user._id, deletedCount: result.deletedCount });
    res.json({ message: 'Chat history cleared', deletedCount: result.deletedCount });
  } catch (error) {
    logger.error('Error clearing history', { endpoint: req.originalUrl, method: req.method, error: error.message });
    res.status(500).json({ error: 'Failed to clear chat history', details: error.message });
  }
});

module.exports = router;