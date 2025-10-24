import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        trim: true,
        maxlength: [2000, 'Content cannot exceed 2000 characters']
    },
    parentReplyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reply',
        default: null
    },
    likesCount: {
        type: Number,
        default: 0
    },
    isEdited: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient queries
replySchema.index({ postId: 1, createdAt: 1 });
replySchema.index({ userId: 1, createdAt: -1 });
replySchema.index({ parentReplyId: 1, createdAt: 1 });

export default mongoose.model('Reply', replySchema);
