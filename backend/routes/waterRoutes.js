const express = require('express');
const router = express.Router();
const { getWaterQualityData, getAlerts, getLatestMetrics } = require('../controllers/waterController');
const { protect, apiKeyAuth } = require('../middleware/authMiddleware');

router.get('/', apiKeyAuth, getWaterQualityData);
router.get('/latest', apiKeyAuth, getLatestMetrics);
router.get('/alerts', apiKeyAuth, getAlerts);

module.exports = router;
