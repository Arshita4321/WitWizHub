const Question = require('../Models/Question');

const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const createQuestion = async (req, res) => {
  try {
    const { title, description, images, name } = req.body;
    const question = new Question({
      userId: req.user.userId,
      name,
      title,
      description,
      images,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      answers: [],
    });
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    console.error('Error posting question:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found', success: false });
    }
    if (question.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized', success: false });
    }

    question.title = req.body.title || question.title;
    question.description = req.body.description || question.description;
    question.images = req.body.images || question.images;
    await question.save();
    res.status(200).json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found', success: false });
    }
    if (question.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized', success: false });
    }

    await question.deleteOne();
    res.status(200).json({ message: 'Question deleted', success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const createAnswer = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found', success: false });
    }

    const answer = {
      userId: req.user.userId,
      name: req.body.name,
      text: req.body.text,
      images: req.body.images || [],
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };
    question.answers.push(answer);
    await question.save();
    res.status(201).json(question);
  } catch(error) {
    console.error('Error posting answer:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const updateAnswer = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found', success: false });
    }
    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found', success: false });
    }
    if (answer.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized', success: false });
    }

    answer.text = req.body.text || answer.text;
    answer.images = req.body.images || answer.images;
    await question.save();
    res.status(200).json(question);
  } catch (error) {
    console.error('Error updating answer:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const deleteAnswer = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found', success: false });
    }
    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found', success: false });
    }
    if (answer.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized', success: false });
    }

    question.answers.pull({ _id: req.params.answerId });
    await question.save();
    res.status(200).json(question);
  } catch (error) {
    console.error('Error deleting answer:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

module.exports = {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createAnswer,
  updateAnswer,
  deleteAnswer,
};