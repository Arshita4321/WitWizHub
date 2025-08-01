// backend/Controllers/AuthController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // Add uuid import
const UserModel = require('../Models/User');

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(409).json({
        message: 'User already exists, You can login',
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      userId: uuidv4(), // Use uuidv4 function
    });

    try {
      await newUser.save();
      console.log('User Saved');
    } catch (err) {
      console.error('Mongoose Save Error:', err);
      return res.status(500).json({
        message: 'Internal Server Error',
        success: false,
      });
    }

    return res.status(201).json({
      message: 'Signup successful',
      success: true,
      userId: newUser.userId,
      _id: newUser._id,
    });
  } catch (err) {
    console.error('Signup Error:', err);
    return res.status(500).json({
      message: 'Internal Server Error',
      success: false,
    });
  }
};

const login = async (req, res) => {
  try {
    console.log('📦 req.body =', req.body);

    const { email, password } = req.body;
    const errorMsg = 'Auth Failed: Email or Password Invalid!';

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: errorMsg, success: false });
    }

    const isPasswordEqual = await bcrypt.compare(password, user.password);
    if (!isPasswordEqual) {
      return res.status(401).json({ message: errorMsg, success: false });
    }

    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id, userId: user.userId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
    );

    return res.status(200).json({
      message: 'Login successful',
      success: true,
      jwtToken,
      email,
      name: user.name,
      userId: user.userId,
      _id: user._id,
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({
      message: 'Internal Server Error',
      success: false,
    });
  }
};

module.exports = {
  signup,
  login,
};