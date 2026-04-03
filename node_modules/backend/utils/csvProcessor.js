const fs = require('fs');
const csv = require('csv-parser');
const WaterQuality = require('../models/WaterQuality');

const processCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                // Flexible mapping based on common headers
                const mappedData = {
                    temperature: parseFloat(data.TEMP || data.temperature || 25),
                    ph: parseFloat(data.PH || data.ph || 7),
                    dissolvedOxygen: parseFloat(data.DO || data['Dissolved Oxygen'] || 6),
                    turbidity: parseFloat(data.TURBIDITY || data.turbidity || 15),
                    nitrate: parseFloat(data['NITRATE(PPM)'] || 10),
                    ammonia: parseFloat(data['AMMONIA(mg/l)'] || 0.01),
                    manganese: parseFloat(data['MANGANESE(mg/l)'] || 0.1),
                    station: data.Station || data.station || 'Station-CSV',
                    date: data.Date || new Date().toISOString(),
                };
                results.push(mappedData);
            })
            .on('end', async () => {
                try {
                    // Batch insert or save one by one
                    // For simulation purposes, we might just store them for later use
                    // or insert a sample set
                    resolve(results);
                } catch (error) {
                    reject(error);
                }
            });
    });
};

module.exports = { processCSV };
