const express = require('express');
const router = express.Router();
const { submitInquiry, getLandingStats } = require('../controllers/landingController');

router.post('/inquiry', submitInquiry);
router.get('/stats', getLandingStats);

module.exports = router;
