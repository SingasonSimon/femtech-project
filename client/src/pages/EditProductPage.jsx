import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const EditProductPage = () => {
    const { id } = useParams();
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        shortDescription: '',
        price: '',
        originalPrice: '',
        category: 'trackers',
        brand: '',
        productUrl: '',
        specifications: {
            dimensions: '',
            weight: '',
            battery: '',
            connectivity: '',
            compatibility: '',
            features: [],
            materials: []
        },
        stock: {
            quantity: 0,
            status: 'out_of_stock'
        },
        variants: [],
        tags: [],
        isFeatured: false
    });

    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [featureInput, setFeatureInput] = useState('');
    const [materialInput, setMaterialInput] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if not admin
    if (!isAdmin) {
        navigate('/dashboard');
        return null;
    }

    // Fetch product data
    const { data: productData, isLoading: productLoading } = useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const response = await api.get(`/products/admin/${id}`);
            return response.data.data;
        },
        enabled: !!id
    });

    // Populate form when product data loads
    useEffect(() => {
        if (productData) {
            setFormData({
                name: productData.name || '',
                description: productData.description || '',
                shortDescription: productData.shortDescription || '',
                price: productData.price || '',
                originalPrice: productData.originalPrice || '',
                category: productData.category || 'trackers',
                brand: productData.brand || '',
                productUrl: productData.productUrl || '',
                specifications: productData.specifications || {
                    dimensions: '',
                    weight: '',
                    battery: '',
                    connectivity: '',
                    compatibility: '',
                    features: [],
                    materials: []
                },
                stock: productData.stock || {
                    quantity: 0,
                    status: 'out_of_stock'
                },
                variants: productData.variants || [],
                tags: productData.tags || [],
                isFeatured: productData.isFeatured || false
            });
            setExistingImages(productData.images || []);
        }
    }, [productData]);

    const updateProductMutation = useMutation({
        mutationFn: async (data) => {
            setIsSubmitting(true);
            setError('');

            const formDataToSend = new FormData();

            // Add text fields
            Object.keys(data).forEach(key => {
                if (key === 'specifications' || key === 'stock' || key === 'variants' || key === 'tags') {
                    formDataToSend.append(key, JSON.stringify(data[key]));
                } else {
                    formDataToSend.append(key, data[key]);
                }
            });

            // Add new images
            imageFiles.forEach(file => {
                formDataToSend.append('images', file);
            });

            const response = await api.put(`/products/${id}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            queryClient.invalidateQueries(['product', id]);
            queryClient.invalidateQueries(['adminProducts']);
            setError('');
            setIsSubmitting(false);
            toast.success('Product updated successfully!');
            navigate('/admin/products');
        },
        onError: (error) => {
            setIsSubmitting(false);
            const errorData = error.response?.data;
            if (errorData?.errors && Array.isArray(errorData.errors)) {
                const errorMessages = errorData.errors.map(err => `${err.path}: ${err.msg}`).join(', ');
                const errorMsg = `Validation failed: ${errorMessages}`;
                setError(errorMsg);
                toast.error(errorMsg);
            } else {
                const errorMsg = errorData?.message || 'Failed to update product';
                setError(errorMsg);
                toast.error(errorMsg);
            }
        }
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSpecificationChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                [name]: value
            }
        }));
    };

    const handleStockChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            stock: {
                ...prev.stock,
                [name]: name === 'quantity' ? parseInt(value) || 0 : value
            }
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(prev => [...prev, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeNewImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const addFeature = () => {
        if (featureInput.trim() && !formData.specifications.features.includes(featureInput.trim())) {
            setFormData(prev => ({
                ...prev,
                specifications: {
                    ...prev.specifications,
                    features: [...prev.specifications.features, featureInput.trim()]
                }
            }));
            setFeatureInput('');
        }
    };

    const removeFeature = (featureToRemove) => {
        setFormData(prev => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                features: prev.specifications.features.filter(feature => feature !== featureToRemove)
            }
        }));
    };

    const addMaterial = () => {
        if (materialInput.trim() && !formData.specifications.materials.includes(materialInput.trim())) {
            setFormData(prev => ({
                ...prev,
                specifications: {
                    ...prev.specifications,
                    materials: [...prev.specifications.materials, materialInput.trim()]
                }
            }));
            setMaterialInput('');
        }
    };

    const removeMaterial = (materialToRemove) => {
        setFormData(prev => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                materials: prev.specifications.materials.filter(material => material !== materialToRemove)
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            setError('Product name is required');
            toast.error('Product name is required');
            return;
        }

        if (!formData.description.trim()) {
            setError('Product description is required');
            toast.error('Product description is required');
            return;
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            setError('Valid price is required');
            toast.error('Valid price is required');
            return;
        }

        if (!formData.brand.trim()) {
            setError('Brand is required');
            toast.error('Brand is required');
            return;
        }

        updateProductMutation.mutate(formData);
    };

    if (productLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading product...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!productData) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                        <p className="text-red-600 dark:text-red-400">Product not found</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/admin/products')}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Products
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            Edit Product
                        </h1>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Basic Information
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Product Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Short Description
                                        </label>
                                        <input
                                            type="text"
                                            id="shortDescription"
                                            name="shortDescription"
                                            value={formData.shortDescription}
                                            onChange={handleInputChange}
                                            placeholder="Brief one-line description"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="6"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Brand *
                                            </label>
                                            <input
                                                type="text"
                                                id="brand"
                                                name="brand"
                                                value={formData.brand}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Category *
                                            </label>
                                            <select
                                                id="category"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="trackers">Trackers</option>
                                                <option value="monitors">Monitors</option>
                                                <option value="accessories">Accessories</option>
                                                <option value="apparel">Apparel</option>
                                                <option value="supplements">Supplements</option>
                                                <option value="books">Books</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Pricing
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Price (KES) *
                                        </label>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Original Price (KES) - Optional
                                        </label>
                                        <input
                                            type="number"
                                            id="originalPrice"
                                            name="originalPrice"
                                            value={formData.originalPrice}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            placeholder="For showing discounts"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Product URL
                                    </label>
                                    <input
                                        type="url"
                                        id="productUrl"
                                        name="productUrl"
                                        value={formData.productUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/product"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Link to where users can purchase this product
                                    </p>
                                </div>
                            </div>

                            {/* Stock */}
                            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Stock Information
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Quantity
                                        </label>
                                        <input
                                            type="number"
                                            id="quantity"
                                            name="quantity"
                                            value={formData.stock.quantity}
                                            onChange={handleStockChange}
                                            min="0"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Stock Status
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.stock.status}
                                            onChange={handleStockChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="in_stock">In Stock</option>
                                            <option value="low_stock">Low Stock</option>
                                            <option value="out_of_stock">Out of Stock</option>
                                            <option value="pre_order">Pre-order</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Specifications */}
                            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Specifications
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Dimensions
                                        </label>
                                        <input
                                            type="text"
                                            id="dimensions"
                                            name="dimensions"
                                            value={formData.specifications.dimensions}
                                            onChange={handleSpecificationChange}
                                            placeholder="e.g., 10 x 5 x 2 cm"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Weight
                                        </label>
                                        <input
                                            type="text"
                                            id="weight"
                                            name="weight"
                                            value={formData.specifications.weight}
                                            onChange={handleSpecificationChange}
                                            placeholder="e.g., 100g"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="battery" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Battery Life
                                        </label>
                                        <input
                                            type="text"
                                            id="battery"
                                            name="battery"
                                            value={formData.specifications.battery}
                                            onChange={handleSpecificationChange}
                                            placeholder="e.g., 7 days"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="connectivity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Connectivity
                                        </label>
                                        <input
                                            type="text"
                                            id="connectivity"
                                            name="connectivity"
                                            value={formData.specifications.connectivity}
                                            onChange={handleSpecificationChange}
                                            placeholder="e.g., Bluetooth 5.0"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="compatibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Compatibility
                                        </label>
                                        <input
                                            type="text"
                                            id="compatibility"
                                            name="compatibility"
                                            value={formData.specifications.compatibility}
                                            onChange={handleSpecificationChange}
                                            placeholder="e.g., iOS 14+, Android 8+"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Features
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={featureInput}
                                            onChange={(e) => setFeatureInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                            placeholder="Add a feature"
                                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                        <button
                                            type="button"
                                            onClick={addFeature}
                                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.specifications.features.map((feature, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                                            >
                                                {feature}
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeature(feature)}
                                                    className="ml-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Materials */}
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Materials
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={materialInput}
                                            onChange={(e) => setMaterialInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                                            placeholder="Add a material"
                                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                        <button
                                            type="button"
                                            onClick={addMaterial}
                                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.specifications.materials.map((material, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-300"
                                            >
                                                {material}
                                                <button
                                                    type="button"
                                                    onClick={() => removeMaterial(material)}
                                                    className="ml-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Tags
                                </h2>

                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        placeholder="Add a tag"
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Images */}
                            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Images
                                </h2>

                                {/* Existing Images */}
                                {existingImages.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Current Images
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {existingImages.map((image, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={image.url}
                                                        alt={image.alt || `Product ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    {image.isPrimary && (
                                                        <span className="absolute top-2 left-2 px-2 py-1 text-xs bg-primary-600 text-white rounded">
                                                            Primary
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Existing images will be kept. Add new images below if needed.
                                        </p>
                                    </div>
                                )}

                                {/* New Images Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Add New Images (optional)
                                    </label>
                                    <input
                                        type="file"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        multiple
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Upload up to 5 new images. First new image will become primary if no existing primary.
                                    </p>
                                </div>

                                {/* New Image Previews */}
                                {imagePreviews.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={preview}
                                                    alt={`New preview ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(index)}
                                                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Featured Checkbox */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isFeatured"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Feature this product on the homepage
                                </label>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || updateProductMutation.isPending}
                                    className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {(isSubmitting || updateProductMutation.isPending) ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating Product...
                                        </>
                                    ) : (
                                        'Update Product'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/products')}
                                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

