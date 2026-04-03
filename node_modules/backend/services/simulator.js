const WaterQuality = require('../models/WaterQuality');
const Alert = require('../models/Alert');

const thresholds = {
    temperature: { min: 22, max: 30, unit: '°C' },
    ph: { min: 6.5, max: 8.5, unit: '' },
    dissolvedOxygen: { min: 5.0, unit: 'mg/L' },
    turbidity: { max: 25, unit: 'NTU' },
    nitrate: { max: 50, unit: 'mg/L' },
    ammonia: { max: 0.05, unit: 'mg/L' },
    manganese: { max: 0.5, unit: 'mg/L' }
};

const generateRandomData = () => {
    return {
        temperature: Number((20 + Math.random() * 15).toFixed(2)), // 20 - 35
        ph: Number((5.5 + Math.random() * 4).toFixed(2)), // 5.5 - 9.5
        dissolvedOxygen: Number((3 + Math.random() * 6).toFixed(2)), // 3 - 9
        turbidity: Number((10 + Math.random() * 30).toFixed(2)), // 10 - 40
        nitrate: Number((20 + Math.random() * 60).toFixed(2)), // 20 - 80
        ammonia: Number((Math.random() * 0.1).toFixed(3)), // 0 - 0.1
        manganese: Number((Math.random() * 1).toFixed(2)), // 0 - 1
        station: 'Station-' + (Math.floor(Math.random() * 3) + 1).toString().padStart(2, '0')
    };
};

const checkStatus = (data) => {
    let status = 'Safe';
    const alerts = [];

    if (data.temperature < thresholds.temperature.min || data.temperature > thresholds.temperature.max) {
        status = 'Warning';
        alerts.push({
            parameter: 'Temperature',
            value: data.temperature,
            level: data.temperature > thresholds.temperature.max + 2 ? 'Danger' : 'Warning',
            message: `Temperature is ${data.temperature > thresholds.temperature.max ? 'high' : 'low'}: ${data.temperature}°C`
        });
    }

    if (data.ph < thresholds.ph.min || data.ph > thresholds.ph.max) {
        status = 'Warning';
        alerts.push({
            parameter: 'pH',
            value: data.ph,
            level: 'Warning',
            message: `pH level is out of range: ${data.ph}`
        });
    }

    if (data.dissolvedOxygen < thresholds.dissolvedOxygen.min) {
        status = data.dissolvedOxygen < 4 ? 'Danger' : 'Warning';
        alerts.push({
            parameter: 'Dissolved Oxygen',
            value: data.dissolvedOxygen,
            level: status,
            message: `Dissolved Oxygen is low: ${data.dissolvedOxygen} mg/L`
        });
    }

    if (data.turbidity > thresholds.turbidity.max) {
        status = data.turbidity > 35 ? 'Danger' : 'Warning';
        alerts.push({
            parameter: 'Turbidity',
            value: data.turbidity,
            level: status,
            message: `Turbidity is high: ${data.turbidity} NTU`
        });
    }

    if (data.nitrate > thresholds.nitrate.max) {
        status = 'Warning';
        alerts.push({
            parameter: 'Nitrate',
            value: data.nitrate,
            level: 'Warning',
            message: `Nitrate level is high: ${data.nitrate} mg/L`
        });
    }

    if (alerts.some(a => a.level === 'Danger')) status = 'Danger';

    return { status, alerts };
};

const startSimulation = (io) => {
    console.log('Simulation service started...');
    setInterval(async () => {
        try {
            const data = generateRandomData();
            const { status, alerts } = checkStatus(data);

            const newData = await WaterQuality.create({
                ...data,
                status
            });

            // Emit Real-time update
            if (io) {
                io.emit('water-quality-update', newData);
            }

            if (alerts.length > 0) {
                for (const alert of alerts) {
                    const newAlert = await Alert.create(alert);
                    if (io) {
                        io.emit('alert-new', newAlert);
                    }
                }
            }

            // Keep only last 1000 records to prevent DB bloating in simulation
            const count = await WaterQuality.countDocuments();
            if (count > 1000) {
                const oldest = await WaterQuality.find().sort({ createdAt: 1 }).limit(100);
                const ids = oldest.map(doc => doc._id);
                await WaterQuality.deleteMany({ _id: { $in: ids } });
            }

        } catch (error) {
            console.error('Simulation Error:', error);
        }
    }, 10000); // Every 10 seconds
};

module.exports = { startSimulation };
