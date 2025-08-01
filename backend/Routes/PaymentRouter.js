const express = require('express');
const router = express.Router();
const { initiatePayment, handlePaymentCallback } = require('../Controllers/PaymentController');
const { protect } = require('../Middleware/AuthMiddleware');

// Initiate payment (protected route)
router.post('/initiate', protect, initiatePayment);

// Handle Paytm callback
router.post('/callback', handlePaymentCallback);

module.exports = router;