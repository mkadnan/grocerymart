// routes/products.js

const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
} = require('../controllers/productController.js');

const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('category')
    .isIn(['Grains', 'Dairy', 'Bakery', 'Vegetables', 'Fruits', 'Beverages', 'Snacks', 'Other'])
    .withMessage('Invalid category'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters')
];

// Public Routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);

// Protected Routes (Admin Only)
router.post('/', protect, adminOnly, productValidation, createProduct);
router.put('/:id', protect, adminOnly, productValidation, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

console.log('getProducts:', getProducts);
console.log('createProduct:', createProduct);

module.exports = router;
