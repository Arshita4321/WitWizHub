const mongoose = require('mongoose');

const studyPlanSubjectSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  deadline: { type: Date, required: true },
  topics: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
      name: { type: String, required: true },
      startTime: { type: Date },
      endTime: { type: Date },
      completed: { type: Boolean, default: false },
      googleEventId: { type: String },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('StudyPlanSubject', studyPlanSubjectSchema);