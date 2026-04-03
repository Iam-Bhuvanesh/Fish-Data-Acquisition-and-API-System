const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Route for chatbot messaging
router.post('/chat', protect, handleChat);

module.exports = router;
