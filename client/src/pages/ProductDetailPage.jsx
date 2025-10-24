import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
// import { useAuth } from '../context/AuthContext'; // Not currently used
import { api } from '../services/api';

export const ProductDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // --- ADDED LOG ---
    console.log('[ProductDetailPage] Slug received from useParams:', slug);
    // --- END LOG ---


    const { data: productData, isLoading, error } = useQuery({
        queryKey: ['product', slug],
        queryFn: async () => {
            // --- ADDED LOG ---
            console.log('[ProductDetailPage] Attempting to fetch product with slug:', slug);
            // --- END LOG ---
            const response = await api.get(`/products/${slug}`);
            // Assuming your API returns { success: true, data: product }
            return response.data;
        },
        // --- Keep this fix! ---
        enabled: !!slug,
    });

    // Loading State
    if (isLoading && !productData) { // Check !productData to avoid flicker when refetching
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* --- Loading Skeleton --- */}
                    <div className="animate-pulse">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             {/* Image Placeholder */}
                             <div>
                                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                                <div className="grid grid-cols-4 gap-2">
                                     <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                     <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                     <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                     <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                </div>
                             </div>
                             {/* Details Placeholder */}
                             <div className="space-y-6 pt-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="flex space-x-4 pt-4">
                                     <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                                     <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Error or Not Found State
    // Check error OR if query finished but has no data
    if (error || (!isLoading && !productData?.data)) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
                    <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-12">
                         <svg className="w-16 h-16 mx-auto mb-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                             Product Not Found
                         </h1>
                         <p className="text-gray-600 dark:text-gray-400 mb-8">
                             Sorry, we couldn't find the product you're looking for. It might have been moved or deleted.
                         </p>
                        <button
                            onClick={() => navigate('/products')}
                            // --- APPLY STYLE ---
                            className="btn-primary px-6 py-3" // Use global style
                        >
                            Back to All Products
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const product = productData.data; // Now we know product exists

    // Helper function for category color (keep as is)
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 p-6 md:p-10">
                        {/* Product Images */}
                        <motion.div className="space-y-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                            <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shadow-inner">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images[selectedImageIndex].url}
                                        alt={product.images[selectedImageIndex].alt || product.name}
                                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" // Use object-contain
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500"> {/* Adjusted placeholder color */}
                                         <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                         </svg>
                                    </div>
                                )}
                            </div>

                            {/* Image Thumbnails */}
                            {product.images && product.images.length > 1 && (
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedImageIndex === index
                                                    ? 'border-primary-500 scale-105 shadow-md'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
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
                        </motion.div>

                        {/* Product Details */}
                        <motion.div className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                            {/* Header: Category, Name, Brand */}
                             <div>
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(product.category)}`}>
                                        {product.category}
                                    </span>
                                     {product.isFeatured && ( <span className="tag-styles bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Featured</span> )}
                                     {/* Stock Status moved here */}
                                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock.status === 'in_stock' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : product.stock.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'}`}>
                                        {(product.stock.status || 'unknown').replace('_', ' ')} {/* Added default and replace */}
                                    </span>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                    {product.name}
                                </h1>
                                {product.brand && ( <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">by {product.brand}</p> )}
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline space-x-3">
                                <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                                    ${product.price?.toFixed(2)}
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                                        ${product.originalPrice.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {/* Short Description */}
                            {product.shortDescription && ( <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{product.shortDescription}</p> )}

                            {/* Full Description */}
                            {product.description && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                                </div>
                            )}

                            {/* Specifications */}
                            {product.specifications && Object.keys(product.specifications).length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Specifications</h3>
                                    <div className="space-y-2">
                                        {Object.entries(product.specifications).map(([key, value]) => (
                                            value && ( // Only render if value exists
                                                <div key={key} className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                                    <span className="font-medium text-gray-600 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                    <span className="text-gray-800 dark:text-white text-right">{Array.isArray(value) ? value.join(', ') : value}</span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {product.tags && product.tags.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag, index) => ( <span key={index} className="tag-styles">{tag}</span> ))} {/* Use global style */}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <button
                                    // --- APPLY STYLE ---
                                    className="btn-primary px-8 py-3 text-lg flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={product.stock.status === 'out_of_stock'}
                                    // Add onClick handler for Add to Cart here
                                >
                                    {product.stock.status === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                                <button
                                    onClick={() => navigate('/products')}
                                     // --- APPLY STYLE ---
                                    className="btn-secondary px-6 py-3"
                                >
                                    Back to Products
                                </button>
                            </div>
                            {/* Stock status message */}
                            {product.stock.status !== 'in_stock' && (
                                <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">
                                     {product.stock.status === 'low_stock' ? `Only ${product.stock.quantity || 0} left!` : 'Currently unavailable.'}
                                </p>
                            )}
                        </motion.div>
                    </div>
                </motion.div>
            </main>
             {/* Include styles if not using Tailwind globally */}
             <style jsx global>{`
                .input-styles { @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white bg-white transition-colors; }
                .btn-primary { @apply bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900; }
                .btn-secondary { @apply border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900; }
                .tag-styles { @apply inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200; }
                .spinner-small { /* Basic spinner style */
                    @apply inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite];
                 }
            `}</style>
        </div>
    );
};