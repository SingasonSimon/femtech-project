import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
    getAdminStats,
    getRecentActivity,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getPeriodLogs
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Admin dashboard routes
router.get('/stats', getAdminStats);
router.get('/activity', getRecentActivity);

// User management routes
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Period logs management
router.get('/period-logs', getPeriodLogs);

export default router;
