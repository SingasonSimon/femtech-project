import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ManagePeriodLogsPage = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLog, setSelectedLog] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Redirect if not admin
    if (!isAdmin) {
        navigate('/dashboard');
        return null;
    }

    // Fetch all period entries (admin view)
    const { data: logsData, isLoading } = useQuery({
        queryKey: ['adminPeriodLogs', currentPage],
        queryFn: async () => {
            const response = await api.get(`/admin/period-logs?page=${currentPage}&limit=20`);
            return response.data;
        }
    });

    // Delete log mutation
    const deleteLogMutation = useMutation({
        mutationFn: async (logId) => {
            const response = await api.delete(`/periods/${logId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminPeriodLogs']);
            queryClient.invalidateQueries(['adminStats']);
            toast.success('Period log deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete period log');
        }
    });

    // Update log mutation
    const updateLogMutation = useMutation({
        mutationFn: async ({ logId, data }) => {
            const response = await api.put(`/periods/${logId}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminPeriodLogs']);
            setShowEditModal(false);
            setSelectedLog(null);
            toast.success('Period log updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update period log');
        }
    });

    const handleDeleteLog = (log) => {
        if (window.confirm(`Are you sure you want to delete this period log from ${new Date(log.startDate).toLocaleDateString()}? This action cannot be undone.`)) {
            deleteLogMutation.mutate(log._id);
        }
    };

    const handleEditLog = (log) => {
        setSelectedLog({
            ...log,
            startDate: new Date(log.startDate).toISOString().split('T')[0],
            endDate: log.endDate ? new Date(log.endDate).toISOString().split('T')[0] : ''
        });
        setShowEditModal(true);
    };

    const handleUpdateLog = (e) => {
        e.preventDefault();
        updateLogMutation.mutate({
            logId: selectedLog._id,
            data: {
                startDate: selectedLog.startDate,
                endDate: selectedLog.endDate,
                flow: selectedLog.flow,
                symptoms: selectedLog.symptoms || [],
                notes: selectedLog.notes || ''
            }
        });
    };

    const logs = logsData?.data || [];
    const pagination = logsData?.pagination || { current: 1, pages: 1, total: 0 };

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
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                Manage Period Logs
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                View and manage all user period tracking entries
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    {pagination.total}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Logs</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {logs.filter(log => log.endDate).length}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {logs.filter(log => !log.endDate).length}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Ongoing</div>
                            </div>
                        </div>
                    </div>

                    {/* Period Logs Table */}
                    {isLoading ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading period logs...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                            <p className="text-gray-600 dark:text-gray-400">No period logs found</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    User
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Start Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    End Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Flow
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Duration
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {logs.map((log) => (
                                                <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {log.userId?.displayName || 'Unknown User'}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {log.userId?.email || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {new Date(log.startDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {log.endDate ? new Date(log.endDate).toLocaleDateString() : 'Ongoing'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.flow === 'light' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                                log.flow === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                            }`}>
                                                            {log.flow}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {log.periodDuration ? `${log.periodDuration} days` : 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex flex-col gap-2">
                                                            <button
                                                                onClick={() => handleEditLog(log)}
                                                                className="inline-flex items-center justify-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteLog(log)}
                                                                disabled={deleteLogMutation.isPending}
                                                                className="inline-flex items-center justify-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {deleteLogMutation.isPending ? (
                                                                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                ) : '🗑️ Delete'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-4">
                                {logs.map((log) => (
                                    <div key={log._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {log.userId?.displayName || 'Unknown User'}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {log.userId?.email || 'N/A'}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${log.flow === 'light' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                    log.flow === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                {log.flow}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                                                <span className="text-gray-900 dark:text-white">
                                                    {new Date(log.startDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                                                <span className="text-gray-900 dark:text-white">
                                                    {log.endDate ? new Date(log.endDate).toLocaleDateString() : 'Ongoing'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                                                <span className="text-gray-900 dark:text-white">
                                                    {log.periodDuration ? `${log.periodDuration} days` : 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleEditLog(log)}
                                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLog(log)}
                                                disabled={deleteLogMutation.isPending}
                                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mt-6">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing page {pagination.current} of {pagination.pages} ({pagination.total} total logs)
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                                                disabled={currentPage === pagination.pages}
                                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </motion.div>
            </main>

            {/* Edit Modal */}
            {showEditModal && selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Edit Period Log</h2>
                        <form onSubmit={handleUpdateLog} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    value={selectedLog.startDate}
                                    onChange={(e) => setSelectedLog({ ...selectedLog, startDate: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={selectedLog.endDate || ''}
                                    onChange={(e) => setSelectedLog({ ...selectedLog, endDate: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Flow *
                                </label>
                                <select
                                    value={selectedLog.flow}
                                    onChange={(e) => setSelectedLog({ ...selectedLog, flow: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="light">Light</option>
                                    <option value="medium">Medium</option>
                                    <option value="heavy">Heavy</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    value={selectedLog.notes || ''}
                                    onChange={(e) => setSelectedLog({ ...selectedLog, notes: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedLog(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateLogMutation.isPending}
                                    className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updateLogMutation.isPending ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </>
                                    ) : 'Update Log'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

