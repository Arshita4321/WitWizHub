const express = require('express');
const { 
  signup, 
  login, 
  forgotPassword, 
  resetPassword,
  checkEmailService 
} = require('../Controllers/AuthController');
const { 
  signupValidation, 
  loginValidation, 
  forgotPasswordValidation, 
  resetPasswordValidation,
  validateJsonPayload 
} = require('../Middlewares/AuthValidation');

const router = express.Router();

// Middleware to log all requests
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Health check for email service
router.get('/email-check', checkEmailService);

// Auth routes with proper validation
router.post('/signup', validateJsonPayload, signupValidation, signup);
router.post('/login', validateJsonPayload, loginValidation, login);
router.post('/forgot-password', validateJsonPayload, forgotPasswordValidation, forgotPassword);
router.post('/reset-password', validateJsonPayload, resetPasswordValidation, resetPassword);

// Error handling middleware for routes
router.use((err, req, res, next) => {
  console.error('Auth Route Error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      message: 'Invalid JSON format in request body',
      success: false
    });
  }
  
  return res.status(500).json({
    message: 'Internal server error',
    success: false
  });
});

module.exports = router;