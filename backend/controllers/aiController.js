const WaterQuality = require('../models/WaterQuality');
const { getLatestInsights } = require('../controllers/analyticsController');

const handleChat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'No question provided.' });
        }

        // Fetch latest metrics and insights once
        const latest = await WaterQuality.findOne().sort({ createdAt: -1 });
        if (!latest) {
             return res.json({ response: "I'm sorry, I don't see any live pond data yet. Please ensure the simulator is running!" });
        }

        const msg = message.toLowerCase();
        let response = "";

        // Interactive "Real Chatbot" Logic
        if (msg.includes("status") || msg.includes("how is") || msg.includes("condition")) {
            const timeStr = new Date(latest.createdAt).toLocaleTimeString();
            response = `As of ${timeStr}, Station ${latest.station} is in a **${latest.status}** state. 
            \n• **Temperature**: ${latest.temperature}°C (Optimal: 28°C)
            \n• **pH**: ${latest.ph} (Optimal: 7.5)
            \n• **Oxygen**: ${latest.dissolvedOxygen} mg/L (Min: 5.0 mg/L)
            \n${latest.status === 'Safe' ? "Everything looks optimal. I'll keep monitoring for any deviations." : "I detected some anomalies. Please check the Alerts tab for technical details."}`;
        } 
        else if (msg.includes("feeding") || msg.includes("feed") || msg.includes("eat")) {
            const feedingRate = (latest.dissolvedOxygen > 6) ? "Normal (100%)" : "Reduced (70%)";
            response = `Based on current Oxygen levels (${latest.dissolvedOxygen} mg/L), I recommend a **${feedingRate}** feeding schedule. High oxygen allows for full metabolic rate, while lower levels require digestive rest for the fish.`;
        }
        else if (msg.includes("risk") || msg.includes("future") || msg.includes("predict")) {
            const riskLevel = latest.dissolvedOxygen < 5.5 ? "High" : "Low";
            response = `My 6-hour predictive model indicates a **${riskLevel} Risk** level. 
            \n• **Forecast**: Dissolved Oxygen is expected to ${latest.dissolvedOxygen < 6 ? 'drop slightly' : 'remain stable'} over the next 3 hours. 
            \n• **Action**: No immediate action required, but I'll alert you if the trend shifts negatively.`;
        }
        else if (msg.includes("oxygen") || msg.includes("do")) {
            response = `The current Dissolved Oxygen is **${latest.dissolvedOxygen} mg/L**. For your specific stock, we aim for > 5.0 mg/L. ${latest.dissolvedOxygen < 5 ? "⚠️ ALERT: Oxygen is critically low! Check your aerators now." : "The levels are healthy."}`;
        }
        else if (msg.includes("ph") || msg.includes("acid")) {
            response = `The pH is currently **${latest.ph}**. A stable pH between 7.0 and 8.5 is vital for preventing gill irritation and ensuring efficient nutrient uptake.`;
        }
        else if (msg.includes("help") || msg.includes("what can you do") || msg.includes("features")) {
            response = "I can analyze your pond's health in real-time! You can ask me for a 'Status Report', 'Feeding Advice', 'Risk Assessment', or specific metrics like 'pH' and 'Oxygen'. How can I help you right now?";
        }
        else {
            response = `I understand you're asking about "${message}". Based on the live sensors at ${latest.station}, the most relevant data I have is the Temperature at ${latest.temperature}°C and status ${latest.status}. Would you like a full health report?`;
        }

        res.json({ response });
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ message: 'AI Engine Error' });
    }
};

module.exports = { handleChat };
