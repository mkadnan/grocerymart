const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ------------------- REGISTER -------------------
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });

    const { name, email, contact, password, referral_code } = req.body;

    // DO NOT CHECK OTP HERE

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists with this email' });

    let parent_id = null;
    let referral_level = 0;

    if (referral_code) {
      const referrer = await User.findOne({ referral_code });
      if (!referrer) return res.status(400).json({ message: 'Invalid referral code' });
      parent_id = referrer._id;
      referral_level = referrer.referral_level + 1;
      if (referral_level > 12) return res.status(400).json({ message: 'Referral chain limit exceeded' });
    }

    const user = await User.create({
      name,
      email,
      contact,
      password_hash: password, // <-- This is correct!
      parent_id,
      referral_level,
      points_balance: 0
    });

    if (parent_id) await processReferralRewards(user);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact,
        role: user.role,
        points_balance: user.points_balance,
        referral_code: user.referral_code
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ------------------- LOGIN -------------------
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // <-- must be "admin"
        points_balance: user.points_balance,
        referral_code: user.referral_code,
        can_purchase: user.canMakePurchase()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ------------------- GET PROFILE -------------------
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points_balance: user.points_balance,
        referral_code: user.referral_code,
        can_purchase: user.canMakePurchase(),
        next_purchase_date: user.next_purchase_date,
        total_referrals: user.total_referrals,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------- PROCESS REFERRALS -------------------
const processReferralRewards = async (newUser) => {
  try {
    const chain = await newUser.getReferralChain();
    for (let i = 0; i < chain.length && i < 12; i++) {
      const { user: referrer, level } = chain[i];
      if (level === 1) {
        await referrer.addCredits(50, `Referral bonus for ${newUser.name}`);
        referrer.total_referrals += 1;
        await referrer.save();
      } else if (level === chain.length) {
        await referrer.addCredits(100, `Main parent bonus for ${newUser.name}`);
      }
    }
  } catch (error) {
    console.error('Error processing referral rewards:', error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
