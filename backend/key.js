const mongoose = require('mongoose');
const User = require('./models/User');
const crypto = require('crypto');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const key = 'aq_' + crypto.randomBytes(16).toString('hex');
    await User.updateOne({ email: 'admin@aqua.com', apiKey: { $exists: false } }, { $set: { apiKey: key } });
    await User.updateOne({ email: 'admin@aqua.com', apiKey: null }, { $set: { apiKey: key } });
    
    let user = await User.findOne({ email: 'admin@aqua.com' });
    if (user) {
      process.stdout.write('API_KEY:' + user.apiKey + '\n');
    }
    process.exit(0);
  });
