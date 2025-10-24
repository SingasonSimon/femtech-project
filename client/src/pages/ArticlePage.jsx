import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';

export const ArticlePage = () => {
    const { slug } = useParams();

    // Fetch article by slug
    const { data: articleData, isLoading, error } = useQuery({
        queryKey: ['article', slug],
        queryFn: async () => {
            const response = await api.get(`/articles/${slug}`);
            return response.data;
        },
        enabled: !!slug
    });

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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !articleData?.data) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Article Not Found
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            The article you're looking for doesn't exist or has been removed.
                        </p>
                        <Link
                            to="/blog"
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Back to Blog
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const article = articleData.data;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.article
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Featured Image */}
                    {article.featuredImage && (
                        <div className="h-64 md:h-96 bg-gray-200 dark:bg-gray-700">
                            <img
                                src={article.featuredImage}
                                alt={article.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-8">
                        {/* Article Header */}
                        <header className="mb-8">
                            <div className="flex items-center space-x-3 mb-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(article.category)}`}>
                                    {article.category}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {article.readingTime} min read
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {article.viewsCount} views
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                {article.title}
                            </h1>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {article.authorId?.displayName || 'Anonymous'}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(article.publishedAt || article.createdAt)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Link
                                        to="/blog"
                                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                                    >
                                        ← Back to Blog
                                    </Link>
                                </div>
                            </div>
                        </header>

                        {/* Article Content */}
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <div
                                className="text-gray-700 dark:text-gray-300 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: article.content }}
                            />
                        </div>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                    Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {article.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Author Info */}
                        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                    <span className="text-primary-600 dark:text-primary-400 font-semibold text-lg">
                                        {(article.authorId?.displayName || 'A').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {article.authorId?.displayName || 'Anonymous'}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        FemTech Contributor
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.article>

                {/* Related Articles or CTA */}
                <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Stay Informed
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Get the latest insights on women's health, wellness, and technology.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/blog"
                                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                Read More Articles
                            </Link>
                            <Link
                                to="/forum"
                                className="px-6 py-3 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            >
                                Join Community
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};
