const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 5000,
  },
  penColor: {
    type: String,
    required: true,
    enum: ['black', 'blue', 'red', 'green', 'purple'],
    default: 'black',
  },
  penThickness: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const subjectSchema = new mongoose.Schema({
  userId: {
    type: String, // Changed to String to accept UUID
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  notes: [noteSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Subject', subjectSchema);