const { spawn } = require('child_process');
const path = require('path');

/**
 * Runs the Python ML prediction script.
 * @param {Object} sensorData - {temperature, ph, dissolvedOxygen, ammonia}
 * @returns {Promise<Object>} - {ml_status, ml_growth_index}
 */
const getMLPredictions = (sensorData) => {
    return new Promise((resolve, reject) => {
        const pythonProcessPath = process.env.PYTHON_PATH || 'python';
        const scriptPath = path.join(__dirname, '../ml/predict.py');
        const inputStr = JSON.stringify(sensorData);

        const pythonProcess = spawn(pythonProcessPath, [scriptPath, inputStr]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`ML script exited with code ${code}. Error: ${errorString}`);
                return reject(new Error(`ML Prediction failed: ${errorString}`));
            }
            
            try {
                // prediction output should be JSON
                const result = JSON.parse(dataString);
                if (result.error) {
                    return reject(new Error(`ML Script Error: ${result.error}`));
                }
                resolve(result);
            } catch (err) {
                console.error("Failed to parse ML output:", dataString);
                reject(new Error("Failed to parse ML prediction response"));
            }
        });
    });
};

module.exports = {
    getMLPredictions
};
