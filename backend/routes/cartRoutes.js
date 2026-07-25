const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get cart for a user
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId }).populate('items.product');
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get cart' });
  }
});

// Add/update item in cart
router.post('/:userId/add', async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) cart = new Cart({ user: req.params.userId, items: [] });

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Remove item from cart
router.post('/:userId/remove', async (req, res) => {
  const { productId } = req.body;
  try {
    let cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) return res.json({ items: [] });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// Clear cart
router.post('/:userId/clear', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) return res.json({ items: [] });

    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;