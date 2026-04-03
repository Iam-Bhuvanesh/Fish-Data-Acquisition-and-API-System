const WaterQuality = require('../models/WaterQuality');
const { getFeedRecommendation, getDiseaseRisk, getGrowthProjection } = require('../services/analyticsService');
const { processCSV } = require('../utils/csvProcessor');
const { getMLPredictions } = require('../utils/mlRunner');
const path = require('path');

const getLatestInsights = async (req, res) => {
    try {
        const latest = await WaterQuality.findOne().sort({ createdAt: -1 });
        if (!latest) {
            return res.status(404).json({ message: 'No data available for analytics' });
        }

        const feed = getFeedRecommendation(latest);
        const disease = getDiseaseRisk(latest);
        const growth = getGrowthProjection(latest);

        // Include ML Predictions
        let mlPredictions = null;
        try {
            mlPredictions = await getMLPredictions({
                temperature: latest.temperature,
                ph: latest.ph,
                dissolvedOxygen: latest.dissolvedOxygen,
                ammonia: latest.ammonia
            });
        } catch (mlError) {
            console.error('ML Prediction Error:', mlError);
            mlPredictions = { error: 'ML Engine unavailable' };
        }

        res.json({
            timestamp: latest.createdAt,
            station: latest.station,
            metrics: {
                temperature: latest.temperature,
                ph: latest.ph,
                do: latest.dissolvedOxygen,
                ammonia: latest.ammonia
            },
            insights: {
                feed,
                disease,
                growth,
                ml: mlPredictions
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const uploadDataset = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file' });
        }

        const filePath = path.join(__dirname, '../', req.file.path);
        const results = await processCSV(filePath);

        // Store a sample or all for simulation
        // For now, let's insert the first 50 to the database
        const toInsert = results.slice(0, 50);
        await WaterQuality.insertMany(toInsert);

        res.status(201).json({
            message: `Successfully processed ${results.length} records.`,
            inserted: toInsert.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getLatestInsights,
    uploadDataset
};
