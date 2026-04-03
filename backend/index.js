const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { startSimulation } = require('./services/simulator');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize express and http server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(express.json());
app.use(cors());

// Socket.io Authentication Middleware
io.use(async (socket, next) => {
    const apiKey = socket.handshake.auth.token || socket.handshake.query.apiKey;
    
    if (!apiKey) {
        return next(new Error('Authentication error: API Key required'));
    }

    try {
        const user = await User.findOne({ apiKey });
        if (user) {
            socket.user = user;
            return next();
        } else {
            return next(new Error('Authentication error: Invalid API Key'));
        }
    } catch (error) {
        return next(new Error('Authentication error: Server error'));
    }
});

io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}${socket.user ? ` (User: ${socket.user.name})` : ''}`);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/water-quality', require('./routes/waterRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/data-query', require('./routes/dataQueryRoutes'));
app.use('/api/fish-images', require('./routes/fishImageRoutes'));

// Root route
app.get('/', (req, res) => {
    res.send('Aquaculture Water Quality Monitoring API is running...');
});

// Start Simulation Service
startSimulation(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
