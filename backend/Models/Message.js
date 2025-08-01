// backend/Models/Message.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  userId: { type: String, required: true }, // UUID from User
  name: { type: String, required: true }, // User's display name
  text: { type: String, default: '' },
  images: [{ type: String }], // Array of image URLs or base64 strings
  timestamp: { type: String, required: true },
  replies: [
    {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      text: { type: String, default: '' },
      images: [{ type: String }],
      timestamp: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model('message', messageSchema);