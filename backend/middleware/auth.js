const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

// ---------------- JWT Token ----------------
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// ---------------- OTP Setup ----------------
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ---------------- Register Route ----------------
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const otp = generateOTP();

    const user = await User.create({
      name,
      email,
      password_hash: password,
      otp,
    });

    await transporter.sendMail({
      from: `"GroceryMarts" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    res.json({ message: 'OTP sent to email. Please verify to complete registration.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ---------------- Verify OTP Route ----------------
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'Registration successful', role: user.role });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
});

// ---------------- Login Route ----------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    // Try both password_hash and password fields for old users
    let isMatch = false;
    if (user.comparePassword) {
      isMatch = await user.comparePassword(password);
    }
    // Fallback for old users with plain password field
    if (!isMatch && user.password && user.password === password) {
      isMatch = true;
    }

    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      role: user.role,
      user: { id: user._id, email: user.email, role: user.role },
      token // <-- add token for frontend JWT auth
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ---------------- Middleware ----------------
const protect = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password_hash');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') next();
  else return res.status(403).json({ message: 'Admin access only' });
};

// ---------------- Exports ----------------
module.exports = {
  router,       // use as: app.use('/api/auth', router)
  protect,      // use as middleware
  adminOnly     // use as middleware
};
