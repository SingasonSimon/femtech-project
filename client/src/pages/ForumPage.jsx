import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';

export const ForumPage = () => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [filters, setFilters] = useState({
        category: 'all',
        sort: 'newest'
    });
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'general',
        tags: []
    });
    const [likedPosts, setLikedPosts] = useState(new Set());
    const [likingPosts, setLikingPosts] = useState(new Set());

    const queryClient = useQueryClient();

    // Fetch posts
    const { data: postsData, isLoading: postsLoading, error: postsError } = useQuery({
        queryKey: ['posts', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.category !== 'all') params.append('category', filters.category);
            if (filters.sort) params.append('sort', filters.sort);

            console.log('Fetching posts with params:', params.toString());
            const response = await api.get(`/posts?${params.toString()}`);
            console.log('Posts response:', response.data);
            return response.data;
        }
    });

    // Initialize liked posts when posts data changes
    useEffect(() => {
        if (postsData?.userLikedPosts) {
            setLikedPosts(new Set(postsData.userLikedPosts));
        }
    }, [postsData?.userLikedPosts]);

    // Create post mutation
    const createPostMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/posts', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['posts']);
            setShowCreateForm(false);
            setFormData({
                title: '',
                content: '',
                category: 'general',
                tags: []
            });
        }
    });

    // Like post mutation
    const likePostMutation = useMutation({
        mutationFn: async (postId) => {
            const response = await api.post(`/posts/${postId}/like`);
            return { postId, ...response.data };
        },
        onMutate: (postId) => {
            // Add to liking set to prevent double-clicking
            setLikingPosts(prev => new Set(prev).add(postId));
        },
        onSuccess: (data) => {
            const { postId, liked } = data;
            setLikedPosts(prev => {
                const newSet = new Set(prev);
                if (liked) {
                    newSet.add(postId);
                } else {
                    newSet.delete(postId);
                }
                return newSet;
            });
            queryClient.invalidateQueries(['posts']);
        },
        onError: (error, postId) => {
            console.error('Like error:', error);
        },
        onSettled: (data, error, postId) => {
            // Remove from liking set regardless of success/failure
            setLikingPosts(prev => {
                const newSet = new Set(prev);
                newSet.delete(postId);
                return newSet;
            });
        }
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createPostMutation.mutate(formData);
    };

    const handleLike = (postId) => {
        // Prevent double-clicking by checking if already liking this post
        if (likingPosts.has(postId)) {
            return;
        }
        likePostMutation.mutate(postId);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCategoryColor = (category) => {
        const colors = {
            general: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            health: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
            wellness: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
            products: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
            support: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
            tips: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
        };
        return colors[category] || colors.general;
    };

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'general', label: 'General' },
        { value: 'health', label: 'Health' },
        { value: 'wellness', label: 'Wellness' },
        { value: 'products', label: 'Products' },
        { value: 'support', label: 'Support' },
        { value: 'tips', label: 'Tips' }
    ];

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'popular', label: 'Most Popular' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Community Forum
                        </h1>
                        <motion.button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {showCreateForm ? 'Cancel' : 'Create Post'}
                        </motion.button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Category
                                </label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {categories.map(category => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Sort By
                                </label>
                                <select
                                    value={filters.sort}
                                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Create Post Form */}
                    {showCreateForm && (
                        <motion.div
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Create New Post
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter post title..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        {categories.slice(1).map(category => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Content
                                    </label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleInputChange}
                                        required
                                        rows={6}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Share your thoughts, questions, or experiences..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        type="submit"
                                        disabled={createPostMutation.isPending}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* Posts List */}
                    <div className="space-y-4">
                        {postsError && (
                            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4">
                                <strong className="font-bold">Error loading posts:</strong>
                                <span className="block sm:inline"> {postsError.message}</span>
                            </div>
                        )}
                        {postsLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                            </div>
                        ) : postsData?.data && postsData.data.length > 0 ? (
                            postsData.data.map((post, index) => (
                                <motion.div
                                    key={post._id}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <Link
                                                to={`/forum/${post._id}`}
                                                className="text-xl font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                            >
                                                {post.title}
                                            </Link>
                                            <div className="flex items-center space-x-3 mt-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                                                    {post.category}
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    by {post.userId?.displayName || 'Anonymous'}
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatDate(post.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                                        {post.content}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <motion.button
                                                onClick={() => handleLike(post._id)}
                                                disabled={likingPosts.has(post._id)}
                                                className={`flex items-center space-x-1 transition-colors ${likedPosts.has(post._id)
                                                    ? 'text-red-500 dark:text-red-400'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                                                    } ${likingPosts.has(post._id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                whileHover={!likingPosts.has(post._id) ? { scale: 1.05 } : {}}
                                                whileTap={!likingPosts.has(post._id) ? { scale: 0.95 } : {}}
                                            >
                                                <svg
                                                    className={`w-5 h-5 ${likingPosts.has(post._id) ? 'animate-pulse' : ''}`}
                                                    fill={likedPosts.has(post._id) ? "currentColor" : "none"}
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                <span>{post.likesCount}</span>
                                            </motion.button>
                                            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <span>{post.repliesCount}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <span>{post.viewsCount}</span>
                                            </div>
                                        </div>
                                        <Link
                                            to={`/forum/${post._id}`}
                                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                                        >
                                            Read More →
                                        </Link>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-gray-500 dark:text-gray-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No posts yet
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Be the first to start a conversation in the community!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};
