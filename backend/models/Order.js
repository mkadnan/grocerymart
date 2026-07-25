const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  product_name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price_per_unit: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  total_price: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  }
});

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  order_number: {
    type: String,
    unique: true,
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  credits_used: {
    type: Number,
    default: 0,
    min: [0, 'Credits used cannot be negative']
  },
  cash_amount: {
    type: Number,
    default: 0,
    min: [0, 'Cash amount cannot be negative']
  },
  total_amount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    enum: ['credits_only', 'cash_only', 'credits_and_cash'],
    required: true
  },
  delivery_address: {
    street: String,
    city: String,
    state: String,
    postal_code: String,
    country: { type: String, default: 'India' }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
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

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.order_number) {
    const count = await this.constructor.countDocuments();
    this.order_number = `ORD${Date.now()}${(count + 1).toString().padStart(4, '0')}`;
  }
  this.updated_at = Date.now();
  next();
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((total, item) => total + item.total_price, 0);
  
  // Calculate total amount (subtotal - credits_used + any additional charges)
  this.total_amount = this.subtotal;
  this.cash_amount = Math.max(0, this.total_amount - this.credits_used);
  
  next();
});

// Instance method to add item to order
orderSchema.methods.addItem = function(productId, productName, quantity, pricePerUnit) {
  const existingItem = this.items.find(item => item.product_id.toString() === productId.toString());
  
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.total_price = existingItem.quantity * existingItem.price_per_unit;
  } else {
    this.items.push({
      product_id: productId,
      product_name: productName,
      quantity: quantity,
      price_per_unit: pricePerUnit,
      total_price: quantity * pricePerUnit
    });
  }
};

// Instance method to remove item from order
orderSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => item.product_id.toString() !== productId.toString());
};

// Instance method to update item quantity
orderSchema.methods.updateItemQuantity = function(productId, newQuantity) {
  const item = this.items.find(item => item.product_id.toString() === productId.toString());
  if (item) {
    if (newQuantity <= 0) {
      this.removeItem(productId);
    } else {
      item.quantity = newQuantity;
      item.total_price = item.quantity * item.price_per_unit;
    }
  }
};

// Static method to get user's orders
orderSchema.statics.getUserOrders = function(userId, limit = 10) {
  return this.find({ user_id: userId })
    .populate('items.product_id', 'name category')
    .sort({ created_at: -1 })
    .limit(limit);
};

// Static method to get orders by status
orderSchema.statics.getOrdersByStatus = function(status) {
  return this.find({ status })
    .populate('user_id', 'name email')
    .populate('items.product_id', 'name category')
    .sort({ created_at: -1 });
};

module.exports = mongoose.model('Order', orderSchema);

