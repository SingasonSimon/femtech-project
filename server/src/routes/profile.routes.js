import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import {
    getProfile,
    updateProfile,
    changePassword,
    deleteProfileImage,
    deleteAccount
} from '../controllers/profileController.js';

const router = express.Router();

// All profile routes require authentication
router.use(authenticateToken);

// Profile routes
router.get('/', getProfile);
router.put('/', upload.single('profileImage'), updateProfile);
router.put('/password', changePassword);
router.delete('/image', deleteProfileImage);
router.delete('/account', deleteAccount);

export default router;

