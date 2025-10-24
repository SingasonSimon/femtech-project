// server/src/models/Article.js

import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        trim: true
    },
    excerpt: {
        type: String,
        maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    featuredImage: {
        type: String
    },
    category: {
        type: String,
        enum: ['health', 'wellness', 'products', 'lifestyle', 'education', 'news'],
        default: 'health'
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    productLinks: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        productName: {
            type: String,
            required: true
        },
        productSlug: {
            type: String,
            required: true
        },
        description: {
            type: String,
            maxlength: [200, 'Product link description cannot exceed 200 characters']
        }
    }],
    viewsCount: {
        type: Number,
        default: 0
    },
    published: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date
    },
    readingTime: {
        type: Number, // in minutes
        default: 5
    }
}, {
    timestamps: true
});

// Index for efficient queries
articleSchema.index({ authorId: 1, createdAt: -1 });
articleSchema.index({ published: 1, publishedAt: -1 });
articleSchema.index({ category: 1, published: 1 });
articleSchema.index({ tags: 1, published: 1 });


// --- START OF FIX ---

// 1. Generate slug from title BEFORE validation
articleSchema.pre('validate', async function (next) {
    if (this.isModified('title') || !this.slug) {
        let baseSlug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');

        // Check for uniqueness and add number if needed
        let slug = baseSlug;
        let counter = 1;
        while (true) {
            // Use 'this.constructor' to reference the model
            const existingArticle = await this.constructor.findOne({ slug, _id: { $ne: this._id } });
            if (!existingArticle) {
                break;
            }
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        this.slug = slug;
    }
    next();
});

// 2. Keep the rest of the logic in pre('save')
articleSchema.pre('save', function (next) {
    // Set publishedAt when published becomes true
    if (this.isModified('published') && this.published && !this.publishedAt) {
        this.publishedAt = new Date();
    }

    // Calculate reading time (rough estimate: 200 words per minute)
    if (this.isModified('content')) {
        const wordCount = this.content.split(/\s+/).length;
        this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    next();
});

// --- END OF FIX ---


// Virtual for URL
articleSchema.virtual('url').get(function () {
    return `/blog/${this.slug}`;
});

export default mongoose.model('Article', articleSchema);