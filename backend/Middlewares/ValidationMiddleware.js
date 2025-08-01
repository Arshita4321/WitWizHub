const Joi = require('joi');

const messageValidation = (req, res, next) => {
  const schema = Joi.object({
    text: Joi.string().max(500).allow(''),
    name: Joi.string().min(3).max(100).required(),
    images: Joi.array().items(Joi.string()).max(3).optional(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Bad Request', error });
  }
  next();
};

const replyValidation = (req, res, next) => {
  const schema = Joi.object({
    text: Joi.string().max(500).required(),
    name: Joi.string().min(3).max(100).required(),
    images: Joi.array().items(Joi.string()).max(3).optional(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Bad Request', error });
  }
  next();
};

const questionValidation = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(1000).allow(''),
    name: Joi.string().min(3).max(100).required(),
    images: Joi.array().items(Joi.string()).max(3).optional(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Bad Request', error });
  }
  next();
};

const answerValidation = (req, res, next) => {
  const schema = Joi.object({
    text: Joi.string().max(500).required(),
    name: Joi.string().min(3).max(100).required(),
    images: Joi.array().items(Joi.string()).max(3).optional(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Bad Request', error });
  }
  next();
};

// ✅ Added for Notes functionality

const subjectValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Bad Request', error });
  }
  next();
};

const noteValidation = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().min(1).max(5000).required(),
    penColor: Joi.string().valid('black', 'blue', 'red', 'green', 'purple').required(),
    penThickness: Joi.number().integer().min(1).max(10).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Bad Request', error });
  }
  next();
};

module.exports = {
  messageValidation,
  replyValidation,
  questionValidation,
  answerValidation,
  subjectValidation,
  noteValidation,
};
