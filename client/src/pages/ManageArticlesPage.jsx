import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ManageArticlesPage = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Redirect if not admin
    if (!isAdmin) {
        navigate('/dashboard');
        return null;
    }

    // Fetch articles
    const { data: articlesData, isLoading } = useQuery({
        queryKey: ['adminArticles', searchTerm, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter !== 'all') {
                params.append('published', statusFilter === 'published');
            }

            const response = await api.get(`/articles?${params.toString()}`);
            return response.data.data;
        }
    });

    // Delete article mutation
    const deleteArticleMutation = useMutation({
        mutationFn: async (slug) => {
            const response = await api.delete(`/articles/${slug}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminArticles']);
            queryClient.invalidateQueries(['adminStats']);
            toast.success('Article deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete article');
        }
    });

    // Toggle publish status mutation
    const togglePublishMutation = useMutation({
        mutationFn: async ({ slug, published }) => {
            const response = await api.put(`/articles/${slug}`, { published });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminArticles']);
            toast.success('Article status updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update article');
        }
    });

    const handleDeleteArticle = (slug, title) => {
        if (window.confirm(`Are you sure you want to delete article "${title}"? This action cannot be undone.`)) {
            deleteArticleMutation.mutate(slug);
        }
    };

    const handleTogglePublish = (slug, currentStatus) => {
        const newStatus = !currentStatus;
        const action = newStatus ? 'publish' : 'unpublish';
        if (window.confirm(`Are you sure you want to ${action} this article?`)) {
            togglePublishMutation.mutate({ slug, published: newStatus });
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            health: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
            wellness: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
            products: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
            lifestyle: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
            education: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
            news: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        };
        return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Header */}
                    <div className="flex flex-col gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Manage Articles
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                View, edit, and manage all blog articles
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                to="/blog/create"
                                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl text-center"
                            >
                                Create Article
                            </Link>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="all">All Articles</option>
                                <option value="published">Published Only</option>
                                <option value="draft">Drafts Only</option>
                            </select>
                        </div>
                    </div>

                    {/* Articles List */}
                    {isLoading ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    ) : articlesData?.length > 0 ? (
                        <div className="space-y-4">
                            {articlesData.map((article) => (
                                <motion.div
                                    key={article._id}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                                    whileHover={{ y: -2 }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                                                    {article.category}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${article.published
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                    }`}>
                                                    {article.published ? 'Published' : 'Draft'}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                                {article.title}
                                            </h3>
                                            {article.excerpt && (
                                                <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                    {article.excerpt}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                <span>By {article.authorId?.displayName || 'Unknown'}</span>
                                                <span>•</span>
                                                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{article.viewsCount || 0} views</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 ml-4">
                                            <Link
                                                to={`/blog/${article.slug}`}
                                                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={() => handleTogglePublish(article.slug, article.published)}
                                                disabled={togglePublishMutation.isPending}
                                                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {togglePublishMutation.isPending && (
                                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                )}
                                                {article.published ? 'Unpublish' : 'Publish'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteArticle(article.slug, article.title)}
                                                disabled={deleteArticleMutation.isPending}
                                                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {deleteArticleMutation.isPending && (
                                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                )}
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                No articles found
                            </p>
                            <Link
                                to="/blog/create"
                                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                            >
                                Create Your First Article
                            </Link>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

