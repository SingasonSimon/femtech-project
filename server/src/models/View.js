import mongoose from 'mongoose';

const viewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetType: {
        type: String,
        enum: ['Post', 'Article', 'Product'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    viewedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to ensure one view per user per post
viewSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

// TTL index to automatically delete views older than 30 days (optional)
viewSchema.index({ viewedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model('View', viewSchema);
