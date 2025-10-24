// client/src/components/ReplyForm.jsx

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const ReplyForm = ({ postId, parentReplyId = null, onSuccess, onCancel }) => {
    const [content, setContent] = useState('');

    const createReplyMutation = useMutation({
        mutationFn: (newReply) => {
            return api.post(`/posts/${postId}/replies`, newReply);
        },
        onSuccess: () => {
            toast.success('Reply posted!');
            setContent('');
            if (onSuccess) onSuccess(); // This refetches the replies
            if (onCancel) onCancel(); // This closes the reply box if it's nested
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to post reply.');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (content.trim() === '') return;

        
        // Create the payload with only the content
        const payload = { content };

        // Only add parentReplyId to the payload if it actually exists
        if (parentReplyId) {
            payload.parentReplyId = parentReplyId;
        }

        // Send the new payload
        createReplyMutation.mutate(payload);
       
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <textarea
                    rows="4"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={parentReplyId ? "Write your reply..." : "Write a top-level reply..."}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
            </div>
            <div className="flex justify-end space-x-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={createReplyMutation.isPending}
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                    {createReplyMutation.isPending ? 'Posting...' : 'Post Reply'}
                </button>
            </div>
        </form>
    );
};