import Review from '../models/Review.js';
import Article from '../models/Article.js';
import Product from '../models/Product.js';

// Get reviews for a target (article or product)
export const getReviews = async (req, res) => {
    try {
        const { targetType, targetId } = req.params;
        const { page = 1, limit = 10, sort = 'createdAt' } = req.query;

        if (!['Article', 'Product'].includes(targetType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid target type'
            });
        }

        const skip = (page - 1) * limit;

        const sortOptions = {
            createdAt: { createdAt: -1 },
            rating: { rating: -1 },
            helpful: { helpful: -1 }
        };

        const [reviews, total] = await Promise.all([
            Review.find({ targetType, targetId })
                .populate('userId', 'displayName profileImage')
                .sort(sortOptions[sort] || sortOptions.createdAt)
                .skip(skip)
                .limit(parseInt(limit)),
            Review.countDocuments({ targetType, targetId })
        ]);

        res.json({
            success: true,
            data: {
                reviews,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(total / limit),
                    count: total
                }
            }
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });
    }
};

// Create a review
export const createReview = async (req, res) => {
    try {
        const { targetType, targetId } = req.params;
        const { rating, title, comment } = req.body;
        const userId = req.user._id;

        if (!['Article', 'Product'].includes(targetType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid target type'
            });
        }

        // Verify target exists
        const Model = targetType === 'Article' ? Article : Product;
        const target = await Model.findById(targetId);

        if (!target) {
            return res.status(404).json({
                success: false,
                message: `${targetType} not found`
            });
        }

        // Check if user already reviewed this
        const existingReview = await Review.findOne({ userId, targetType, targetId });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this'
            });
        }

        const review = new Review({
            userId,
            targetType,
            targetId,
            rating,
            title,
            comment
        });

        await review.save();
        await review.populate('userId', 'displayName profileImage');

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: review
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create review'
        });
    }
};

// Update a review
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, title, comment } = req.body;
        const userId = req.user._id;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns this review
        if (review.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this review'
            });
        }

        review.rating = rating;
        review.title = title;
        review.comment = comment;

        await review.save();
        await review.populate('userId', 'displayName profileImage');

        res.json({
            success: true,
            message: 'Review updated successfully',
            data: review
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update review'
        });
    }
};

// Delete a review
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const isAdmin = req.user.role === 'admin';

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns this review or is admin
        if (review.userId.toString() !== userId.toString() && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review'
            });
        }

        await Review.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete review'
        });
    }
};

// Mark review as helpful
export const markHelpful = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Find if user already marked as helpful (convert to string for comparison)
        const helpfulIndex = review.helpful.findIndex(
            helpfulUserId => helpfulUserId.toString() === userId.toString()
        );

        let isHelpful;
        if (helpfulIndex > -1) {
            // Remove from helpful
            review.helpful.splice(helpfulIndex, 1);
            isHelpful = false;
        } else {
            // Add to helpful
            review.helpful.push(userId);
            isHelpful = true;
        }

        await review.save();

        res.json({
            success: true,
            data: {
                helpfulCount: review.helpful.length,
                isHelpful: isHelpful
            }
        });
    } catch (error) {
        console.error('Mark helpful error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark review as helpful'
        });
    }
};

// Get user's review for a target
export const getUserReview = async (req, res) => {
    try {
        const { targetType, targetId } = req.params;
        const userId = req.user._id;

        if (!['Article', 'Product'].includes(targetType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid target type'
            });
        }

        const review = await Review.findOne({ userId, targetType, targetId })
            .populate('userId', 'displayName profileImage');

        res.json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Get user review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user review'
        });
    }
};

