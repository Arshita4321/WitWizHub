// backend/Middlewares/AuthMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  console.log('Authorization Header:', req.headers.authorization);
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided', success: false });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded);
    req.user = { email: decoded.email, _id: decoded._id, userId: decoded.userId };
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({ message: 'Invalid token', success: false });
  }
};

module.exports = authMiddleware;