const mongoose = require('mongoose');

const alertSchema = mongoose.Schema({
    parameter: { type: String, required: true },
    value: { type: Number, required: true },
    level: { type: String, enum: ['Warning', 'Danger'], required: true },
    message: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema);
