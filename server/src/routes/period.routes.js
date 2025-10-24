import express from 'express';
import { body } from 'express-validator';
import {
    createPeriodEntry,
    getPeriodEntries,
    getPeriodEntry,
    updatePeriodEntry,
    deletePeriodEntry,
    getCycleInsights
} from '../controllers/periodController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const periodEntryValidation = [
    body('startDate')
        .isISO8601()
        .withMessage('Start date must be a valid date'),
    body('endDate')
        .isISO8601()
        .withMessage('End date must be a valid date'),
    body('flow')
        .optional()
        .isIn(['light', 'medium', 'heavy'])
        .withMessage('Flow must be light, medium, or heavy'),
    body('symptoms')
        .optional()
        .isArray()
        .withMessage('Symptoms must be an array'),
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Notes cannot exceed 500 characters')
];

// All routes require authentication
router.use(authenticateToken);

// Routes
router.post('/', periodEntryValidation, createPeriodEntry);
router.get('/', getPeriodEntries);
router.get('/insights', getCycleInsights);
router.get('/:id', getPeriodEntry);
router.put('/:id', periodEntryValidation, updatePeriodEntry);
router.delete('/:id', deletePeriodEntry);

export default router;
