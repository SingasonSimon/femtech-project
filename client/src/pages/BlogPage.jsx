import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const BlogPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        category: 'all',
        search: ''
    });

    // Fetch articles
    const { data: articlesData, isLoading: articlesLoading } = useQuery({
        queryKey: ['articles', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.category !== 'all') params.append('category', filters.category);
            if (filters.search) params.append('search', filters.search);

            const response = await api.get(`/articles?${params.toString()}`);
            return response.data;
        }
    });

    // Fetch featured articles
    const { data: featuredData } = useQuery({
        queryKey: ['featuredArticles'],
        queryFn: async () => {
            const response = await api.get('/articles/featured');
            return response.data;
        }
    });

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCategoryColor = (category) => {
        const colors = {
            health: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
            wellness: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
            products: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
            lifestyle: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
            education: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
            news: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        };
        return colors[category] || colors.health;
    };

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'health', label: 'Health' },
        { value: 'wellness', label: 'Wellness' },
        { value: 'products', label: 'Products' },
        { value: 'lifestyle', label: 'Lifestyle' },
        { value: 'education', label: 'Education' },
        { value: 'news', label: 'News' }
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
                    <div className="text-center mb-12">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex-1"></div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                FemTech Blog
                            </h1>
                            <div className="flex-1 flex justify-end">
                                {user?.role === 'admin' && (
                                    <motion.button
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/blog/create')}
                                    >
                                        Create Article
                                    </motion.button>
                                )}
                            </div>
                        </div>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Empowering women with knowledge, insights, and expert advice on health, wellness, and technology.
                        </p>
                    </div>
                    {/* Filters */}
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-64">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Search Articles
                                </label>
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Search articles..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
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
                        </div>
                    </motion.div>

                    {/* Featured Articles */}
                    {featuredData?.data && featuredData.data.length > 0 && (
                        <motion.section
                            className="mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Featured Articles
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuredData.data.map((article, index) => (
                                    <motion.div
                                        key={article._id}
                                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                                        whileHover={{ y: -5 }}
                                    >
                                        {article.featuredImage && (
                                            <div className="h-48 bg-gray-200 dark:bg-gray-700">
                                                <img
                                                    src={article.featuredImage}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <div className="flex items-center space-x-2 mb-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                                                    {article.category}
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {article.readingTime} min read
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                                {article.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                                                {article.excerpt}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    by {article.authorId?.displayName || 'Anonymous'}
                                                </div>
                                                <Link
                                                    to={`/blog/${article.slug}`}
                                                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors"
                                                >
                                                    Read More →
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* Articles List */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            All Articles
                        </h2>

                        {articlesLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                            </div>
                        ) : articlesData?.data && articlesData.data.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {articlesData.data.map((article, index) => (
                                    <motion.div
                                        key={article._id}
                                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                                        whileHover={{ y: -5 }}
                                    >
                                        {article.featuredImage && (
                                            <div className="h-48 bg-gray-200 dark:bg-gray-700">
                                                <img
                                                    src={article.featuredImage}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <div className="flex items-center space-x-2 mb-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                                                    {article.category}
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {article.readingTime} min read
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                                {article.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                                                {article.excerpt}
                                            </p>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="text-gray-500 dark:text-gray-400">
                                                    <div>by {article.authorId?.displayName || 'Anonymous'}</div>
                                                    <div>{formatDate(article.publishedAt || article.createdAt)}</div>
                                                </div>
                                                <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center space-x-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        <span>{article.viewsCount}</span>
                                                    </div>
                                                    <Link
                                                        to={`/blog/${article.slug}`}
                                                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                                                    >
                                                        Read More →
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-gray-500 dark:text-gray-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No articles found
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {filters.search || filters.category !== 'all'
                                            ? 'Try adjusting your search or filter criteria.'
                                            : 'Check back soon for new articles!'
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.section>
                </motion.div>
            </main>
        </div>
    );
};
