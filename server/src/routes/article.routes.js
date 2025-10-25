import express from 'express';
import { body } from 'express-validator';
import {
    createArticle,
    getArticles,
    getArticle,
    getArticleById,
    updateArticle,
    deleteArticle,
    getFeaturedArticles
} from '../controllers/articleController.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Validation rules
const articleValidation = [
    body('title')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
    body('content')
        .trim()
        .isLength({ min: 100 })
        .withMessage('Content must be at least 100 characters'),
    body('excerpt')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Excerpt cannot exceed 500 characters'),
    body('category')
        .optional()
        .isIn(['health', 'wellness', 'products', 'lifestyle', 'education', 'news'])
        .withMessage('Invalid category'),
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
        .withMessage('Tags must be a valid JSON array'),
    body('published')
        .optional()
        .custom((value) => {
            if (typeof value === 'boolean') return true;
            if (typeof value === 'string') {
                return value === 'true' || value === 'false';
            }
            return false;
        })
        .withMessage('Published must be a boolean or string "true"/"false"'),
    body('productLinks')
        .optional()
        .custom((value) => {
            try {
                const links = JSON.parse(value);
                return Array.isArray(links);
            } catch (error) {
                return false;
            }
        })
        .withMessage('Product links must be a valid JSON array')
];

// Public routes (no auth required)
router.get('/', optionalAuth, getArticles);
router.get('/featured', getFeaturedArticles);
router.get('/:slug', optionalAuth, getArticle);

// Protected routes (auth required)
router.use(authenticateToken);

// Admin/Author routes
router.post('/', requireAdmin, upload.single('image'), articleValidation, createArticle);
router.get('/admin/:id', requireAdmin, getArticleById);
router.put('/:id', upload.single('image'), articleValidation, updateArticle);
router.patch('/:id', updateArticle); // For partial updates (no validation, no file upload)
router.delete('/:id', deleteArticle);

export default router;
