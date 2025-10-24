import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ProfilePage = () => {
    const { user: currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState({
        displayName: currentUser?.displayName || '',
        bio: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [deletePassword, setDeletePassword] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    // Fetch profile data
    const { data: profileInfo, isLoading } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const response = await api.get('/profile');
            const data = response.data.data;
            setProfileData({
                displayName: data.user.displayName,
                bio: data.user.bio || ''
            });
            return data;
        }
    });

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (data) => {
            const formData = new FormData();
            formData.append('displayName', data.displayName);
            formData.append('bio', data.bio);
            if (imageFile) {
                formData.append('profileImage', imageFile);
            }

            const response = await api.put('/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['userProfile']);
            queryClient.invalidateQueries(['currentUser']);
            setImageFile(null);
            setImagePreview(null);
            toast.success('Profile updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    });

    // Change password mutation
    const changePasswordMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.put('/profile/password', data);
            return response.data;
        },
        onSuccess: () => {
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            toast.success('Password changed successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to change password');
        }
    });

    // Delete profile image mutation
    const deleteProfileImageMutation = useMutation({
        mutationFn: async () => {
            const response = await api.delete('/profile/image');
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['userProfile']);
            queryClient.invalidateQueries(['currentUser']);
            setImagePreview(null);
            setImageFile(null);
            toast.success('Profile image removed');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to remove image');
        }
    });

    // Delete account mutation
    const deleteAccountMutation = useMutation({
        mutationFn: async (password) => {
            const response = await api.delete('/profile/account', {
                data: { password }
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Account deleted successfully');
            logout();
            navigate('/');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete account');
        }
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        updateProfileMutation.mutate(profileData);
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        changePasswordMutation.mutate({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });
    };

    const handleDeleteAccount = () => {
        if (!deletePassword) {
            toast.error('Please enter your password');
            return;
        }
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.')) {
            deleteAccountMutation.mutate(deletePassword);
        }
    };

    const handleRemoveImage = () => {
        if (window.confirm('Are you sure you want to remove your profile image?')) {
            deleteProfileImageMutation.mutate();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                </main>
            </div>
        );
    }

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
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            My Profile
                        </h1>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Sidebar - Profile Card */}
                        <div className="lg:col-span-1">
                            <motion.div
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                                whileHover={{ y: -2 }}
                            >
                                {/* Profile Image */}
                                <div className="text-center mb-6">
                                    <div className="relative inline-block">
                                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mx-auto mb-4">
                                            {imagePreview || profileInfo?.user?.profileImage ? (
                                                <img
                                                    src={imagePreview || profileInfo.user.profileImage}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-5xl text-gray-400">
                                                    👤
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-4 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors shadow-lg"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </div>
                                    {(profileInfo?.user?.profileImage || imagePreview) && (
                                        <button
                                            onClick={handleRemoveImage}
                                            disabled={deleteProfileImageMutation.isPending}
                                            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {deleteProfileImageMutation.isPending ? 'Removing...' : 'Remove Image'}
                                        </button>
                                    )}
                                </div>

                                {/* User Info */}
                                <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {profileInfo?.user?.displayName}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        {profileInfo?.user?.email}
                                    </p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${profileInfo?.user?.role === 'admin'
                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                        }`}>
                                        {profileInfo?.user?.role === 'admin' ? '👑 Admin' : '👤 User'}
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Activity</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Forum Posts</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {profileInfo?.stats?.postsCount || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Articles</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {profileInfo?.stats?.articlesCount || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Period Entries</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {profileInfo?.stats?.periodEntriesCount || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Member Since */}
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Member since {new Date(profileInfo?.user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Main Content - Tabs */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                {/* Tabs */}
                                <div className="border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex">
                                        <button
                                            onClick={() => setActiveTab('profile')}
                                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile'
                                                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            Edit Profile
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('security')}
                                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'security'
                                                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            Security
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('danger')}
                                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'danger'
                                                ? 'border-red-600 text-red-600 dark:text-red-400'
                                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            Danger Zone
                                        </button>
                                    </div>
                                </div>

                                {/* Tab Content */}
                                <div className="p-6">
                                    {/* Profile Tab */}
                                    {activeTab === 'profile' && (
                                        <form onSubmit={handleProfileUpdate}>
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Display Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={profileData.displayName}
                                                        onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Bio
                                                    </label>
                                                    <textarea
                                                        value={profileData.bio}
                                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                                        rows={4}
                                                        maxLength={500}
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-none"
                                                        placeholder="Tell us about yourself..."
                                                    />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {profileData.bio.length}/500 characters
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={profileInfo?.user?.email}
                                                        disabled
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                                                    />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Email cannot be changed
                                                    </p>
                                                </div>

                                                <div className="flex justify-end">
                                                    <button
                                                        type="submit"
                                                        disabled={updateProfileMutation.isPending}
                                                        className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                    >
                                                        {updateProfileMutation.isPending && (
                                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        )}
                                                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}

                                    {/* Security Tab */}
                                    {activeTab === 'security' && (
                                        <form onSubmit={handlePasswordChange}>
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    Change Password
                                                </h3>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Current Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                                        required
                                                        minLength={6}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Confirm New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                                        required
                                                        minLength={6}
                                                    />
                                                </div>

                                                <div className="flex justify-end">
                                                    <button
                                                        type="submit"
                                                        disabled={changePasswordMutation.isPending}
                                                        className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                    >
                                                        {changePasswordMutation.isPending && (
                                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        )}
                                                        {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}

                                    {/* Danger Zone Tab */}
                                    {activeTab === 'danger' && (
                                        <div className="space-y-6">
                                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                                                <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">
                                                    Delete Account
                                                </h3>
                                                <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                                                    Once you delete your account, there is no going back. All your data including posts, articles, and period tracking information will be permanently deleted.
                                                </p>

                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-red-900 dark:text-red-300 mb-2">
                                                        Enter your password to confirm
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={deletePassword}
                                                        onChange={(e) => setDeletePassword(e.target.value)}
                                                        className="w-full px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                                                        placeholder="Enter your password"
                                                    />
                                                </div>

                                                <button
                                                    onClick={handleDeleteAccount}
                                                    disabled={deleteAccountMutation.isPending || !deletePassword}
                                                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                >
                                                    {deleteAccountMutation.isPending && (
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    )}
                                                    {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete My Account'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

