const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters'],
    unique: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['Grains', 'Dairy', 'Bakery', 'Vegetables', 'Fruits', 'Beverages', 'Snacks', 'Other'],
    default: 'Other'
  },
  image_url: {
    type: String,
    default: ''
  },
  imageUrl: { type: String }, // Add this line to your schema
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updated_at field before saving
productSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Instance method to check if product is available
productSchema.methods.isAvailable = function(quantity = 1) {
  return this.is_active && this.stock >= quantity;
};

// Instance method to reduce stock
productSchema.methods.reduceStock = async function(quantity) {
  if (this.stock < quantity) {
    throw new Error('Insufficient stock');
  }
  this.stock -= quantity;
  await this.save();
  return this.stock;
};

// Instance method to increase stock
productSchema.methods.increaseStock = async function(quantity) {
  this.stock += quantity;
  await this.save();
  return this.stock;
};

// Static method to get available products
productSchema.statics.getAvailableProducts = function() {
  return this.find({ is_active: true, stock: { $gt: 0 } });
};

module.exports = mongoose.model('Product', productSchema);

