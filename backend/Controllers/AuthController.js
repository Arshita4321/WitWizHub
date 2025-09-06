const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const UserModel = require('../Models/User');

// Enhanced transporter configuration with better error handling
const createTransporter = () => {
  const { EMAIL_USER, EMAIL_PASS } = process.env;
  
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('Email credentials missing. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS, // Use Gmail App Password
    },
    secure: true,
    port: 465,
    tls: {
      rejectUnauthorized: false
    }
  });
};

const transporter = createTransporter();

// Verify nodemailer configuration only if transporter exists
if (transporter) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('Nodemailer configuration error:', error.message);
      console.log('Please ensure you are using a Gmail App Password, not your regular password.');
      console.log('To create an App Password: https://support.google.com/accounts/answer/185833');
    } else {
      console.log('✅ Nodemailer ready to send emails');
    }
  });
} else {
  console.warn('⚠️  Email service not configured. Forgot password feature will not work.');
}

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('Signup request for email:', email);

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists. You can login instead.',
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const newUser = new UserModel({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      userId: uuidv4(),
    });

    await newUser.save();
    console.log('✅ User created successfully:', { userId: newUser.userId, email });

    return res.status(201).json({
      message: 'Account created successfully! You can now login.',
      success: true,
      userId: newUser.userId,
      _id: newUser._id,
    });
  } catch (err) {
    console.error('❌ Signup Error:', err);
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'User already exists with this email',
        success: false,
      });
    }
    return res.status(500).json({
      message: 'Internal Server Error. Please try again.',
      success: false,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        message: 'Invalid email or password', 
        success: false 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({ 
        message: 'Invalid email or password', 
        success: false 
      });
    }

    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id, userId: user.userId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for user:', email);

    return res.status(200).json({
      message: 'Login successful',
      success: true,
      jwtToken,
      email: user.email,
      name: user.name,
      userId: user.userId,
      _id: user._id,
    });
  } catch (err) {
    console.error('❌ Login Error:', err);
    return res.status(500).json({
      message: 'Internal Server Error. Please try again.',
      success: false,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ 
        message: 'Valid email is required', 
        success: false 
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    console.log('Forgot password request for email:', trimmedEmail);

    if (!transporter) {
      console.error('❌ Email service not configured');
      return res.status(500).json({ 
        message: 'Email service temporarily unavailable. Please try again later.', 
        success: false 
      });
    }

    const user = await UserModel.findOne({ email: trimmedEmail });
    if (!user) {
      console.log('❌ User not found for forgot password:', trimmedEmail);
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a password reset link shortly.', 
        success: true 
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = Date.now() + 3600000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"WitWizHub Support" <${process.env.EMAIL_USER}>`,
      to: trimmedEmail,
      subject: '🔒 Reset Your WitWizHub Password',
      html: `
        <p>Hello ${user.name},</p>
        <p>Click below to reset your password:</p>
        <a href="${resetUrl}">Reset My Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', trimmedEmail);

    return res.status(200).json({
      message: 'Password reset link sent to your email. Please check your inbox and spam folder.',
      success: true,
    });
  } catch (err) {
    console.error('❌ Forgot Password Error:', err);
    return res.status(500).json({
      message: 'Failed to send reset email. Please try again.',
      success: false,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        message: 'Token and new password are required',
        success: false,
      });
    }

    console.log('Password reset attempt with token:', token.substring(0, 10) + '...');

    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log('Invalid or expired reset token');
      return res.status(400).json({
        message: 'Password reset link is invalid or has expired. Please request a new one.',
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('Password reset successful for user:', user.email);

    return res.status(200).json({
      message: 'Password reset successful! You can now login with your new password.',
      success: true,
    });
  } catch (err) {
    console.error('Reset Password Error:', err);
    return res.status(500).json({
      message: 'Failed to reset password. Please try again.',
      success: false,
    });
  }
};

const checkEmailService = async (req, res) => {
  try {
    if (!transporter) {
      return res.status(500).json({
        message: 'Email service not configured',
        success: false,
      });
    }

    await transporter.verify();
    return res.status(200).json({
      message: 'Email service is working',
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Email service error',
      success: false,
      error: err.message,
    });
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  checkEmailService,
};
