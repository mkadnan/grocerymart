const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  cancelOrder
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Validation rules for order creation
const orderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.product_id')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('credits_to_use')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Credits to use must be a non-negative number'),
  body('delivery_address.street')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  body('delivery_address.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('delivery_address.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('delivery_address.postal_code')
    .optional()
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('Postal code must be between 5 and 10 characters'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot be more than 500 characters')
];

// Validation for order status update
const statusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status')
];

// Protected routes
router.post('/', protect, orderValidation, createOrder);
router.get('/', protect, getUserOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

// Admin only routes
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, statusValidation, updateOrderStatus);

module.exports = router;

