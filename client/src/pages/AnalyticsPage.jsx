import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const AnalyticsPage = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    // Redirect if not admin
    if (!isAdmin) {
        navigate('/dashboard');
        return null;
    }

    // Fetch admin stats
    const { data: adminStats, isLoading: statsLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const response = await api.get('/admin/stats');
            return response.data.data;
        }
    });

    // Fetch recent activity
    const { data: recentActivity, isLoading: activityLoading } = useQuery({
        queryKey: ['recentActivity'],
        queryFn: async () => {
            const response = await api.get('/admin/activity');
            return response.data.data;
        }
    });

    const StatCard = ({ title, value, icon, color, bgColor }) => (
        <motion.div
            className={`${bgColor} rounded-lg p-6 shadow-md`}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm font-medium ${color} mb-1`}>{title}</p>
                    <p className={`text-3xl font-bold ${color}`}>{value || 0}</p>
                </div>
                <div className="text-4xl">{icon}</div>
            </div>
        </motion.div>
    );

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
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Analytics Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                View platform statistics and insights
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>

                    {statsLoading ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <StatCard
                                    title="Total Users"
                                    value={adminStats?.totalUsers}
                                    icon="👥"
                                    color="text-blue-700 dark:text-blue-300"
                                    bgColor="bg-blue-50 dark:bg-blue-900/20"
                                />
                                <StatCard
                                    title="Forum Posts"
                                    value={adminStats?.totalPosts}
                                    icon="💬"
                                    color="text-green-700 dark:text-green-300"
                                    bgColor="bg-green-50 dark:bg-green-900/20"
                                />
                                <StatCard
                                    title="Articles"
                                    value={adminStats?.totalArticles}
                                    icon="📝"
                                    color="text-purple-700 dark:text-purple-300"
                                    bgColor="bg-purple-50 dark:bg-purple-900/20"
                                />
                                <StatCard
                                    title="Products"
                                    value={adminStats?.totalProducts}
                                    icon="📦"
                                    color="text-orange-700 dark:text-orange-300"
                                    bgColor="bg-orange-50 dark:bg-orange-900/20"
                                />
                            </div>

                            {/* Additional Stats */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Period Entries */}
                                <motion.div
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                                    whileHover={{ y: -2 }}
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Period Tracking
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400 mb-2">Total Entries</p>
                                            <p className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                                                {adminStats?.totalPeriodEntries || 0}
                                            </p>
                                        </div>
                                        <div className="text-6xl">📊</div>
                                    </div>
                                </motion.div>

                                {/* Quick Stats Summary */}
                                <motion.div
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                                    whileHover={{ y: -2 }}
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Platform Health
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {adminStats?.totalUsers || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Community Posts</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {adminStats?.totalPosts || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Published Articles</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {adminStats?.totalArticles || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Listed Products</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {adminStats?.totalProducts || 0}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Recent Activity Feed */}
                            <motion.div
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Recent Activity
                                </h3>
                                {activityLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                    </div>
                                ) : recentActivity?.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentActivity.map((activity, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                                            >
                                                <div className="flex-shrink-0 mt-1">
                                                    {activity.category === 'forum' && '💬'}
                                                    {activity.category === 'user' && '👤'}
                                                    {activity.category === 'content' && '📝'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {activity.type}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {new Date(activity.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                                        No recent activity
                                    </p>
                                )}
                            </motion.div>
                        </>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

