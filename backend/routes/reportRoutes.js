const express = require('express');
const router = express.Router();
const { generateReport, getReports, exportWaterQualityCSV } = require('../controllers/reportController');
const { protect, admin, apiKeyAuth } = require('../middleware/authMiddleware');

router.post('/generate', protect, admin, generateReport);
router.get('/', protect, getReports);
router.get('/export/csv', apiKeyAuth, exportWaterQualityCSV);


module.exports = router;
