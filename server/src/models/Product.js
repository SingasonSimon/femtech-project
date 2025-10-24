import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000
    },
    shortDescription: {
        type: String,
        maxlength: 500
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    originalPrice: {
        type: Number,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['trackers', 'monitors', 'accessories', 'apparel', 'supplements', 'books', 'other']
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    images: [{
        url: String,
        alt: String,
        isPrimary: { type: Boolean, default: false }
    }],
    specifications: {
        dimensions: String,
        weight: String,
        battery: String,
        connectivity: String,
        compatibility: String,
        features: [String],
        materials: [String]
    },
    stock: {
        quantity: {
            type: Number,
            default: 0,
            min: 0
        },
        status: {
            type: String,
            enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'],
            default: 'out_of_stock'
        }
    },
    variants: [{
        name: String,
        value: String,
        price: Number,
        stock: Number
    }],
    tags: [String],
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    viewsCount: {
        type: Number,
        default: 0
    },
    salesCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ price: 1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
    if (this.originalPrice && this.originalPrice > this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
    if (this.stock.quantity === 0) return 'out_of_stock';
    if (this.stock.quantity <= 5) return 'low_stock';
    return 'in_stock';
});

// Pre-save middleware to update stock status and generate SKU
productSchema.pre('save', function (next) {
    // Generate SKU if not provided
    if (!this.sku) {
        const prefix = this.category.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        this.sku = `${prefix}-${timestamp}`;
    }

    // Update stock status
    if (this.stock.quantity === 0) {
        this.stock.status = 'out_of_stock';
    } else if (this.stock.quantity <= 5) {
        this.stock.status = 'low_stock';
    } else {
        this.stock.status = 'in_stock';
    }
    next();
});

// Method to generate SKU
productSchema.methods.generateSKU = function () {
    const prefix = this.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
};

export default mongoose.model('Product', productSchema);
