import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';

export const DashboardPage = () => {
    const { user } = useAuth();

    // Fetch user's period insights
    const { data: insights } = useQuery({
        queryKey: ['userInsights'],
        queryFn: async () => {
            const response = await api.get('/periods/insights');
            return response.data.data;
        }
    });

    // Fetch recent activity (for admin)
    const { data: recentActivity } = useQuery({
        queryKey: ['recentActivity'],
        queryFn: async () => {
            if (user?.role !== 'admin') return null;
            const response = await api.get('/admin/activity');
            return response.data.data;
        },
        enabled: user?.role === 'admin'
    });

    // Fetch admin stats (for admin)
    const { data: adminStats } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            if (user?.role !== 'admin') return null;
            const response = await api.get('/admin/stats');
            return response.data.data;
        },
        enabled: user?.role === 'admin'
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                        Welcome back, {user?.displayName || 'User'}!
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Quick Actions */}
                        <motion.div
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Quick Actions
                            </h2>
                            <div className="space-y-3">
                                <Link to="/tracker" className="block w-full text-left p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
                                    📊 Log Period Entry
                                </Link>
                                <Link to="/forum" className="block w-full text-left p-3 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-900/30 transition-colors">
                                    💬 Create Forum Post
                                </Link>
                                <Link to="/blog" className="block w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    📚 Read Articles
                                </Link>
                            </div>
                        </motion.div>

                        {/* Health Summary */}
                        <motion.div
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Health Summary
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Cycle Length:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">
                                        {insights?.averageCycleLength ? `${insights.averageCycleLength} days` : 'Not enough data'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Period Length:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">
                                        {insights?.averagePeriodLength ? `${insights.averagePeriodLength} days` : 'Not enough data'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Next Expected:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">
                                        {insights?.nextPredictedDate ? new Date(insights.nextPredictedDate).toLocaleDateString() : 'Not enough data'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Cycles Tracked:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">
                                        {insights?.totalCycles || 0}
                                    </span>
                                </div>
                                {insights?.tips && insights.tips.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">💡 Quick Tip:</div>
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            {insights.tips[0]}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Recent Activity
                            </h2>
                            <div className="space-y-3">
                                {user?.role === 'admin' && recentActivity ? (
                                    recentActivity.length > 0 ? (
                                        recentActivity.slice(0, 5).map((activity, index) => (
                                            <div key={index} className="text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {activity.type}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                                    {new Date(activity.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            No recent activity in the system.
                                        </div>
                                    )
                                ) : (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        No recent activity yet. Start by logging your first period entry!
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Admin Panel (if user is admin) */}
                    {user?.role === 'admin' && (
                        <motion.div
                            className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Admin Panel
                            </h2>

                            {/* Admin Stats */}
                            {adminStats && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {adminStats.totalUsers || 0}
                                        </div>
                                        <div className="text-sm text-blue-700 dark:text-blue-300">Total Users</div>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {adminStats.totalPosts || 0}
                                        </div>
                                        <div className="text-sm text-green-700 dark:text-green-300">Forum Posts</div>
                                    </div>
                                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                            {adminStats.totalArticles || 0}
                                        </div>
                                        <div className="text-sm text-purple-700 dark:text-purple-300">Articles</div>
                                    </div>
                                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                            {adminStats.totalProducts || 0}
                                        </div>
                                        <div className="text-sm text-orange-700 dark:text-orange-300">Products</div>
                                    </div>
                                </div>
                            )}

                            {/* Admin Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Link to="/admin/users" className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-center">
                                    👥 Manage Users
                                </Link>
                                <Link to="/admin/articles" className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-center">
                                    📝 Manage Articles
                                </Link>
                                <Link to="/admin/analytics" className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-center">
                                    📊 View Analytics
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </main>
        </div>
    );
};
