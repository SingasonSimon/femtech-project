import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ProductDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const { data: productData, isLoading, error } = useQuery({
        queryKey: ['product', slug],
        queryFn: async () => {
            const response = await api.get(`/products/${slug}`);
            return response.data;
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            <div className="space-y-4">
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !productData?.data) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Product not found
                        </h1>
                        <button
                            onClick={() => navigate('/products')}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Back to Products
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const product = productData.data;

    const getCategoryColor = (category) => {
        const colors = {
            trackers: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
            monitors: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
            accessories: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
            apparel: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
            supplements: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
            books: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
            other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        };
        return colors[category] || colors.other;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                        {/* Product Images */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images[selectedImageIndex].url}
                                        alt={product.images[selectedImageIndex].alt || product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Image Thumbnails */}
                            {product.images && product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`aspect-square rounded-lg overflow-hidden border-2 ${selectedImageIndex === index
                                                    ? 'border-primary-500'
                                                    : 'border-gray-200 dark:border-gray-600'
                                                }`}
                                        >
                                            <img
                                                src={image.url}
                                                alt={image.alt || `${product.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(product.category)}`}>
                                        {product.category}
                                    </span>
                                    {product.isFeatured && (
                                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                                            Featured
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {product.name}
                                </h1>

                                {product.brand && (
                                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                                        by {product.brand}
                                    </p>
                                )}
                            </div>

                            {/* Price */}
                            <div className="flex items-center space-x-4">
                                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                                    ${product.price}
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                                        ${product.originalPrice}
                                    </span>
                                )}
                            </div>

                            {/* Stock Status */}
                            <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock.status === 'in_stock'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                        : product.stock.status === 'low_stock'
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                    }`}>
                                    {product.stock.status === 'in_stock' ? 'In Stock' :
                                        product.stock.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {product.stock.quantity} available
                                </span>
                            </div>

                            {/* Short Description */}
                            {product.shortDescription && (
                                <p className="text-gray-700 dark:text-gray-300 text-lg">
                                    {product.shortDescription}
                                </p>
                            )}

                            {/* Full Description */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Description
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            {/* Specifications */}
                            {product.specifications && Object.keys(product.specifications).length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                        Specifications
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {Object.entries(product.specifications).map(([key, value]) => (
                                            value && (
                                                <div key={key} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                                                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                    </span>
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {Array.isArray(value) ? value.join(', ') : value}
                                                    </span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {product.tags && product.tags.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-4 pt-6">
                                <button
                                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                                    disabled={product.stock.status === 'out_of_stock'}
                                >
                                    {product.stock.status === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                                <button
                                    onClick={() => navigate('/products')}
                                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Back to Products
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};
