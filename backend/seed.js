const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const WaterQuality = require('./models/WaterQuality');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding...');

        // Clear existing users
        await User.deleteMany();

        // Create Admin User
        await User.create({
            name: 'Admin User',
            email: 'admin@aqua.com',
            password: 'password123',
            role: 'Admin'
        });

        // Create Normal User
        await User.create({
            name: 'John Doe',
            email: 'user@aqua.com',
            password: 'password123',
            role: 'User'
        });

        console.log('Users seeded successfully!');

        // Optional: Seed some initial water data
        await WaterQuality.create({
            temperature: 25.5,
            ph: 7.2,
            dissolvedOxygen: 6.8,
            turbidity: 12.3,
            nitrate: 15.0,
            station: 'Station-01',
            status: 'Safe'
        });

        console.log('Initial data seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
