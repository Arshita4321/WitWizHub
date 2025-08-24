const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chatId: { type: String, required: true }, // UUID for chat session
  title: { type: String, required: true }, // Chat title
  sender: { type: String, enum: ['user', 'bot'], required: true },
  text: { type: String, required: true },
  videoLink: { type: String },
  clarification: { type: String },
  responseType: { type: String },
  error: { type: Boolean, default: false },
  timestamp: { type: Date, default: () => new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) },
});

// Prevent model overwrite
module.exports = mongoose.models.ChatbotMsg || mongoose.model('ChatbotMsg', chatMessageSchema);