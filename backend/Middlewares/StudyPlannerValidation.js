const Joi = require('joi');

const studyPlanValidation = (req, res, next) => {
  const schema = Joi.object({
    fieldOfStudy: Joi.string().min(3).max(100).required(),
    subjects: Joi.array().items(
      Joi.object({
        name: Joi.string().min(3).max(100).required(),
        deadline: Joi.date().iso().required(),
        topics: Joi.array().items(
          Joi.object({
            name: Joi.string().min(1).max(100).required(),
          })
        ).min(1).required(),
      })
    ).min(1).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Bad Request', error });
  }
  next();
};

const updateStudyPlanValidation = (req, res, next) => {
  const schema = Joi.object({
    fieldOfStudy: Joi.string().min(3).max(100).optional(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Bad Request', error });
  }
  next();
};

const patchStudyPlanValidation = (req, res, next) => {
  const schema = Joi.object({
    subjects: Joi.array().items(
      Joi.object({
        _id: Joi.string().required(),
        name: Joi.string().min(3).max(100).optional(),
        deadline: Joi.date().iso().optional(),
        topics: Joi.array().items(
          Joi.object({
            _id: Joi.string().required(),
            name: Joi.string().min(1).max(100).optional(),
            completed: Joi.boolean().optional(),
            startTime: Joi.date().iso().optional(),
            endTime: Joi.date().iso().optional(),
          })
        ).optional(),
      })
    ).optional(),
    progress: Joi.number().min(0).max(100).optional(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Bad Request', error });
  }
  next();
};

const topicValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Bad Request', error });
  }
  next();
};

const updateTopicValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    completed: Joi.boolean().optional(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Bad Request', error });
  }
  next();
};

module.exports = {
  studyPlanValidation,
  updateStudyPlanValidation,
  patchStudyPlanValidation,
  topicValidation,
  updateTopicValidation,
};