const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { sendOtp } = require('../controllers/otpController'); // Make sure this exists

const router = express.Router();

// ---------------- JWT ----------------
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

// OTP generator
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ---------------- Register Route ----------------
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const otp = generateOTP();

    // Save user with OTP
    const user = await User.create({
      name,
      email,
      password_hash: password,
      otp,
    });

    // Send OTP mail
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

// ---------------- Verify OTP ----------------
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    // OTP matched → clear OTP
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
    console.log("Login attempt:", email);

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    console.log("Login successful for:", user.email);

    res.json({
      message: 'Login successful',
      role: user.role,
      user: { id: user._id, email: user.email, role: user.role },
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

// ---------------- Routes ----------------
router.post('/send-otp', sendOtp);

// ---------------- Export ----------------
module.exports = { router, protect, adminOnly };
