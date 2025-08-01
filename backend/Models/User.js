// backend/Models/User.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Correct import

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  userId: { type: String, default: uuidv4, unique: true },
  googleAccessToken: { type: String }, // For Google Calendar API
  googleRefreshToken: { type: String }, // For token refresh
  isPremium: { type: Boolean, default: false },
  premiumUntil: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);