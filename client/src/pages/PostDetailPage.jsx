// client/src/pages/PostDetailPage.jsx

import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import { motion } from 'framer-motion';
import { ReplyList } from '../components/ReplyList';
import { ReplyForm } from '../components/ReplyForm';

// Helper to format the date
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const PostDetailPage = () => {
    const { id: postId } = useParams();
    const queryClient = useQueryClient();

    // Query 1: Fetch the post itself (no change)
    const { data: postData, isLoading: postLoading, error: postError } = useQuery({
        queryKey: ['post', postId],
        queryFn: async () => {
            const response = await api.get(`/posts/${postId}`);
            return response.data.data;
        },
        enabled: !!postId, 
    });

    // --- START OF MODIFICATION ---
    
    // Query 2: Fetch the replies AND the liked status
    const { data: repliesResponse, isLoading: repliesLoading } = useQuery({
        queryKey: ['replies', postId],
        queryFn: async () => {
            const response = await api.get(`/posts/${postId}/replies`);
            // We now expect response.data to be { data: [], userLikedReplies: [] }
            return response.data; 
        },
        enabled: !!postId, 
    });
    
    // --- END OF MODIFICATION ---


    // onReplySuccess function (no change)
    const onReplySuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['replies', postId] });
        queryClient.invalidateQueries({ queryKey: ['post', postId] });
    };

    // Loading & Error states (no change)
    if (postLoading || (!!postId && repliesLoading)) { 
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                </div>
            </div>
        );
    }
    if (postError) { 
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline"> {postError.message}</span>
                    </div>
                </div>
            </div>
        );
     }
    if (!postData) { 
        return (
             <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Post not found.</h1>
                </div>
            </div>
        )
     }

    
    // --- START OF MODIFICATION ---
    // Extract data from the new repliesResponse object
    const repliesData = repliesResponse?.data || [];
    const userLikedReplies = repliesResponse?.userLikedReplies || [];
    // --- END OF MODIFICATION ---


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Post Content (no change) */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {postData.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-6 text-sm text-gray-500 dark:text-gray-400">
                            <span>by {postData.userId?.displayName || 'Anonymous'}</span>
                            <span>•</span>
                            <span>{formatDate(postData.createdAt)}</span>
                            <span>•</span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                {postData.category}
                            </span>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                            {postData.content}
                        </div>
                        
                        {/* Stats - Likes, Replies, Views (no change) */}
                        <div className="flex items-center space-x-6 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {/* ... likes ... */}
                            {/* ... replies ... */}
                            {/* ... views ... */}
                        </div>
                    </div>


                    {/* Replies Section */}
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Replies ({postData.repliesCount})
                        </h2>
                        
                        {/* Reply Form (no change) */}
                        <div className="mb-8">
                           <ReplyForm postId={postId} onSuccess={onReplySuccess} />
                        </div>
                        
                        {/* Reply List (MODIFIED) */}
                        <div className="space-y-6">
                            {repliesLoading ? (
                                <p className="text-gray-500 dark:text-gray-400">Loading replies...</p>
                            ) : repliesData && repliesData.length > 0 ? (
                                // --- PASS NEW PROP ---
                                <ReplyList 
                                    replies={repliesData} 
                                    userLikedReplies={userLikedReplies} // Pass the liked list
                                    postId={postId}
                                    onSuccess={onReplySuccess}
                                />
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">
                                    Be the first to reply.
                                </p>
                            )}
                        </div>
                    </div>

                </motion.div>
            </main>
        </div>
    );
};