const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getLatestInsights, uploadDataset } = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

router.get('/insights', protect, getLatestInsights);
router.post('/upload', protect, admin, upload.single('file'), uploadDataset);

module.exports = router;
