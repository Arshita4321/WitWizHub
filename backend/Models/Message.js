const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Changed from ObjectId to String
  sender: { type: String, enum: ['user', 'bot'], required: true },
  text: { type: String, required: true },
  videoLink: { type: String },
  clarification: { type: String },
  responseType: { type: String },
  error: { type: Boolean, default: false },
  timestamp: { type: Date, default: () => new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) },
  replies: [{ // Explicitly define replies subdocument schema
    userId: { type: String, required: true }, // Changed to String
    name: { type: String, required: true },
    text: { type: String, required: true },
    images: [{ type: String }],
    timestamp: { type: String, required: true },
  }],
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);