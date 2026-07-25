const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  contact: {
    type: String,
    required: false,
    trim: true
  },
  password_hash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  points_balance: {
    type: Number,
    default: 0,
    min: [0, 'Points balance cannot be negative']
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  referral_code: {
    type: String,
    unique: true,
    sparse: true
  },
  next_purchase_date: {
    type: Date,
    default: null
  },
  referral_level: {
    type: Number,
    default: 0,
    max: 12
  },
  total_referrals: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },

  // ---------------- OTP Fields ----------------
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  }

}, {
  timestamps: true
});

// Generate referral code before saving
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.referral_code) {
    let referralCode;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const existingUser = await this.constructor.findOne({ referral_code: referralCode });
      if (!existingUser) {
        isUnique = true;
      }
      attempts++;
    }
    this.referral_code = referralCode || this._id.toString().substring(0, 8).toUpperCase();
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

// Get referral chain method
userSchema.methods.getReferralChain = async function() {
  const chain = [];
  let currentUser = this;
  let level = 0;
  while (currentUser.parent_id && level < 12) {
    currentUser = await this.constructor.findById(currentUser.parent_id);
    if (currentUser) {
      chain.push({
        user: currentUser,
        level: level + 1
      });
      level++;
    } else {
      break;
    }
  }
  return chain;
};

// Add credits method
userSchema.methods.addCredits = async function(amount, description = 'Credit added') {
  this.points_balance += amount;
  await this.save();
  return this.points_balance;
};

// Deduct credits method
userSchema.methods.deductCredits = async function(amount, description = 'Credit used') {
  if (this.points_balance < amount) {
    throw new Error('Insufficient credits');
  }
  this.points_balance -= amount;
  await this.save();
  return this.points_balance;
};

// Check if user can make purchase
userSchema.methods.canMakePurchase = function() {
  if (!this.next_purchase_date) {
    return true;
  }
  return new Date() >= this.next_purchase_date;
};

// Set next purchase date (next month)
userSchema.methods.setNextPurchaseDate = async function() {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  this.next_purchase_date = nextMonth;
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
