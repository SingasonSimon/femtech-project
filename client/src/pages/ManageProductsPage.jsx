import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';

export const ManageProductsPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Fetch products with filters
    const { data: productsData, isLoading } = useQuery({
        queryKey: ['adminProducts', currentPage, searchQuery, categoryFilter, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
            });

            if (searchQuery) params.append('search', searchQuery);
            if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);

            // Handle status filter
            if (statusFilter === 'active') {
                params.append('isActive', 'true');
            } else if (statusFilter === 'inactive') {
                params.append('isActive', 'false');
            }
            // If 'all', don't add isActive param to get both

            const response = await api.get(`/products?${params}`);
            return response.data;
        }
    });

    // Fetch product categories
    const { data: categoriesData } = useQuery({
        queryKey: ['productCategories'],
        queryFn: async () => {
            const response = await api.get('/products/categories');
            return response.data;
        }
    });

    // Toggle featured status
    const toggleFeaturedMutation = useMutation({
        mutationFn: async ({ productId, isFeatured }) => {
            const response = await api.patch(`/products/${productId}`, { isFeatured: !isFeatured });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminProducts']);
            toast.success('Product featured status updated!');
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to update product';
            toast.error(message);
        }
    });

    // Toggle active status
    const toggleActiveMutation = useMutation({
        mutationFn: async ({ productId, isActive }) => {
            const response = await api.patch(`/products/${productId}`, { isActive: !isActive });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminProducts']);
            toast.success('Product status updated!');
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to update product';
            toast.error(message);
        }
    });

    // Delete product
    const deleteProductMutation = useMutation({
        mutationFn: async (productId) => {
            const response = await api.delete(`/products/${productId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminProducts']);
            toast.success('Product deleted successfully!');
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to delete product';
            toast.error(message);
        }
    });

    const handleToggleFeatured = (product) => {
        toggleFeaturedMutation.mutate({
            productId: product._id,
            isFeatured: product.isFeatured
        });
    };

    const handleToggleActive = (product) => {
        toggleActiveMutation.mutate({
            productId: product._id,
            isActive: product.isActive
        });
    };

    const handleDelete = (product) => {
        if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
            deleteProductMutation.mutate(product._id);
        }
    };

    const handleEdit = (product) => {
        navigate(`/products/edit/${product._id}`);
    };

    const products = productsData?.data || [];
    const pagination = productsData?.pagination || { current: 1, pages: 1, total: 0 };
    const categories = categoriesData?.data || [];

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
                                Manage Products
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Manage all products in the system
                            </p>
                        </div>
                        <Link
                            to="/products/create"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Product
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search */}
                            <div>
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Search Products
                                </label>
                                <input
                                    type="text"
                                    id="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name..."
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.category} value={cat.category}>
                                            {cat.category.charAt(0).toUpperCase() + cat.category.slice(1)} ({cat.count})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    {pagination.total}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Products</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {products.filter(p => p.isActive).length}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {products.filter(p => p.isFeatured).length}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Featured</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {categories.length}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    {isLoading ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                            <p className="text-gray-600 dark:text-gray-400">No products found</p>
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
                                                    Product
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Category
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Price
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {products.map((product) => (
                                                <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {product.images && product.images.length > 0 ? (
                                                                <img
                                                                    src={product.images[0].url}
                                                                    alt={product.name}
                                                                    className="h-10 w-10 rounded-lg object-cover mr-3"
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-600 mr-3 flex items-center justify-center">
                                                                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {product.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {product.brand}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                            {product.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        KES {product.price.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                                }`}>
                                                                {product.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                            {product.isFeatured && (
                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                                                    ⭐ Featured
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex flex-col gap-2">
                                                            <button
                                                                onClick={() => handleToggleFeatured(product)}
                                                                disabled={toggleFeaturedMutation.isPending}
                                                                className={`inline-flex items-center justify-center px-3 py-1 rounded-lg transition-colors text-xs font-medium ${product.isFeatured
                                                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/50'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            >
                                                                {toggleFeaturedMutation.isPending ? (
                                                                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                ) : product.isFeatured ? '⭐ Unfeature' : '⭐ Feature'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleActive(product)}
                                                                disabled={toggleActiveMutation.isPending}
                                                                className={`inline-flex items-center justify-center px-3 py-1 rounded-lg transition-colors text-xs font-medium ${product.isActive
                                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
                                                                    : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
                                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            >
                                                                {toggleActiveMutation.isPending ? (
                                                                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                ) : product.isActive ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(product)}
                                                                className="inline-flex items-center justify-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(product)}
                                                                disabled={deleteProductMutation.isPending}
                                                                className="inline-flex items-center justify-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {deleteProductMutation.isPending ? (
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
                                {products.map((product) => (
                                    <div key={product._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                                        <div className="flex items-start gap-3 mb-3">
                                            {product.images && product.images.length > 0 ? (
                                                <img
                                                    src={product.images[0].url}
                                                    alt={product.name}
                                                    className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{product.brand}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                        {product.category}
                                                    </span>
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                        KES {product.price.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mb-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.isActive
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            {product.isFeatured && (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                                    ⭐ Featured
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleToggleFeatured(product)}
                                                disabled={toggleFeaturedMutation.isPending}
                                                className={`px-3 py-2 rounded-lg transition-colors text-xs font-medium ${product.isFeatured
                                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                                    } disabled:opacity-50`}
                                            >
                                                {product.isFeatured ? 'Unfeature' : 'Feature'}
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(product)}
                                                disabled={toggleActiveMutation.isPending}
                                                className={`px-3 py-2 rounded-lg transition-colors text-xs font-medium ${product.isActive
                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                                                    } disabled:opacity-50`}
                                            >
                                                {product.isActive ? 'Hide' : 'Show'}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product)}
                                                disabled={deleteProductMutation.isPending}
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
                                            Showing page {pagination.current} of {pagination.pages} ({pagination.total} total products)
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
        </div>
    );
};

