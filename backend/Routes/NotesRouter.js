const express = require('express');
const router = express.Router();

// ✅ Use authMiddleware instead of protect
const authMiddleware = require('../Middlewares/AuthMiddleware');
const { subjectValidation, noteValidation } = require('../Middlewares/ValidationMiddleware');

const {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
  addNote,
  updateNote,
  deleteNote,
} = require('../Controllers/NotesController');

// ✅ Apply authMiddleware in routes
router.post('/', authMiddleware, subjectValidation, createSubject);
router.get('/', authMiddleware, getSubjects);
router.put('/:subjectId', authMiddleware, subjectValidation, updateSubject);
router.delete('/:subjectId', authMiddleware, deleteSubject);

router.post('/:subjectId/notes', authMiddleware, noteValidation, addNote);
router.put('/:subjectId/notes/:noteId', authMiddleware, noteValidation, updateNote);
router.delete('/:subjectId/notes/:noteId', authMiddleware, deleteNote);

module.exports = router;
