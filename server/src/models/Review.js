import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetType: {
        type: String,
        required: true,
        enum: ['Article', 'Product']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'targetType'
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    helpful: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    verified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
reviewSchema.index({ targetType: 1, targetId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: 1 });

// Ensure one review per user per target
reviewSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

// Update target's rating when review is created/updated/deleted
reviewSchema.post('save', async function () {
    await updateTargetRating(this.targetType, this.targetId);
});

reviewSchema.post('remove', async function () {
    await updateTargetRating(this.targetType, this.targetId);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await updateTargetRating(doc.targetType, doc.targetId);
    }
});

// Helper function to update target rating
async function updateTargetRating(targetType, targetId) {
    const Review = mongoose.model('Review');
    const reviews = await Review.find({ targetType, targetId });

    if (reviews.length === 0) {
        const Model = mongoose.model(targetType);
        await Model.findByIdAndUpdate(targetId, {
            'ratings.average': 0,
            'ratings.count': 0
        });
        return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const Model = mongoose.model(targetType);
    await Model.findByIdAndUpdate(targetId, {
        'ratings.average': Math.round(averageRating * 10) / 10,
        'ratings.count': reviews.length
    });
}

export default mongoose.model('Review', reviewSchema);

