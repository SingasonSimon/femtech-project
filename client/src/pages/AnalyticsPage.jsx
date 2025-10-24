import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

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

    // Colors for charts
    const COLORS = {
        primary: '#c026d3',
        secondary: '#14b8a6',
        tertiary: '#3b82f6',
        quaternary: '#f59e0b'
    };

    const PIE_COLORS = ['#c026d3', '#14b8a6', '#3b82f6', '#f59e0b', '#ef4444'];

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
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Analytics Dashboard
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                View platform statistics and insights
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-center"
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

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* User Growth Chart */}
                                <motion.div
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        User Growth (Last 30 Days)
                                    </h3>
                                    {adminStats?.userGrowth?.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={250}>
                                            <AreaChart data={adminStats.userGrowth}>
                                                <defs>
                                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                />
                                                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#1f2937',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: '#fff'
                                                    }}
                                                />
                                                <Area type="monotone" dataKey="users" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorUsers)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[250px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                                            No user growth data available
                                        </div>
                                    )}
                                </motion.div>

                                {/* User Role Distribution */}
                                <motion.div
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.15 }}
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        User Role Distribution
                                    </h3>
                                    {adminStats?.userRoles?.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={adminStats.userRoles}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ role, count, percent }) => `${role}: ${count} (${(percent * 100).toFixed(0)}%)`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="count"
                                                >
                                                    {adminStats.userRoles.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#1f2937',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: '#fff'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[250px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                                            No role distribution data available
                                        </div>
                                    )}
                                </motion.div>

                                {/* Content Creation Trends */}
                                <motion.div
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:col-span-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Content Creation Trends (Last 30 Days)
                                    </h3>
                                    {adminStats?.contentGrowth && (adminStats.contentGrowth.posts?.length > 0 || adminStats.contentGrowth.articles?.length > 0) ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                                <XAxis
                                                    dataKey="date"
                                                    type="category"
                                                    allowDuplicatedCategory={false}
                                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                />
                                                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#1f2937',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: '#fff'
                                                    }}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="count"
                                                    data={adminStats.contentGrowth.posts}
                                                    name="Forum Posts"
                                                    stroke={COLORS.secondary}
                                                    strokeWidth={2}
                                                    dot={{ fill: COLORS.secondary }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="count"
                                                    data={adminStats.contentGrowth.articles}
                                                    name="Articles"
                                                    stroke={COLORS.tertiary}
                                                    strokeWidth={2}
                                                    dot={{ fill: COLORS.tertiary }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                                            No content creation data available
                                        </div>
                                    )}
                                </motion.div>
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

