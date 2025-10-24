import { validationResult } from 'express-validator';
import Article from '../models/Article.js';
import View from '../models/View.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// --- Helper function to generate slugs (still needed for productLinks) ---
const slugify = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-')      // collapse whitespace and replace by -
        .replace(/-+/g, '-');       // collapse dashes
}

export const createArticle = async (req, res) => {
    try {
        console.log('=== ARTICLE CREATION DEBUG ===');
        // ... (your debug logs) ...

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // ... (your validation error handling) ...
        }

        console.log('Validation passed successfully');

        const { title, content, excerpt, category, tags, published, productLinks } = req.body;
        const authorId = req.user._id;

        console.log('Creating article with authorId:', authorId);

        // --- START OF FIXES ---

        let parsedTags = [];
        let parsedProductLinks = [];

        try {
            // 1. Parse tags string
            if (tags) {
                parsedTags = JSON.parse(tags);
            }
            
            // 2. Parse productLinks and add productSlug
            if (productLinks) {
                const tempLinks = JSON.parse(productLinks);
                parsedProductLinks = tempLinks.map(link => ({
                    ...link,
                    productSlug: slugify(link.productName) 
                }));
            }
        } catch (parseError) {
            console.error('Error parsing JSON from form data:', parseError);
            return res.status(400).json({
                success: false,
                message: 'Invalid format for tags or productLinks'
            });
        }

        // --- END OF FIXES ---


        // Upload image to Cloudinary if provided
        let imageUrl = null;
        if (req.file) {
            console.log('Uploading image to Cloudinary...');
            try {
                const cloudinaryResult = await uploadToCloudinary(req.file, 'femtech/articles');
                imageUrl = cloudinaryResult.secure_url;
                console.log('Image uploaded successfully:', imageUrl);
            } catch (uploadError) {
                // ... (your upload error handling) ...
            }
        } else {
            console.log('No image file provided');
        }

        console.log('Creating article object...');
        const article = new Article({
            authorId,
            title,
            // 3. 'slug' is REMOVED. The Article.js model pre('save') hook will now handle it.
            content,
            excerpt,
            featuredImage: imageUrl, 
            category,
            tags: parsedTags, // Use parsed tags
            productLinks: parsedProductLinks, // Use parsed and slugged product links
            published: published === 'true' || published === true
        });

        console.log('Article object created:', {
            title: article.title,
            category: article.category,
            published: article.published,
            tagsCount: article.tags.length,
            productLinksCount: article.productLinks.length
        });

        console.log('Saving article to database...');
        // The pre('save') hook in Article.js will run here, generating the slug
        await article.save(); 
        console.log('Article saved successfully with ID:', article._id);

        console.log('Populating author information...');
        await article.populate('authorId', 'displayName email');
        console.log('Article populated successfully');

        console.log('Sending success response...');
        res.status(201).json({
            success: true,
            message: 'Article created successfully',
            data: article
        });
    } catch (error) {
        console.error('Create article error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({
            success: false,
            message: 'Failed to create article',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ... (rest of your file: getArticles, getArticle, etc... no changes needed) ...
// (I've also updated your updateArticle function to handle slugs correctly)

// In server/src/controllers/articleController.js

export const getArticles = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;
        // --- START OF FIX ---
        // Get the published query param as a string first
        const publishedQuery = req.query.published; 

        // Determine the boolean value: true unless explicitly 'false'
        const publishedStatus = publishedQuery !== 'false'; 
        
        let query = { published: publishedStatus }; 
        // --- END OF FIX ---

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const articles = await Article.find(query)
            .populate('authorId', 'displayName email')
            // Sort by publishedAt first (if exists), then createdAt
            .sort({ publishedAt: -1, createdAt: -1 }) 
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-content'); 

        const total = await Article.countDocuments(query);

        res.json({
            success: true,
            data: articles,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get articles error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch articles'
        });
    }
};

export const getArticle = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user?._id; // Optional for guest users

        const article = await Article.findOne({ slug, published: true })
            .populate('authorId', 'displayName email');

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        // Track view for logged-in users only (one view per user)
        if (userId) {
            try {
                // Try to create a new view record
                await View.create({
                    userId,
                    targetType: 'Article',
                    targetId: article._id
                });

                // If successful, increment the view count
                article.viewsCount += 1;
                await article.save();
            } catch (viewError) {
                // If view already exists (duplicate key error), don't increment
                if (viewError.code !== 11000) {
                    console.error('View tracking error:', viewError);
                }
            }
        }

        res.json({
            success: true,
            data: article
        });
    } catch (error) {
        console.error('Get article error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch article'
        });
    }
};

export const getArticleById = async (req, res) => {
    try {
        const { id } = req.params;

        const article = await Article.findById(id)
            .populate('authorId', 'displayName email');

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        res.json({
            success: true,
            data: article
        });
    } catch (error) {
        console.error('Get article by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch article'
        });
    }
};

export const updateArticle = async (req, res) => {
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
        const { title, content, excerpt, featuredImage, category, tags, published, productLinks } = req.body;

        const article = await Article.findById(id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        // Check if user is admin or author
        if (req.user.role !== 'admin' && article.authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to edit this article'
            });
        }
        
        // --- Parse strings from form-data if they exist ---
        const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        let parsedProductLinks;
        if (productLinks) {
             const tempLinks = typeof productLinks === 'string' ? JSON.parse(productLinks) : productLinks;
             parsedProductLinks = tempLinks.map(link => ({
                ...link,
                productSlug: slugify(link.productName)
             }));
        }
        // --- End parse ---

        article.title = title || article.title;
        article.content = content || article.content;
        article.excerpt = excerpt || article.excerpt;
        article.featuredImage = featuredImage || article.featuredImage;
        article.category = category || article.category;
        article.tags = parsedTags || article.tags;
        article.productLinks = parsedProductLinks || article.productLinks;
        article.published = (published === 'true' || published === true);

        // The pre('save') hook in Article.js will automatically update
        // the slug if the title has been modified.

        await article.save();
        await article.populate('authorId', 'displayName email');

        res.json({
            success: true,
            message: 'Article updated successfully',
            data: article
        });
    } catch (error) {
        console.error('Update article error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update article'
        });
    }
};

export const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;

        const article = await Article.findById(id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        // Check if user is admin or author
        if (req.user.role !== 'admin' && article.authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this article'
            });
        }

        await Article.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Article deleted successfully'
        });
    } catch (error) {
        console.error('Delete article error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete article'
        });
    }
};

export const getFeaturedArticles = async (req, res) => {
    try {
        const { limit = 3 } = req.query;

        const articles = await Article.find({ published: true })
            .populate('authorId', 'displayName email')
            .sort({ viewsCount: -1, publishedAt: -1 })
            .limit(parseInt(limit))
            .select('-content');

        res.json({
            success: true,
            data: articles
        });
    } catch (error) {
        console.error('Get featured articles error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured articles'
        });
    }
};