const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  fieldOfStudy: { type: String, required: true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlanSubject' }],
  progress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);