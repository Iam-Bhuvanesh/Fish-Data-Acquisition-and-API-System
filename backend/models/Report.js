const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
    summaryData: {
        tempAvg: Number,
        phAvg: Number,
        doAvg: Number,
        turbAvg: Number,
        nitrateAvg: Number,
        totalAlerts: Number
    },
    generatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
