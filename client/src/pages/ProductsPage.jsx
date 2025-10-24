import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ProductsPage = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        category: 'all',
        search: '',
        sort: 'newest'
    });

    // Fetch products
    const { data: productsData, isLoading: productsLoading } = useQuery({
        queryKey: ['products', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.category !== 'all') params.append('category', filters.category);
            if (filters.search) params.append('search', filters.search);
            if (filters.sort) params.append('sort', filters.sort);
            // Always fetch active products for the public page
            params.append('isActive', 'true');

            const response = await api.get(`/products?${params.toString()}`);
            return response.data;
        }
    });

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const getCategoryColor = (category) => {
        const colors = {
            wearables: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
            apps: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
            accessories: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
            supplements: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
            books: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
            other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        };
        return colors[category] || colors.other;
    };

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'wearables', label: 'Wearables' },
        { value: 'apps', label: 'Apps' },
        { value: 'accessories', label: 'Accessories' },
        { value: 'supplements', label: 'Supplements' },
        { value: 'books', label: 'Books' },
        { value: 'other', label: 'Other' }
    ];

    const sortOptions = [
        { value: 'newest', label: 'Newest First' }, // Corresponds to createdAt:desc
        { value: 'oldest', label: 'Oldest First' }, // Corresponds to createdAt:asc
        { value: 'price-low', label: 'Price: Low to High' }, // Corresponds to price:asc
        { value: 'price-high', label: 'Price: High to Low' }, // Corresponds to price:desc
        { value: 'rating', label: 'Highest Rated' } // Corresponds to ratings.average:desc
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Header */}
                    <div className="relative text-center mb-12 pt-8 pb-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
                            FemTech Products
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
                            Discover innovative products designed to support women's health and wellness journey.
                        </p>
                        {isAdmin && (
                            <div className="absolute top-0 right-0 pt-8">
                                <motion.button
                                    className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/products/create')}
                                >
                                    Add Product
                                </motion.button>
                            </div>
                        )}
                    </div>

                    {/* Filters */} <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8"> <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> Category </label> <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" > {categories.map(category => (<option key={category.value} value={category.value}> {category.label} </option>))} </select> </div> <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> Sort By </label> <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" > {sortOptions.map(option => (<option key={option.value} value={option.value}> {option.label} </option>))} </select> </div> <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> Search </label> <input type="text" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="Search products..." className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" /> </div> </div> </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {productsLoading ? (
                            // Loading skeleton
                            Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-96 animate-pulse">
                                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                                    <div className="p-6 space-y-4">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                        <div className="flex justify-between pt-4">
                                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : productsData?.data && productsData.data.length > 0 ? (
                            productsData.data.map((product, index) => {
                                // --- ADDED LOG ---
                                console.log(`[ProductsPage] Rendering card for "${product.name}", slug:`, product.slug);
                                // --- END LOG ---
                                return (
                                    <motion.div
                                        key={product._id}
                                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col group" // Added group
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.05 }} // Faster delay increment
                                        onClick={() => {
                                            // --- ADDED LOG ---
                                            console.log(`[ProductsPage] Navigating onClick to /products/${product.slug}`);
                                            // --- END LOG ---
                                            navigate(`/products/${product.slug}`);
                                        }}
                                    >
                                        {/* Image Div */}
                                        <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 flex items-center justify-center overflow-hidden">
                                            {product.images && product.images.length > 0 ? (
                                                <img
                                                    src={product.images[0].url}
                                                    alt={product.images[0].alt || product.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" // Hover effect
                                                />
                                            ) : (
                                                <div className="text-primary-300 dark:text-primary-600"> {/* Adjusted placeholder color */}
                                                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Div */}
                                        <div className="p-6 flex flex-col flex-grow">
                                            {/* Category & Rating */}
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                                                    {product.category}
                                                </span>
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                    </svg>
                                                    <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                                                        {product.ratings?.average?.toFixed(1) || 'N/A'} {/* Added toFixed(1) */}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Name */}
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 flex-grow hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                                {product.name}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3"> {/* Made text-sm */}
                                                {product.description}
                                            </p>

                                            {/* Price & Button */}
                                            <div className="flex items-center justify-between mt-auto">
                                                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                                    ${product.price?.toFixed(2)}
                                                </span>
                                                {/* This Link is clickable on its own, stopping propagation */}
                                                <Link
                                                    to={`/products/${product.slug}`}
                                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
                                                    onClick={(e) => {
                                                        // --- ADDED LOG ---
                                                        console.log(`[ProductsPage] Navigating via Link to /products/${product.slug}`);
                                                        // --- END LOG ---
                                                        e.stopPropagation(); // Prevent card's onClick
                                                    }}
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            // No products message
                            <div className="col-span-full text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                    No products found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {filters.search || filters.category !== 'all'
                                        ? 'Try adjusting your search or filter criteria.'
                                        : 'Check back soon for amazing FemTech products!'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};