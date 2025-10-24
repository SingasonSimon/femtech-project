import mongoose from 'mongoose';

const periodEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    flow: {
        type: String,
        enum: ['light', 'medium', 'heavy'],
        default: 'medium'
    },
    symptoms: [{
        type: String,
        enum: ['cramps', 'bloating', 'headache', 'mood_swings', 'fatigue', 'nausea', 'back_pain', 'breast_tenderness', 'acne', 'food_cravings']
    }],
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    cycleLength: {
        type: Number,
        min: [15, 'Cycle length must be at least 15 days'],
        max: [45, 'Cycle length must be at most 45 days']
    },
    periodDuration: {
        type: Number,
        min: [1, 'Period duration must be at least 1 day'],
        max: [10, 'Period duration must be at most 10 days']
    }
}, {
    timestamps: true
});

// Calculate cycle length and period duration before saving
periodEntrySchema.pre('save', function (next) {
    if (this.isNew && this.startDate && this.endDate) {
        // Calculate period duration
        const duration = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)) + 1;
        this.periodDuration = duration;
    }
    next();
});

// Index for efficient queries
periodEntrySchema.index({ userId: 1, startDate: -1 });

// Virtual for cycle length calculation (will be calculated in controller)
periodEntrySchema.virtual('calculatedCycleLength').get(function () {
    // This will be calculated in the controller based on previous entries
    return null;
});

export default mongoose.model('PeriodEntry', periodEntrySchema);
