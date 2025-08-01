// backend/Models/Question.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  userId: { type: String, required: true }, // UUID from User
  name: { type: String, required: true }, // User's display name
  title: { type: String, required: true },
  description: { type: String, default: '' },
  images: [{ type: String }], // Array of image URLs or base64 strings
  timestamp: { type: String, required: true },
  answers: [
    {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      text: { type: String, default: '' },
      images: [{ type: String }],
      timestamp: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model('question', questionSchema);