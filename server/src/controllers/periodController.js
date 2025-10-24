import { validationResult } from 'express-validator';
import PeriodEntry from '../models/PeriodEntry.js';

export const createPeriodEntry = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { startDate, endDate, flow, symptoms, notes } = req.body;
        const userId = req.user._id;

        // Check for overlapping entries
        const overlappingEntry = await PeriodEntry.findOne({
            userId,
            $or: [
                {
                    startDate: { $lte: new Date(endDate) },
                    endDate: { $gte: new Date(startDate) }
                }
            ]
        });

        if (overlappingEntry) {
            return res.status(400).json({
                success: false,
                message: 'Period entry overlaps with existing entry'
            });
        }

        const periodEntry = new PeriodEntry({
            userId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            flow,
            symptoms: symptoms || [],
            notes
        });

        await periodEntry.save();

        res.status(201).json({
            success: true,
            message: 'Period entry created successfully',
            data: periodEntry
        });
    } catch (error) {
        console.error('Create period entry error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create period entry'
        });
    }
};

export const getPeriodEntries = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10 } = req.query;

        const entries = await PeriodEntry.find({ userId })
            .sort({ startDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await PeriodEntry.countDocuments({ userId });

        res.json({
            success: true,
            data: entries,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get period entries error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch period entries'
        });
    }
};

export const getPeriodEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const entry = await PeriodEntry.findOne({ _id: id, userId });

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Period entry not found'
            });
        }

        res.json({
            success: true,
            data: entry
        });
    } catch (error) {
        console.error('Get period entry error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch period entry'
        });
    }
};

export const updatePeriodEntry = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const userId = req.user._id;
        const { startDate, endDate, flow, symptoms, notes } = req.body;

        const entry = await PeriodEntry.findOne({ _id: id, userId });

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Period entry not found'
            });
        }

        // Check for overlapping entries (excluding current entry)
        const overlappingEntry = await PeriodEntry.findOne({
            userId,
            _id: { $ne: id },
            $or: [
                {
                    startDate: { $lte: new Date(endDate) },
                    endDate: { $gte: new Date(startDate) }
                }
            ]
        });

        if (overlappingEntry) {
            return res.status(400).json({
                success: false,
                message: 'Period entry overlaps with existing entry'
            });
        }

        entry.startDate = new Date(startDate);
        entry.endDate = new Date(endDate);
        entry.flow = flow;
        entry.symptoms = symptoms || [];
        entry.notes = notes;

        await entry.save();

        res.json({
            success: true,
            message: 'Period entry updated successfully',
            data: entry
        });
    } catch (error) {
        console.error('Update period entry error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update period entry'
        });
    }
};

export const deletePeriodEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const entry = await PeriodEntry.findOneAndDelete({ _id: id, userId });

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Period entry not found'
            });
        }

        res.json({
            success: true,
            message: 'Period entry deleted successfully'
        });
    } catch (error) {
        console.error('Delete period entry error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete period entry'
        });
    }
};

export const getCycleInsights = async (req, res) => {
    try {
        const userId = req.user._id;

        const entries = await PeriodEntry.find({ userId })
            .sort({ startDate: -1 })
            .limit(12); // Last 12 cycles

        if (entries.length < 2) {
            return res.json({
                success: true,
                data: {
                    averageCycleLength: null,
                    averagePeriodDuration: null,
                    nextPredictedPeriod: null,
                    cycleRegularity: 'insufficient_data',
                    insights: ['Add more period entries to get cycle insights']
                }
            });
        }

        // Calculate cycle lengths
        const cycleLengths = [];
        for (let i = 0; i < entries.length - 1; i++) {
            const currentStart = new Date(entries[i].startDate);
            const previousStart = new Date(entries[i + 1].startDate);
            const cycleLength = Math.ceil((currentStart - previousStart) / (1000 * 60 * 60 * 24));
            cycleLengths.push(cycleLength);
        }

        // Calculate period durations
        const periodDurations = entries.map(entry => {
            const start = new Date(entry.startDate);
            const end = new Date(entry.endDate);
            return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        });

        // Calculate averages
        const averageCycleLength = Math.round(
            cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length
        );
        const averagePeriodDuration = Math.round(
            periodDurations.reduce((sum, duration) => sum + duration, 0) / periodDurations.length
        );

        // Predict next period
        const lastEntry = entries[0];
        const lastStartDate = new Date(lastEntry.startDate);
        const nextPredictedPeriod = new Date(lastStartDate);
        nextPredictedPeriod.setDate(lastStartDate.getDate() + averageCycleLength);

        // Calculate cycle regularity
        const cycleVariance = cycleLengths.reduce((sum, length) => {
            return sum + Math.pow(length - averageCycleLength, 2);
        }, 0) / cycleLengths.length;

        const cycleRegularity = cycleVariance <= 7 ? 'regular' :
            cycleVariance <= 14 ? 'slightly_irregular' : 'irregular';

        // Generate insights and personalized tips
        const insights = [];
        const tips = [];

        // Cycle regularity insights
        if (cycleRegularity === 'regular') {
            insights.push('Your cycle is very regular!');
            tips.push('💡 Great! Your regular cycle makes it easier to predict your next period and plan activities.');
        } else if (cycleRegularity === 'slightly_irregular') {
            insights.push('Your cycle is slightly irregular but within normal range.');
            tips.push('💡 Slight variations are normal. Stress, diet, and lifestyle can affect cycle length.');
        } else {
            insights.push('Your cycle shows some irregularity. Consider consulting a healthcare provider.');
            tips.push('💡 Track symptoms and lifestyle factors to help identify patterns with your healthcare provider.');
        }

        // Period duration insights
        if (averagePeriodDuration < 3) {
            insights.push('Your periods are quite short. This is normal for some women.');
            tips.push('💡 Short periods can be normal, but ensure you\'re getting enough iron and nutrients.');
        } else if (averagePeriodDuration > 7) {
            insights.push('Your periods are longer than average. Consider discussing with a healthcare provider.');
            tips.push('💡 Longer periods may require monitoring for iron levels and overall health.');
        } else {
            tips.push('💡 Your period length is within the typical range of 3-7 days.');
        }

        // Cycle length specific tips
        if (averageCycleLength < 21) {
            tips.push('💡 Your short cycle may mean more frequent periods. Consider tracking symptoms for patterns.');
        } else if (averageCycleLength > 35) {
            tips.push('💡 Longer cycles are normal for some women. Track any changes in symptoms or flow.');
        } else {
            tips.push('💡 Your cycle length is within the typical 21-35 day range.');
        }

        // Fertility window tips
        const fertileWindowStart = averageCycleLength - 14;
        const fertileWindowEnd = averageCycleLength - 10;
        tips.push(`💡 Your fertile window is typically around days ${fertileWindowStart}-${fertileWindowEnd} of your cycle.`);

        // Ovulation prediction tips
        const ovulationDay = averageCycleLength - 14;
        tips.push(`💡 You likely ovulate around day ${ovulationDay} of your cycle.`);

        // Lifestyle tips based on cycle phase
        const today = new Date();
        const daysSinceLastPeriod = Math.ceil((today - new Date(entries[0].startDate)) / (1000 * 60 * 60 * 24));

        if (daysSinceLastPeriod <= 7) {
            tips.push('💡 During your period: Focus on rest, iron-rich foods, and gentle exercise like yoga or walking.');
        } else if (daysSinceLastPeriod <= 14) {
            tips.push('💡 Post-period phase: Great time for intense workouts and trying new activities!');
        } else if (daysSinceLastPeriod <= 21) {
            tips.push('💡 Ovulation phase: You may feel more energetic and confident. Perfect for important meetings or dates!');
        } else {
            tips.push('💡 Pre-menstrual phase: Be gentle with yourself. Consider magnesium-rich foods and stress management.');
        }

        // Data tracking encouragement
        if (entries.length >= 6) {
            tips.push('💡 Excellent tracking! You have enough data for reliable predictions and insights.');
        } else if (entries.length >= 3) {
            tips.push('💡 Keep tracking! More data will improve the accuracy of your cycle predictions.');
        }

        // Symptom tracking tips (if we had symptom data)
        const hasSymptoms = entries.some(entry => entry.symptoms && entry.symptoms.length > 0);
        if (hasSymptoms) {
            tips.push('💡 Consider tracking symptoms like mood, energy, and sleep to identify patterns.');
        } else {
            tips.push('💡 Try logging symptoms like cramps, mood, and energy levels for better insights.');
        }

        res.json({
            success: true,
            data: {
                averageCycleLength,
                averagePeriodDuration,
                nextPredictedPeriod: nextPredictedPeriod.toISOString(),
                cycleRegularity,
                insights,
                tips,
                totalCycles: entries.length,
                cycleLengths,
                periodDurations
            }
        });
    } catch (error) {
        console.error('Get cycle insights error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cycle insights'
        });
    }
};
