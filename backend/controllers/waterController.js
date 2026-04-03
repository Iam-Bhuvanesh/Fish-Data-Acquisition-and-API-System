const WaterQuality = require('../models/WaterQuality');
const Alert = require('../models/Alert');

const getWaterQualityData = async (req, res) => {
    try {
        const { station, limit = 20 } = req.query;
        let query = {};
        if (station) query.station = station;

        const data = await WaterQuality.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find().sort({ createdAt: -1 }).limit(50);
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLatestMetrics = async (req, res) => {
    try {
        const latest = await WaterQuality.findOne().sort({ createdAt: -1 });
        res.json(latest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getWaterQualityData, getAlerts, getLatestMetrics };
