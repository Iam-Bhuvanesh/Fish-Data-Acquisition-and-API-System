const getFeedRecommendation = (data) => {
    let baseFeed = 100; // units/day base
    let suggestion = "Standard Feeding";

    // Metabolism increases with temperature
    if (data.temperature > 28) {
        baseFeed *= 1.2;
        suggestion = "Increase frequency: Warm water high metabolism";
    } else if (data.temperature < 20) {
        baseFeed *= 0.8;
        suggestion = "Reduce frequency: Cold water low metabolism";
    }

    // Stress reduces feeding
    if (data.dissolvedOxygen < 4) {
        baseFeed *= 0.5;
        suggestion = "Minimal feeding: Low oxygen stress";
    }

    if (data.ammonia > 0.05) {
        baseFeed *= 0.7;
        suggestion = "Caution: High ammonia levels";
    }

    return { amount: baseFeed.toFixed(1), unit: 'kg/day', suggestion };
};

const getDiseaseRisk = (data) => {
    let riskScore = 0;
    let factors = [];

    if (data.dissolvedOxygen < 4) {
        riskScore += 40;
        factors.push("Low Dissolved Oxygen");
    }
    if (data.ammonia > 0.05) {
        riskScore += 30;
        factors.push("High Ammonia Toxicity");
    }
    if (data.ph < 6.5 || data.ph > 8.5) {
        riskScore += 15;
        factors.push("Unstable pH");
    }
    if (data.temperature > 30) {
        riskScore += 15;
        factors.push("Thermal Stress");
    }

    let level = "Low";
    if (riskScore > 60) level = "High";
    else if (riskScore > 30) level = "Medium";

    return {
        level,
        score: riskScore,
        factors,
        prevention: level === "High" ? "Immediate aeration and partial water change recommended." : "Monitor water quality closely."
    };
};

const getGrowthProjection = (data) => {
    let growthIndex = 100; // multiplier

    // Optimal growth window 24-28C
    if (data.temperature >= 24 && data.temperature <= 28) {
        growthIndex *= 1.1;
    } else {
        growthIndex *= 0.9;
    }

    if (data.dissolvedOxygen >= 5.5) {
        growthIndex *= 1.05;
    } else {
        growthIndex *= 0.8;
    }

    let performance = growthIndex > 105 ? "Excellent" : growthIndex > 90 ? "Good" : "Delayed";

    return {
        index: growthIndex.toFixed(1),
        performance,
        forecast: `Estimated ${performance.toLowerCase()} growth based on current environment.`
    };
};

module.exports = {
    getFeedRecommendation,
    getDiseaseRisk,
    getGrowthProjection
};
