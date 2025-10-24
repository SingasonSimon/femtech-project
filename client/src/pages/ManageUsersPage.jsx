import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ManageUsersPage = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    // Redirect if not admin
    if (!isAdmin) {
        navigate('/dashboard');
        return null;
    }

    // Fetch users
    const { data: usersData, isLoading } = useQuery({
        queryKey: ['adminUsers', page, searchTerm],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', '10');
            if (searchTerm) params.append('search', searchTerm);

            const response = await api.get(`/admin/users?${params.toString()}`);
            return response.data.data;
        }
    });

    // Update user role mutation
    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, role }) => {
            const response = await api.put(`/admin/users/${userId}/role`, { role });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminUsers']);
            queryClient.invalidateQueries(['adminStats']);
            toast.success('User role updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update user role');
        }
    });

    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: async (userId) => {
            const response = await api.delete(`/admin/users/${userId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminUsers']);
            queryClient.invalidateQueries(['adminStats']);
            toast.success('User deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    });

    const handleRoleChange = (userId, newRole) => {
        if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            updateRoleMutation.mutate({ userId, role: newRole });
        }
    };

    const handleDeleteUser = (userId, displayName) => {
        if (window.confirm(`Are you sure you want to delete user "${displayName}"? This action cannot be undone.`)) {
            deleteUserMutation.mutate(userId);
        }
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
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Manage Users
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                View and manage all registered users
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-center"
                        >
                            Back to Dashboard
                        </button>
                    </div>

                    {/* Search */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Users Table */}
                    {isLoading ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    ) : usersData?.users?.length > 0 ? (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    User
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Joined
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {usersData.users.map((user) => (
                                                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {user.displayName}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {user.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                            disabled={updateRoleMutation.isPending}
                                                            className="text-sm px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id, user.displayName)}
                                                            disabled={deleteUserMutation.isPending}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                                        >
                                                            {deleteUserMutation.isPending && (
                                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                            )}
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4">
                                {usersData.users.map((user) => (
                                    <motion.div
                                        key={user._id}
                                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
                                        whileHover={{ y: -2 }}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                                    {user.displayName}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Role:</span>
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                disabled={updateRoleMutation.isPending}
                                                className="text-sm px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Joined:</span>
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleDeleteUser(user._id, user.displayName)}
                                            disabled={deleteUserMutation.isPending}
                                            className="w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                        >
                                            {deleteUserMutation.isPending && (
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            Delete User
                                        </button>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {usersData.pagination.total > 1 && (
                                <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                        Page {page} of {usersData.pagination.total}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page >= usersData.pagination.total}
                                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                            <p className="text-gray-600 dark:text-gray-400">
                                No users found
                            </p>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

