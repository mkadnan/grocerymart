const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // path tumhare project ke hisaab se adjust karo
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grocerymarts';

const hashPasswords = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    for (let user of users) {
      // Agar password already hashed hai, skip
      if (user.password_hash.startsWith('$2')) {
        console.log(`Skipping already hashed password for: ${user.email}`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password_hash, salt);
      user.password_hash = hashedPassword;
      await user.save();
      console.log(`Password hashed for: ${user.email}`);
    }

    console.log('All passwords updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error hashing passwords:', err);
    process.exit(1);
  }
};

hashPasswords();
