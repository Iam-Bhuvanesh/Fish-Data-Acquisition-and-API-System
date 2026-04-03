const mongoose = require('mongoose');

const waterQualitySchema = mongoose.Schema({
    temperature: { type: Number, required: true },
    ph: { type: Number, required: true },
    dissolvedOxygen: { type: Number, required: true },
    turbidity: { type: Number, required: true },
    nitrate: { type: Number, required: true },
    ammonia: { type: Number, required: false },
    manganese: { type: Number, required: false },
    station: { type: String, required: true, default: 'Station-01' },
    status: { type: String, enum: ['Safe', 'Warning', 'Danger'], default: 'Safe' }
}, {
    timestamps: true
});

module.exports = mongoose.model('WaterQuality', waterQualitySchema);
