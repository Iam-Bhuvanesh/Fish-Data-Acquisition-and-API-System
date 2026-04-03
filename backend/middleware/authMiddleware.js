const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            if (!token || token === 'undefined' || token === 'null') {
                return res.status(401).json({ message: 'Not authorized, token missing' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            return next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

const apiKeyAuth = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (apiKey) {
        try {
            const user = await User.findOne({ apiKey }).select('-password');
            if (user) {
                req.user = user;
                return next();
            } else {
                return res.status(401).json({ message: 'Invalid API Key' });
            }
        } catch (error) {
            console.error('API Key Auth Error:', error.message);
            return res.status(500).json({ message: 'Server error during API Key validation' });
        }
    }

    // Fallback to JWT protect if no API key provided (manual check in route if needed)
    return protect(req, res, next);
};

module.exports = { protect, admin, apiKeyAuth };
