const Joi = require('joi');

// Enhanced validation with better error handling
const signupValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters',
        'string.pattern.base': 'Name can only contain letters and spaces'
      }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address'
      }),
    password: Joi.string()
      .min(8)
      .max(100)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 100 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details[0].message;
    return res.status(400).json({
      message: errorMessage,
      success: false,
      field: error.details[0].path[0]
    });
  }
  next();
};

const loginValidation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address'
      }),
    password: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Password is required'
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details[0].message;
    return res.status(400).json({
      message: errorMessage,
      success: false,
      field: error.details[0].path[0]
    });
  }
  next();
};

const forgotPasswordValidation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address'
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details[0].message;
    return res.status(400).json({
      message: errorMessage,
      success: false,
      field: error.details[0].path[0]
    });
  }
  next();
};

const resetPasswordValidation = (req, res, next) => {
  const schema = Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'string.empty': 'Reset token is required'
      }),
    newPassword: Joi.string()
      .min(8)
      .max(100)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.empty': 'New password is required',
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 100 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details[0].message;
    return res.status(400).json({
      message: errorMessage,
      success: false,
      field: error.details[0].path[0]
    });
  }
  next();
};

// Middleware to sanitize and validate JSON payload
const validateJsonPayload = (req, res, next) => {
  try {
    // Check if body exists and is an object
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        message: 'Invalid request format. Please send valid JSON.',
        success: false
      });
    }

    // Log the request for debugging
    console.log('Received request body:', JSON.stringify(req.body, null, 2));

    // Trim string values to prevent whitespace issues
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });

    next();
  } catch (error) {
    console.error('JSON validation error:', error);
    return res.status(400).json({
      message: 'Invalid JSON format',
      success: false
    });
  }
};

module.exports = {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  validateJsonPayload,
};