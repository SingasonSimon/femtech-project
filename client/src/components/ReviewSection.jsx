import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ReviewSection = ({ targetType, targetId }) => {
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewData, setReviewData] = useState({
        rating: 5,
        title: '',
        comment: ''
    });
    const [editingReview, setEditingReview] = useState(null);

    // Fetch reviews
    const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
        queryKey: ['reviews', targetType, targetId],
        queryFn: async () => {
            const response = await api.get(`/reviews/${targetType}/${targetId}`);
            return response.data.data;
        }
    });

    // Fetch user's review
    const { data: userReview } = useQuery({
        queryKey: ['userReview', targetType, targetId],
        queryFn: async () => {
            const response = await api.get(`/reviews/${targetType}/${targetId}/user`);
            return response.data.data;
        },
        enabled: isAuthenticated
    });

    // Create/Update review mutation
    const saveReviewMutation = useMutation({
        mutationFn: async (data) => {
            if (editingReview) {
                const response = await api.put(`/reviews/${editingReview}`, data);
                return response.data;
            } else {
                const response = await api.post(`/reviews/${targetType}/${targetId}`, data);
                return response.data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['reviews', targetType, targetId]);
            queryClient.invalidateQueries(['userReview', targetType, targetId]);
            setShowReviewForm(false);
            setEditingReview(null);
            setReviewData({ rating: 5, title: '', comment: '' });
            toast.success(editingReview ? 'Review updated!' : 'Review submitted!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to save review');
        }
    });

    // Delete review mutation
    const deleteReviewMutation = useMutation({
        mutationFn: async (reviewId) => {
            const response = await api.delete(`/reviews/${reviewId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['reviews', targetType, targetId]);
            queryClient.invalidateQueries(['userReview', targetType, targetId]);
            toast.success('Review deleted');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete review');
        }
    });

    // Mark helpful mutation - COMMENTED OUT FOR NOW
    // const markHelpfulMutation = useMutation({
    //     mutationFn: async (reviewId) => {
    //         const response = await api.post(`/reviews/${reviewId}/helpful`);
    //         return response.data;
    //     },
    //     onSuccess: () => {
    //         queryClient.invalidateQueries(['reviews', targetType, targetId]);
    //     }
    // });

    const handleSubmitReview = (e) => {
        e.preventDefault();
        saveReviewMutation.mutate(reviewData);
    };

    const handleEditReview = (review) => {
        setReviewData({
            rating: review.rating,
            title: review.title,
            comment: review.comment
        });
        setEditingReview(review._id);
        setShowReviewForm(true);
    };

    const handleDeleteReview = (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            deleteReviewMutation.mutate(reviewId);
        }
    };

    const StarRating = ({ rating, onRatingChange, interactive = false }) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => interactive && onRatingChange && onRatingChange(star)}
                        disabled={!interactive}
                        className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                    >
                        <svg
                            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Reviews ({reviewsData?.pagination?.count || 0})
                </h2>
                {isAuthenticated && !userReview && (
                    <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                        Write a Review
                    </button>
                )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {editingReview ? 'Edit Your Review' : 'Write Your Review'}
                    </h3>
                    <form onSubmit={handleSubmitReview}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Rating
                                </label>
                                <StarRating
                                    rating={reviewData.rating}
                                    onRatingChange={(rating) => setReviewData({ ...reviewData, rating })}
                                    interactive={true}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={reviewData.title}
                                    onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Sum up your experience"
                                    required
                                    maxLength={100}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Review
                                </label>
                                <textarea
                                    value={reviewData.comment}
                                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-none"
                                    placeholder="Share your thoughts..."
                                    required
                                    maxLength={1000}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {reviewData.comment.length}/1000 characters
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={saveReviewMutation.isPending}
                                    className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {saveReviewMutation.isPending && (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {saveReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowReviewForm(false);
                                        setEditingReview(null);
                                        setReviewData({ rating: 5, title: '', comment: '' });
                                    }}
                                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* User's Review (if exists) */}
            {userReview && !editingReview && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6 mb-6"
                >
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Review</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEditReview(userReview)}
                                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDeleteReview(userReview._id)}
                                disabled={deleteReviewMutation.isPending}
                                className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                    <StarRating rating={userReview.rating} />
                    <h4 className="font-semibold text-gray-900 dark:text-white mt-2">{userReview.title}</h4>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{userReview.comment}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {new Date(userReview.createdAt).toLocaleDateString()}
                    </p>
                </motion.div>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                </div>
            ) : reviewsData?.reviews?.length > 0 ? (
                <div className="space-y-4">
                    {reviewsData.reviews.map((review) => (
                        <motion.div
                            key={review._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                        {review.userId?.profileImage ? (
                                            <img
                                                src={review.userId.profileImage}
                                                alt={review.userId.displayName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                👤
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {review.userId?.displayName || 'Anonymous'}
                                        </p>
                                        <StarRating rating={review.rating} />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                {review.title}
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">
                                {review.comment}
                            </p>

                            {/* HELPFUL FEATURE - COMMENTED OUT FOR NOW */}
                            {/* <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                {isAuthenticated && (
                                    <button
                                        onClick={() => markHelpfulMutation.mutate(review._id)}
                                        disabled={markHelpfulMutation.isPending}
                                        className={`text-sm flex items-center gap-1 ${review.helpful?.map(id => String(id)).includes(String(user?._id))
                                                ? 'text-primary-600 dark:text-primary-400 font-semibold'
                                                : 'text-gray-600 dark:text-gray-400'
                                            } hover:text-primary-600 dark:hover:text-primary-400 transition-colors disabled:opacity-50`}
                                    >
                                        <svg className="w-4 h-4" fill={review.helpful?.map(id => String(id)).includes(String(user?._id)) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                        </svg>
                                        {review.helpful?.map(id => String(id)).includes(String(user?._id)) ? 'Helpful' : 'Mark as Helpful'} ({review.helpful?.length || 0})
                                    </button>
                                )}
                            </div> */}
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        No reviews yet. Be the first to review!
                    </p>
                </div>
            )}
        </div>
    );
};

