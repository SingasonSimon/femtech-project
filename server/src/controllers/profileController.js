import User from '../models/User.js';
import Post from '../models/Post.js';
import Article from '../models/Article.js';
import PeriodEntry from '../models/PeriodEntry.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// Get user profile
export const getProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('-password -refreshTokens');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user stats
        const [postsCount, articlesCount, periodEntriesCount] = await Promise.all([
            Post.countDocuments({ userId }),
            Article.countDocuments({ authorId: userId }),
            PeriodEntry.countDocuments({ userId })
        ]);

        res.json({
            success: true,
            data: {
                user,
                stats: {
                    postsCount,
                    articlesCount,
                    periodEntriesCount
                }
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { displayName, bio } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (displayName) user.displayName = displayName;
        if (bio !== undefined) user.bio = bio;

        // Handle profile image upload
        if (req.file) {
            try {
                const cloudinaryResult = await uploadToCloudinary(req.file, 'femtech/profiles');
                user.profileImage = cloudinaryResult.secure_url;
            } catch (uploadError) {
                console.error('Profile image upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload profile image'
                });
            }
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password (will be hashed by pre-save middleware)
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
};

// Delete profile image
export const deleteProfileImage = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.profileImage = null;
        await user.save();

        res.json({
            success: true,
            message: 'Profile image removed successfully',
            data: user
        });
    } catch (error) {
        console.error('Delete profile image error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove profile image'
        });
    }
};

// Delete account
export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required to delete account'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        // Don't allow deleting the last admin
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete the last admin account'
                });
            }
        }

        // Delete user's data
        await Promise.all([
            Post.deleteMany({ userId }),
            Article.deleteMany({ authorId: userId }),
            PeriodEntry.deleteMany({ userId }),
            User.findByIdAndDelete(userId)
        ]);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account'
        });
    }
};

