import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import {
    getReviews,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    getUserReview
} from '../controllers/reviewController.js';

const router = express.Router();

// Validation rules
const reviewValidation = [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('title')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    body('comment')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Comment must be between 10 and 1000 characters')
];

// Get reviews for a target (public)
router.get('/:targetType/:targetId', optionalAuth, getReviews);

// Get user's own review for a target (requires auth)
router.get('/:targetType/:targetId/user', authenticateToken, getUserReview);

// Create a review (requires auth)
router.post('/:targetType/:targetId', authenticateToken, reviewValidation, createReview);

// Update a review (requires auth)
router.put('/:id', authenticateToken, reviewValidation, updateReview);

// Delete a review (requires auth)
router.delete('/:id', authenticateToken, deleteReview);

// Mark review as helpful (requires auth)
router.post('/:id/helpful', authenticateToken, markHelpful);

export default router;

