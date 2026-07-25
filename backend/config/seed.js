const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grocerymarts');
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Demo products data
const products = [
  {
    name: 'Basmati Rice',
    description: 'Premium quality basmati rice, 1kg pack',
    price: 200,
    stock: 50,
    category: 'Grains',
    image_url: 'https://example.com/rice.jpg'
  },
  {
    name: 'Fresh Milk',
    description: 'Fresh cow milk, 1 liter pack',
    price: 50,
    stock: 30,
    category: 'Dairy',
    image_url: 'https://example.com/milk.jpg'
  },
  {
    name: 'Whole Wheat Bread',
    description: 'Freshly baked whole wheat bread',
    price: 40,
    stock: 25,
    category: 'Bakery',
    image_url: 'https://example.com/bread.jpg'
  },
  {
    name: 'Organic Tomatoes',
    description: 'Fresh organic tomatoes, 1kg',
    price: 80,
    stock: 40,
    category: 'Vegetables',
    image_url: 'https://example.com/tomatoes.jpg'
  },
  {
    name: 'Fresh Bananas',
    description: 'Sweet and fresh bananas, 1 dozen',
    price: 60,
    stock: 35,
    category: 'Fruits',
    image_url: 'https://example.com/bananas.jpg'
  }
];

// Demo users data
const users = [
  {
    name: 'Test User',
    email: 'user@test.com',
    password_hash: 'password123',
    role: 'user',
    points_balance: 100
  },
  {
    name: 'Admin User',
    email: 'admin@test.com',
    password_hash: 'admin123',
    role: 'admin',
    points_balance: 500
  },
  {
    name: 'John Doe',
    email: 'john@test.com',
    password_hash: 'password123',
    role: 'user',
    points_balance: 200
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    // Create products
    const createdProducts = await Product.create(products);
    console.log(`Created ${createdProducts.length} products`);

    console.log('Database seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('User: user@test.com / password123');
    console.log('Admin: admin@test.com / admin123');
    console.log('User 2: john@test.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedDatabase();
};

// Run seeding if this file is executed directly
if (require.main === module) {
  runSeed();
}

module.exports = { seedDatabase, connectDB };

