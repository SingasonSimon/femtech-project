import express from 'express';
import { body } from 'express-validator';
import {
    createPost,
    getPosts,
    getPost,
    updatePost,
    deletePost,
    likePost,
    getReplies,
    createReply,
    likeReply // 1. Imported likeReply
} from '../controllers/forumController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const postValidation = [
    body('title')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
    body('content')
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage('Content must be between 10 and 5000 characters'),
    body('category')
        .optional()
        .isIn(['general', 'health', 'wellness', 'products', 'support', 'tips'])
        .withMessage('Invalid category'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array')
];

const replyValidation = [
    body('content')
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Content must be between 1 and 2000 characters'),
    body('parentReplyId')
        .optional()
        .isMongoId()
        .withMessage('Invalid parent reply ID')
];

// Public routes (no auth required)
router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPost);
router.get('/:id/replies', optionalAuth, getReplies);

// Protected routes (auth required)
router.use(authenticateToken);

router.post('/', postValidation, createPost);
router.put('/:id', postValidation, updatePost);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);
router.post('/:id/replies', replyValidation, createReply);

// 2. Added new route for liking a reply
router.post('/reply/:replyId/like', likeReply);

export default router;