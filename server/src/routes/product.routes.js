import express from 'express';
import { body } from 'express-validator';
import {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getFeaturedProducts,
    getProductCategories
} from '../controllers/productController.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Validation rules
const productValidation = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Name must be between 3 and 200 characters'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('originalPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Original price must be a positive number'),
    body('category')
        .isIn(['trackers', 'monitors', 'accessories', 'apparel', 'supplements', 'books', 'other'])
        .withMessage('Invalid category'),
    body('brand')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Brand must be between 1 and 100 characters'),
    body('stock')
        .optional()
        .custom((value) => {
            try {
                const stock = JSON.parse(value);
                if (typeof stock.quantity !== 'number' || stock.quantity < 0) {
                    throw new Error('Invalid stock quantity');
                }
                return true;
            } catch (error) {
                throw new Error('Invalid stock format');
            }
        }),
    body('variants')
        .optional()
        .custom((value) => {
            try {
                JSON.parse(value);
                return true;
            } catch (error) {
                throw new Error('Invalid variants format');
            }
        }),
    body('tags')
        .optional()
        .custom((value) => {
            try {
                const tags = JSON.parse(value);
                return Array.isArray(tags);
            } catch (error) {
                return false;
            }
        })
        .withMessage('Tags must be a valid JSON array')
];

// Public routes (no auth required)
router.get('/', optionalAuth, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getProductCategories);
router.get('/:slug', optionalAuth, getProduct);

// Protected routes (auth required)
router.use(authenticateToken);

// Admin/Author routes
router.post('/', requireAdmin, upload.array('images', 5), productValidation, createProduct);
router.put('/:slug', upload.array('images', 5), productValidation, updateProduct);
router.delete('/:slug', deleteProduct);

export default router;
