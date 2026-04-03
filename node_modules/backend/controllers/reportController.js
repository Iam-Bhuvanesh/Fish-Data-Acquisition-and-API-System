const WaterQuality = require('../models/WaterQuality');
const Alert = require('../models/Alert');
const Report = require('../models/Report');

const generateReport = async (req, res) => {
    try {
        const stats = await WaterQuality.aggregate([
            {
                $group: {
                    _id: null,
                    tempAvg: { $avg: '$temperature' },
                    phAvg: { $avg: '$ph' },
                    doAvg: { $avg: '$dissolvedOxygen' },
                    turbAvg: { $avg: '$turbidity' },
                    nitrateAvg: { $avg: '$nitrate' }
                }
            }
        ]);

        const totalAlerts = await Alert.countDocuments();

        const report = await Report.create({
            summaryData: {
                tempAvg: stats[0]?.tempAvg || 0,
                phAvg: stats[0]?.phAvg || 0,
                doAvg: stats[0]?.doAvg || 0,
                turbAvg: stats[0]?.turbAvg || 0,
                nitrateAvg: stats[0]?.nitrateAvg || 0,
                totalAlerts
            }
        });

        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReports = async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const exportWaterQualityCSV = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const data = await WaterQuality.find(query).sort({ createdAt: 1 });

        if (data.length === 0) {
            return res.status(404).json({ message: 'No data found for the selected range' });
        }

        // CSV Header
        let csv = 'ID,Timestamp,Station,Temperature,pH,DissolvedOxygen,Turbidity,Nitrate,Ammonia,Manganese,Status\n';

        // CSV Rows
        data.forEach(item => {
            csv += `${item._id},${item.createdAt.toISOString()},${item.station},${item.temperature},${item.ph},${item.dissolvedOxygen},${item.turbidity},${item.nitrate},${item.ammonia || 0},${item.manganese || 0},${item.status}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=WaterQuality_${new Date().toISOString().split('T')[0]}.csv`);
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateReport, getReports, exportWaterQualityCSV };
