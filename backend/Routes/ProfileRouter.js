const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const winston = require('winston');
const mongoose = require('mongoose');
const User = require('../Models/User');
const StudyPlan = require('../Models/StudyPlan');

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
    logger.info('JWT decoded', { userId: decoded._id });
    req.user = { _id: decoded._id };
    next();
  } catch (error) {
    logger.error('Invalid token', { endpoint: req.originalUrl, method: req.method, error: error.message });
    return res.status(401).json({ error: 'Unauthorized: Invalid token', details: error.message });
  }
};

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name email userId');
    if (!user) {
      logger.warn('User not found', { userId: req.user._id });
      return res.status(404).json({ error: 'User not found', details: `No user found with _id: ${req.user._id}` });
    }

    const studyPlans = await StudyPlan.find({ userId: user.userId }).sort({ createdAt: -1 });
    logger.info('Profile fetched', { userId: req.user._id, userUuid: user.userId, planCount: studyPlans.length });

    res.json({
      user: {
        name: user.name,
        email: user.email,
      },
      studyPlans: {
        current: studyPlans.filter(plan => plan.progress < 100),
        completed: studyPlans.filter(plan => plan.progress >= 100),
      },
    });
  } catch (error) {
    logger.error('Error fetching profile', { endpoint: req.originalUrl, method: req.method, error: error.message, userId: req.user._id });
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
});

module.exports = router;