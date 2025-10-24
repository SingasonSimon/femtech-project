import { validationResult } from 'express-validator';
import Post from '../models/Post.js';
import Reply from '../models/Reply.js';
import Like from '../models/Like.js';
import View from '../models/View.js';

export const createPost = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { title, content, category, tags } = req.body;
        const userId = req.user._id;

        const post = new Post({
            userId,
            title,
            content,
            category,
            tags: tags || []
        });

        await post.save();
        await post.populate('userId', 'displayName email');

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: post
        });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create post'
        });
    }
};

export const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, sort = 'newest' } = req.query;

        let query = {};
        if (category && category !== 'all') {
            query.category = category;
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'popular') {
            sortOption = { likesCount: -1, createdAt: -1 };
        } else if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        }

        const posts = await Post.find(query)
            .populate('userId', 'displayName email')
            .sort(sortOption)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Post.countDocuments(query);

        // If user is authenticated, check which posts they've liked
        let userLikedPosts = [];
        if (req.user) {
            const likedPosts = await Like.find({
                userId: req.user._id,
                targetType: 'Post',
                targetId: { $in: posts.map(post => post._id) }
            });
            userLikedPosts = likedPosts.map(like => like.targetId.toString());
        }

        res.json({
            success: true,
            data: posts,
            userLikedPosts,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch posts'
        });
    }
};

export const getPost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id; // Optional for guest users

        const post = await Post.findById(id)
            .populate('userId', 'displayName email');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Track view for logged-in users only (one view per user)
        if (userId) {
            try {
                // Try to create a new view record
                await View.create({
                    userId,
                    targetType: 'Post',
                    targetId: id
                });
                
                // If successful, increment the view count
                post.viewsCount += 1;
                await post.save();
            } catch (viewError) {
                // If view already exists (duplicate key error), don't increment
                if (viewError.code !== 11000) {
                    console.error('View tracking error:', viewError);
                }
            }
        }

        res.json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch post'
        });
    }
};

export const updatePost = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const userId = req.user._id;
        const { title, content, category, tags } = req.body;

        const post = await Post.findOne({ _id: id, userId });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found or you do not have permission to edit it'
            });
        }

        post.title = title;
        post.content = content;
        post.category = category;
        post.tags = tags || [];

        await post.save();
        await post.populate('userId', 'displayName email');

        res.json({
            success: true,
            message: 'Post updated successfully',
            data: post
        });
    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update post'
        });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const post = await Post.findOne({ _id: id, userId });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found or you do not have permission to delete it'
            });
        }

        // Delete associated replies and likes
        await Reply.deleteMany({ postId: id });
        await Like.deleteMany({ targetType: 'Post', targetId: id });

        await Post.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete post'
        });
    }
};

export const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if user already liked this post
        const existingLike = await Like.findOne({
            userId,
            targetType: 'Post',
            targetId: id
        });

        if (existingLike) {
            // Unlike the post
            await Like.findByIdAndDelete(existingLike._id);
            post.likesCount -= 1;
            await post.save();

            res.json({
                success: true,
                message: 'Post unliked',
                liked: false,
                likesCount: post.likesCount
            });
        } else {
            // Like the post
            const like = new Like({
                userId,
                targetType: 'Post',
                targetId: id
            });

            await like.save();
            post.likesCount += 1;
            await post.save();

            res.json({
                success: true,
                message: 'Post liked',
                liked: true,
                likesCount: post.likesCount
            });
        }
    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to like/unlike post'
        });
    }
};

export const getReplies = async (req, res) => {
    try {
        const { id } = req.params; // This is postId
        const { page = 1, limit = 20 } = req.query;
        const userId = req.user?._id;

        const replies = await Reply.find({ postId: id, parentReplyId: null })
            .populate('userId', 'displayName email')
            .sort({ createdAt: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean(); // Use .lean() for faster processing

        let allReplyIds = [];

        // Get nested replies for each top-level reply
        for (let reply of replies) {
            const nestedReplies = await Reply.find({ parentReplyId: reply._id })
                .populate('userId', 'displayName email')
                .sort({ createdAt: 1 })
                .lean(); // Use .lean()
            reply.nestedReplies = nestedReplies;
            
            // Collect all reply IDs for the like-check
            allReplyIds.push(reply._id);
            allReplyIds.push(...nestedReplies.map(nr => nr._id));
        }

        const total = await Reply.countDocuments({ postId: id, parentReplyId: null });
        
        // If user is authenticated, check which replies they've liked
        let userLikedReplies = [];
        if (userId) {
            const likedReplies = await Like.find({
                userId: userId,
                targetType: 'Reply',
                targetId: { $in: allReplyIds }
            }).select('targetId'); // Only select the targetId
            
            userLikedReplies = likedReplies.map(like => like.targetId.toString());
        }

        res.json({
            success: true,
            data: replies,
            userLikedReplies, // Send this new array to the client
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get replies error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch replies'
        });
    }
};


export const createReply = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { content, parentReplyId } = req.body;
        const userId = req.user._id;

        // Verify post exists
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const reply = new Reply({
            postId: id,
            userId,
            content,
            parentReplyId: parentReplyId || null
        });

        await reply.save();
        await reply.populate('userId', 'displayName email');

        // Update post replies count
        post.repliesCount += 1;
        await post.save();

        res.status(201).json({
            success: true,
            message: 'Reply created successfully',
            data: reply
        });
    } catch (error) {
        console.error('Create reply error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create reply'
        });
    }
};

export const likeReply = async (req, res) => {
    try {
        const { replyId } = req.params;
        const userId = req.user._id;

        const reply = await Reply.findById(replyId);
        if (!reply) {
            return res.status(404).json({
                success: false,
                message: 'Reply not found'
            });
        }

        // Check if user already liked this reply
        const existingLike = await Like.findOne({
            userId,
            targetType: 'Reply',
            targetId: replyId
        });

        if (existingLike) {
            // Unlike the reply
            await Like.findByIdAndDelete(existingLike._id);
            reply.likesCount = Math.max(0, reply.likesCount - 1); // Prevent going below 0
            await reply.save();

            res.json({
                success: true,
                message: 'Reply unliked',
                liked: false,
                likesCount: reply.likesCount
            });
        } else {
            // Like the reply
            const like = new Like({
                userId,
                targetType: 'Reply',
                targetId: replyId
            });

            await like.save();
            reply.likesCount += 1;
            await reply.save();

            res.json({
                success: true,
                message: 'Reply liked',
                liked: true,
                likesCount: reply.likesCount
            });
        }
    } catch (error) {
        console.error('Like reply error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to like/unlike reply'
        });
    }
};

