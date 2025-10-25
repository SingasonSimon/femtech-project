import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const EditArticlePage = () => {
    const { id } = useParams();
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        category: 'health',
        tags: [],
        productLinks: [],
        published: false
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const [tagInput, setTagInput] = useState('');
    const [error, setError] = useState('');
    const [newProductLink, setNewProductLink] = useState({ productId: '', description: '' });

    // Fetch existing article data
    const { data: articleData, isLoading: articleLoading } = useQuery({
        queryKey: ['article', id],
        queryFn: async () => {
            const response = await api.get(`/articles/admin/${id}`);
            return response.data.data;
        },
        enabled: !!id
    });

    // Fetch available products for linking
    const { data: productsData } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const response = await api.get('/products');
            return response.data;
        }
    });

    // Populate form when article data loads
    useEffect(() => {
        if (articleData) {
            setFormData({
                title: articleData.title || '',
                content: articleData.content || '',
                excerpt: articleData.excerpt || '',
                category: articleData.category || 'health',
                tags: articleData.tags || [],
                productLinks: articleData.productLinks || [],
                published: articleData.published || false
            });
            if (articleData.image) {
                setExistingImage(articleData.image);
            }
        }
    }, [articleData]);

    // Redirect if not admin
    if (!isAdmin) {
        navigate('/dashboard');
        return null; // Important to return null to prevent rendering
    }

    // Show loading while fetching article
    if (articleLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading article...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error if article not found
    if (!articleData) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                        <p className="text-red-600 dark:text-red-400">Article not found</p>
                        <button
                            onClick={() => navigate('/admin/articles')}
                            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            Back to Articles
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const updateArticleMutation = useMutation({
        mutationFn: async (data) => {
            setError('');

            console.log('Updating article with data:', data);
            console.log('Image file:', imageFile);

            const formDataToSend = new FormData();
            Object.keys(data).forEach(key => {
                if (key === 'tags' || key === 'productLinks') {
                    formDataToSend.append(key, JSON.stringify(data[key]));
                } else {
                    formDataToSend.append(key, data[key]);
                }
            });
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            console.log('FormData contents:');
            for (let [key, value] of formDataToSend.entries()) {
                console.log(key, value);
            }

            const response = await api.put(`/articles/${id}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Article update response:', response.data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            queryClient.invalidateQueries({ queryKey: ['article', id] });
            queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
            setError('');
            toast.success('Article updated successfully!');
            navigate('/admin/articles');
        },
        onError: (error) => {
            console.error('Article update error:', error);
            console.error('Error response:', error.response?.data);

            const errorData = error.response?.data;
            let errorMsg = 'Failed to update article.'; // Default
            if (errorData?.errors && Array.isArray(errorData.errors)) {
                const errorMessages = errorData.errors.map(err => `${err.path || 'Error'}: ${err.msg}`).join(', ');
                errorMsg = `Validation failed: ${errorMessages}`;
            } else if (errorData?.message) {
                errorMsg = errorData.message;
            }

            setError(errorMsg);
            toast.error(errorMsg);
        }
    });

    // Input handlers
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Basic size check (e.g., 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should not exceed 5MB.');
                e.target.value = null; // Clear the input
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };
    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };
    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };
    const handleAddProductLink = () => {
        if (newProductLink.productId && newProductLink.description) {
            const selectedProduct = productsData?.data?.find(p => p._id === newProductLink.productId);
            if (selectedProduct) {
                // Check if product link already exists
                if (formData.productLinks.some(link => link.productId === selectedProduct._id)) {
                    toast.error('This product is already linked.');
                    return;
                }
                setFormData(prev => ({
                    ...prev,
                    productLinks: [...prev.productLinks, {
                        productId: selectedProduct._id,
                        productName: selectedProduct.name, // Use name from fetched product
                        // productSlug: selectedProduct.slug, // Use slug from fetched product
                        description: newProductLink.description
                    }]
                }));
                setNewProductLink({ productId: '', description: '' });
            } else {
                toast.error('Selected product not found.');
            }
        } else {
            toast.error('Please select a product and add a description.');
        }
    };
    const handleRemoveProductLink = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            productLinks: prev.productLinks.filter((_, index) => index !== indexToRemove)
        }));
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Client-side validation
        if (!formData.title.trim()) { setError('Title is required'); toast.error('Title is required'); return; }
        if (!formData.content.trim()) { setError('Content is required'); toast.error('Content is required'); return; }
        if (formData.content.trim().length < 100) { setError('Content must be at least 100 characters long'); toast.error('Content must be at least 100 characters long'); return; }
        // Image is optional for updates (can keep existing)

        // Only call mutate
        updateArticleMutation.mutate(formData);
    };

    const categories = [
        { value: 'health', label: 'Health' },
        { value: 'wellness', label: 'Wellness' },
        { value: 'products', label: 'Products' },
        { value: 'lifestyle', label: 'Lifestyle' },
        { value: 'education', label: 'Education' },
        { value: 'news', label: 'News' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Edit Article
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Share your knowledge and insights with the FemTech community.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Article Details */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Article Details
                            </h2>
                            <div className="space-y-4">
                                {/* Title Input */}
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                                    <input id="title" name="title" type="text" required value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" placeholder="Enter article title..." />
                                </div>
                                {/* Excerpt Input */}
                                <div>
                                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt</label>
                                    <textarea id="excerpt" name="excerpt" rows={3} value={formData.excerpt} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" placeholder="Brief description..." />
                                </div>
                                {/* Category Select */}
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                    <select id="category" name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
                                        {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                                    </select>
                                </div>
                                {/* Tags Input */}
                                <div>
                                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                                    <div className="flex space-x-2 mb-2">
                                        <input id="tags" type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white flex-1" placeholder="Add a tag..." />
                                        <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">Add</button>
                                    </div>
                                    {formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">{formData.tags.map((tag, index) => (
                                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">{tag}<button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100 font-bold">×</button></span>
                                        ))}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Product Links */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Product Links</h2>
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                                    <div className="md:col-span-1">
                                        <label htmlFor="productSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Product</label>
                                        <select id="productSelect" value={newProductLink.productId} onChange={(e) => setNewProductLink(prev => ({ ...prev, productId: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
                                            <option value="">Choose a product...</option>
                                            {productsData?.data?.map(product => (<option key={product._id} value={product._id}>{product.name}</option>))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label htmlFor="productDesc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link Description</label>
                                        <input id="productDesc" type="text" value={newProductLink.description} onChange={(e) => setNewProductLink(prev => ({ ...prev, description: e.target.value }))} placeholder="E.g., 'Great for sensitive skin'" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" />
                                    </div>
                                    <button type="button" onClick={handleAddProductLink} className="btn-primary px-4 py-2 self-end">Add Link</button>
                                </div>
                                {formData.productLinks.length > 0 && (
                                    <div className="space-y-2 pt-2">
                                        {formData.productLinks.map((link, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <div>
                                                    <span className="font-medium text-gray-900 dark:text-white">{link.productName}</span>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{link.description}</p>
                                                </div>
                                                <button type="button" onClick={() => handleRemoveProductLink(index)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-lg font-bold">×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>


                        {/* Featured Image */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Featured Image</h2>
                            <div className="space-y-4">
                                {existingImage && !imagePreview && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Image</label>
                                        <img src={existingImage} alt="Current article" className="w-full max-w-md rounded-lg shadow-md" />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Upload a new image below to replace this one (optional)</p>
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{existingImage ? 'Upload New Image (Optional)' : 'Upload Image'}</label>
                                    <input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} className="input-styles file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recommended size: 1200x630px. Max file size: 5MB.</p>
                                </div>
                                {imagePreview && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preview</label>
                                        <img src={imagePreview} alt="Preview" className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Content *</h2>
                            <div>
                                <label htmlFor="content" className="sr-only">Article Content</label>
                                <textarea id="content" name="content" required rows={15} value={formData.content} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" placeholder="Write your article content here..." />
                                <div className={`mt-1 text-sm ${formData.content.length < 100 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {formData.content.length}/100 characters minimum
                                </div>
                            </div>
                        </div>

                        {/* Publish */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <div className="flex items-center space-x-3">
                                <input id="published" name="published" type="checkbox" checked={formData.published} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                <label htmlFor="published" className="text-sm font-medium text-gray-700 dark:text-gray-300">Publish immediately</label>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Uncheck to save as draft</p>
                        </div>

                        {/* Error Display */}
                        {error && (<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">{error}</div>)}

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-4">
                            <button type="button" onClick={() => navigate('/blog')} className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                            <motion.button type="submit" disabled={updateArticleMutation.isPending} className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center space-x-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                {updateArticleMutation.isPending ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating Article...
                                    </>
                                ) : 'Update Article'}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
};