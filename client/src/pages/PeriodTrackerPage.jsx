import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';

export const PeriodTrackerPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        flow: 'medium',
        symptoms: [],
        notes: ''
    });

    const queryClient = useQueryClient();

    // Fetch period entries
    const { data: entries, isLoading: entriesLoading } = useQuery({
        queryKey: ['periodEntries'],
        queryFn: async () => {
            const response = await api.get('/periods');
            return response.data.data;
        }
    });

    // Fetch cycle insights
    const { data: insights, isLoading: insightsLoading } = useQuery({
        queryKey: ['cycleInsights'],
        queryFn: async () => {
            const response = await api.get('/periods/insights');
            return response.data.data;
        }
    });

    // Create period entry mutation
    const createEntryMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/periods', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['periodEntries']);
            queryClient.invalidateQueries(['cycleInsights']);
            setShowForm(false);
            setFormData({
                startDate: '',
                endDate: '',
                flow: 'medium',
                symptoms: [],
                notes: ''
            });
        }
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSymptomChange = (symptom) => {
        setFormData(prev => ({
            ...prev,
            symptoms: prev.symptoms.includes(symptom)
                ? prev.symptoms.filter(s => s !== symptom)
                : [...prev.symptoms, symptom]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createEntryMutation.mutate(formData);
    };

    const symptoms = [
        'cramps', 'bloating', 'headache', 'mood_swings', 'fatigue',
        'nausea', 'back_pain', 'breast_tenderness', 'acne', 'food_cravings'
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getFlowColor = (flow) => {
        switch (flow) {
            case 'light': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
            case 'heavy': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
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
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Period Tracker
                        </h1>
                        <motion.button
                            onClick={() => setShowForm(!showForm)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {showForm ? 'Cancel' : 'Log Period'}
                        </motion.button>
                    </div>


                    {/* Add Period Form */}
                    {showForm && (
                        <motion.div
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Log Period Entry
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Flow Intensity
                                    </label>
                                    <select
                                        name="flow"
                                        value={formData.flow}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="light">Light</option>
                                        <option value="medium">Medium</option>
                                        <option value="heavy">Heavy</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Symptoms
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {symptoms.map(symptom => (
                                            <label key={symptom} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.symptoms.includes(symptom)}
                                                    onChange={() => handleSymptomChange(symptom)}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                                    {symptom.replace('_', ' ')}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Notes (optional)
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Any additional notes about this period..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        type="submit"
                                        disabled={createEntryMutation.isPending}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {createEntryMutation.isPending && (
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        {createEntryMutation.isPending ? 'Saving...' : 'Save Entry'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* Cycle Insights */}
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Cycle Insights
                        </h2>
                        {insightsLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                            </div>
                        ) : insights ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                        {insights.averageCycleLength || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Average Cycle Length (days)
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                                        {insights.averagePeriodLength || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Average Period Length (days)
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {insights.totalCycles || 0}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Total Cycles Tracked
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {insights.nextPredictedDate ? formatDate(insights.nextPredictedDate) : 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Next Predicted Period
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                Log at least 2 periods to see cycle insights
                            </div>
                        )}
                    </motion.div>

                    {/* Personalized Tips */}
                    {insights && insights.tips && insights.tips.length > 0 && (
                        <motion.div
                            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg shadow-md p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <span className="text-2xl mr-2">💡</span>
                                Personalized Tips
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {insights.tips.map((tip, index) => (
                                    <motion.div
                                        key={index}
                                        className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-purple-200 dark:border-purple-700/30"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: 0.2 + (index * 0.1) }}
                                    >
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {tip}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Period Entries List */}
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Recent Entries
                        </h2>
                        {entriesLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                            </div>
                        ) : entries && entries.length > 0 ? (
                            <div className="space-y-4">
                                {entries.map((entry) => (
                                    <motion.div
                                        key={entry._id}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                                                        {formatDate(entry.startDate)} - {formatDate(entry.endDate)}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFlowColor(entry.flow)}`}>
                                                        {entry.flow}
                                                    </span>
                                                </div>
                                                {entry.symptoms && entry.symptoms.length > 0 && (
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                        Symptoms: {entry.symptoms.map(s => s.replace('_', ' ')).join(', ')}
                                                    </div>
                                                )}
                                                {entry.notes && (
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {entry.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No period entries yet. Start by logging your first period!
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
};
