import { useState, useEffect } from 'react'; // Import useEffect
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { ReviewSection } from '../components/ReviewSection';
// import { useAuth } from '../context/AuthContext'; // Not currently used
import { api } from '../services/api';

export const ProductDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // --- LOG 1: Initial slug value ---
    console.log('[ProductDetailPage] Initial render - Slug from useParams:', slug);

    // --- LOG 2: Check slug changes ---
    useEffect(() => {
        console.log('[ProductDetailPage] useEffect - Slug value:', slug);
    }, [slug]);

    const { data: productData, isLoading, error } = useQuery({
        queryKey: ['product', slug],
        queryFn: async () => {
            // --- LOG 3: Slug value right before fetch ---
            console.log('[ProductDetailPage] queryFn executing - Slug value:', slug);

            // --- Aggressive Check: Prevent fetch if slug is truly undefined ---
            if (!slug) {
                console.error('[ProductDetailPage] queryFn: Slug is undefined/falsy, skipping fetch!');
                // Throwing an error tells React Query this attempt failed because preconditions weren't met
                throw new Error("Slug is not available yet.");
            }
            // --- End Aggressive Check ---

            console.log('[ProductDetailPage] Attempting to fetch product with slug:', slug);
            const response = await api.get(`/products/${slug}`);
            console.log('[ProductDetailPage] Fetch response:', response.data); // Log response
            return response.data; // Expects { success: true, data: product }
        },
        // --- Keep this fix! ---
        enabled: !!slug,
        // Optional: Disable retry for clearer debugging
        retry: false,
    });

    // --- LOG 4: Query status ---
    console.log('[ProductDetailPage] Query status:', { isLoading, error: error?.message, slug });


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
        // --- LOG 5: Error/Not Found state reason ---
        console.log('[ProductDetailPage] Rendering Not Found:', { error: error?.message, isLoading, hasData: !!productData?.data });
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
                            className="px-8 py-4 bg-primary-600 text-white rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                        >
                            Back to All Products
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const product = productData.data; // Now we know product exists
    // --- LOG 6: Rendering product data ---
    console.log('[ProductDetailPage] Rendering product data:', product?.name);


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
                                    {product.isFeatured && (<span className="tag-styles bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Featured</span>)}
                                    {/* Stock Status moved here */}
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock.status === 'in_stock' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : product.stock.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'}`}>
                                        {(product.stock.status || 'unknown').replace('_', ' ')} {/* Added default and replace */}
                                    </span>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                    {product.name}
                                </h1>
                                {product.brand && (<p className="text-lg text-gray-600 dark:text-gray-400 mb-4">by {product.brand}</p>)}
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline space-x-3">
                                <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                                    KES {product.price?.toLocaleString()}
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                                        KES {product.originalPrice.toLocaleString()}
                                    </span>
                                )}
                            </div>

                            {/* Short Description */}
                            {product.shortDescription && (<p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{product.shortDescription}</p>)}

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
                                        {product.tags.map((tag, index) => (<span key={index} className="tag-styles">{tag}</span>))} {/* Use global style */}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                {product.productUrl ? (
                                    <a
                                        href={product.productUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-8 py-4 bg-primary-600 text-white rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl flex-1 text-center inline-flex items-center justify-center gap-2"
                                    >
                                        View Product on Site
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                ) : (
                                    <button
                                        className="px-8 py-4 bg-gray-400 text-white rounded-lg text-lg font-semibold cursor-not-allowed flex-1"
                                        disabled
                                    >
                                        No Purchase Link Available
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate('/products')}
                                    className="px-8 py-4 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg text-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                >
                                    Back to Products
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Reviews Section */}
                <ReviewSection targetType="Product" targetId={product._id} />
            </main>
            <style jsx global>{`
                .tag-styles { @apply inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200; }
            `}</style>
        </div>
    );
};