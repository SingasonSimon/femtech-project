// client/src/components/ReplyList.jsx

import { useState, useMemo } from 'react'; // <-- Import useMemo
import { useMutation, useQueryClient } from '@tanstack/react-query'; // <-- Import hooks
import { api } from '../services/api'; // <-- Import api
import toast from 'react-hot-toast'; // <-- Import toast
import { ReplyForm } from './ReplyForm';

// Helper to format the date (no change)
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// --- ReplyItem Component (where the logic goes) ---
const ReplyItem = ({ reply, postId, onSuccess, userLikedRepliesSet }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const queryClient = useQueryClient();

    // Check if the current user has liked this specific reply
    const isLiked = userLikedRepliesSet.has(reply._id);

    // Mutation for liking/unliking a reply
    const likeReplyMutation = useMutation({
        mutationFn: () => {
            // Call the new route we created
            return api.post(`/posts/reply/${reply._id}/like`);
        },
        onSuccess: () => {
            // Refetch all replies to get new like counts and liked status
            queryClient.invalidateQueries({ queryKey: ['replies', postId] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to like reply.');
        }
    });

    const handleLikeClick = () => {
        if (likeReplyMutation.isPending) return;
        likeReplyMutation.mutate();
    };

    return (
        <div className="flex space-x-4">
            {/* Avatar placeholder (no change) */}
            
            <div className="flex-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                    {/* Reply Header (no change) */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {reply.userId?.displayName || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(reply.createdAt)}
                        </span>
                    </div>

                    {/* Reply Content (no change) */}
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {reply.content}
                    </p>

                    {/* --- Reply Actions (MODIFIED) --- */}
                    <div className="flex items-center space-x-4 mt-3">
                        <button 
                            onClick={handleLikeClick}
                            disabled={likeReplyMutation.isPending}
                            className={`flex items-center space-x-1 text-xs font-medium transition-colors ${
                                isLiked
                                ? 'text-red-500 dark:text-red-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                            } ${likeReplyMutation.isPending ? 'opacity-50' : ''}`}
                        >
                            <svg
                                className="w-4 h-4"
                                fill={isLiked ? "currentColor" : "none"}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>Like ({reply.likesCount})</span>
                        </button>
                        <button 
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                            Reply
                        </button>
                    </div>
                </div>

                {/* Nested Reply Form (no change) */}
                {showReplyForm && (
                    <div className="mt-4 ml-4">
                        <ReplyForm 
                            postId={postId}
                            parentReplyId={reply._id}
                            onSuccess={() => {
                                setShowReplyForm(false);
                                onSuccess();
                            }}
                            onCancel={() => setShowReplyForm(false)}
                        />
                    </div>
                )}

                {/* Nested Replies (MODIFIED to pass prop) */}
                {reply.nestedReplies && reply.nestedReplies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                        <ReplyList 
                            replies={reply.nestedReplies} 
                            userLikedRepliesSet={userLikedRepliesSet} // Pass the Set down
                            postId={postId}
                            onSuccess={onSuccess}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main List Component (MODIFIED) ---
export const ReplyList = ({ replies, userLikedReplies, postId, onSuccess }) => {
    
    // Convert the array of liked IDs into a Set for fast lookups.
    // useMemo ensures this only runs once when the prop changes.
    const userLikedRepliesSet = useMemo(() => {
        return new Set(userLikedReplies);
    }, [userLikedReplies]);

    return (
        <div className="space-y-6">
            {replies.map(reply => (
                <ReplyItem 
                    key={reply._id} 
                    reply={reply} 
                    postId={postId}
                    onSuccess={onSuccess}
                    userLikedRepliesSet={userLikedRepliesSet} // Pass the Set to each item
                />
            ))}
        </div>
    );
};