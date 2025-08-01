const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middlewares/AuthMiddleware');
const { questionValidation, answerValidation } = require('../Middlewares/ValidationMiddleware');
const {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createAnswer,
  updateAnswer,
  deleteAnswer,
} = require('../Controllers/QuestionController');

router.get('/', getQuestions);
router.post('/', authMiddleware, questionValidation, createQuestion);
router.put('/:id', authMiddleware, questionValidation, updateQuestion);
router.delete('/:id', authMiddleware, deleteQuestion);
router.post('/:id/answers', authMiddleware, answerValidation, createAnswer);
router.put('/:id/answers/:answerId', authMiddleware, answerValidation, updateAnswer);
router.delete('/:id/answers/:answerId', authMiddleware, deleteAnswer);

module.exports = router;