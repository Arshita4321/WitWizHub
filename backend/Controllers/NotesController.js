const Subject = require('../Models/Note');

exports.createSubject = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }

    const subject = new Subject({ name, userId, notes: [] });
    await subject.save();

    res.status(201).json(subject);
  } catch (err) {
    console.error('Create subject error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    const subjects = await Subject.find({ userId });
    res.status(200).json(subjects);
  } catch (err) {
    console.error('Get subjects error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;

    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found or not authorized' });
    }

    subject.name = name;
    await subject.save();

    res.status(200).json(subject);
  } catch (err) {
    console.error('Update subject error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user.userId;

    const subject = await Subject.findOneAndDelete({ _id: subjectId, userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found or not authorized' });
    }

    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (err) {
    console.error('Delete subject error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { content, penColor, penThickness } = req.body;
    const userId = req.user.userId;

    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found or not authorized' });
    }

    subject.notes.push({ content, penColor, penThickness });
    await subject.save();

    res.status(201).json(subject);
  } catch (err) {
    console.error('Add note error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { subjectId, noteId } = req.params;
    const { content, penColor, penThickness } = req.body;
    const userId = req.user.userId;

    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found or not authorized' });
    }

    const note = subject.notes.id(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.content = content;
    note.penColor = penColor;
    note.penThickness = penThickness;
    await subject.save();

    res.status(200).json(subject);
  } catch (err) {
    console.error('Update note error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { subjectId, noteId } = req.params;
    const userId = req.user.userId;

    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found or not authorized' });
    }

    subject.notes = subject.notes.filter(note => note._id.toString() !== noteId);
    await subject.save();

    res.status(200).json(subject);
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};