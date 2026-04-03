const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function getApiKey() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'admin@aqua.com' });
        if (user) {
            if (!user.apiKey) {
                const crypto = require('crypto');
                user.apiKey = `aq_${crypto.randomBytes(16).toString('hex')}`;
                await user.save();
            }
            console.log('---RESULT_START---');
            console.log(user.apiKey);
            console.log('---RESULT_END---');
        } else {
            console.log('User not found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
}

getApiKey();
