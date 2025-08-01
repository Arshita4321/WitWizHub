const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middlewares/AuthMiddleware');
const { messageValidation, replyValidation } = require('../Middlewares/ValidationMiddleware');
const {
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  createReply,
  updateReply,
  deleteReply,
} = require('../Controllers/MessageController');

router.get('/', getMessages);
router.post('/', authMiddleware, messageValidation, createMessage);
router.put('/:id', authMiddleware, messageValidation, updateMessage);
router.delete('/:id', authMiddleware, deleteMessage);
router.post('/:id/replies', authMiddleware, replyValidation, createReply);
router.put('/:id/replies/:replyId', authMiddleware, replyValidation, updateReply);
router.delete('/:id/replies/:replyId', authMiddleware, deleteReply);

module.exports = router;