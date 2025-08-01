const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middlewares/AuthMiddleware');
const {
  studyPlanValidation,
  updateStudyPlanValidation,
  patchStudyPlanValidation,
  topicValidation,
  updateTopicValidation,
} = require('../Middlewares/StudyPlannerValidation');
const {
  googleAuth,
  googleCallback,
  createStudyPlan,
  getStudyPlans,
  getStudyPlan,
  updateStudyPlan,
  patchStudyPlan,
  deleteStudyPlan,
  addTopic,
  updateTopic,
  deleteTopic,
  deleteGoogleEvent,
} = require('../Controllers/StudyPlannerController');

router.get('/google', authMiddleware, googleAuth);
router.get('/google/callback', googleCallback);
router.post('/plans', authMiddleware, studyPlanValidation, createStudyPlan);
router.get('/plans', authMiddleware, getStudyPlans);
router.get('/plans/:planId', authMiddleware, getStudyPlan);
router.put('/plans/:planId', authMiddleware, updateStudyPlanValidation, updateStudyPlan);
router.patch('/plans/:planId', authMiddleware, patchStudyPlanValidation, patchStudyPlan);
router.delete('/plans/:planId', authMiddleware, deleteStudyPlan);
router.post('/subjects/:subjectId/topics', authMiddleware, topicValidation, addTopic);
router.put('/subjects/:subjectId/topics/:topicId', authMiddleware, updateTopicValidation, updateTopic);
router.delete('/subjects/:subjectId/topics/:topicId', authMiddleware, deleteTopic);
router.delete('/google-calendar/:eventId', authMiddleware, deleteGoogleEvent);

module.exports = router;