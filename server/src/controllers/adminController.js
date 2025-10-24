import User from '../models/User.js';
import Post from '../models/Post.js';
import Article from '../models/Article.js';
import PeriodEntry from '../models/PeriodEntry.js';
import Product from '../models/Product.js';

// Get admin dashboard stats
export const getAdminStats = async (req, res) => {
    try {
        const [totalUsers, totalPosts, totalArticles, totalProducts, totalPeriodEntries] = await Promise.all([
            User.countDocuments(),
            Post.countDocuments(),
            Article.countDocuments(),
            Product.countDocuments(),
            PeriodEntry.countDocuments()
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalPosts,
                totalArticles,
                totalProducts,
                totalPeriodEntries
            }
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin stats'
        });
    }
};

// Get recent activity (privacy-focused)
export const getRecentActivity = async (req, res) => {
    try {
        const [recentPosts, recentUsers, recentArticles] = await Promise.all([
            Post.find()
                .populate('userId', 'displayName')
                .sort({ createdAt: -1 })
                .limit(5)
                .select('title createdAt userId'),
            User.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('displayName createdAt role'),
            Article.find()
                .populate('authorId', 'displayName')
                .sort({ createdAt: -1 })
                .limit(5)
                .select('title createdAt authorId published')
        ]);

        // Format activity with privacy in mind
        const activities = [];

        // Add recent posts (only show title and date, no personal info)
        recentPosts.forEach(post => {
            activities.push({
                type: `New forum post: "${post.title.substring(0, 50)}${post.title.length > 50 ? '...' : ''}"`,
                timestamp: post.createdAt,
                category: 'forum'
            });
        });

        // Add new user registrations (only show count, not personal info)
        recentUsers.forEach(user => {
            activities.push({
                type: `New ${user.role} user registered`,
                timestamp: user.createdAt,
                category: 'user'
            });
        });

        // Add new articles
        recentArticles.forEach(article => {
            if (article.published) {
                activities.push({
                    type: `New article published: "${article.title.substring(0, 50)}${article.title.length > 50 ? '...' : ''}"`,
                    timestamp: article.createdAt,
                    category: 'content'
                });
            }
        });

        // Sort by timestamp and limit to 10 most recent
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const recentActivity = activities.slice(0, 10);

        res.json({
            success: true,
            data: recentActivity
        });
    } catch (error) {
        console.error('Get recent activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent activity'
        });
    }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { displayName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password -refreshTokens')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(total / limit),
                    count: total
                }
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};

// Update user role (admin only)
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be "user" or "admin"'
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select('-password -refreshTokens');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user,
            message: `User role updated to ${role}`
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user role'
        });
    }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Don't allow deleting the last admin
        const adminCount = await User.countDocuments({ role: 'admin' });
        const user = await User.findById(id);

        if (user?.role === 'admin' && adminCount <= 1) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete the last admin user'
            });
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
};
