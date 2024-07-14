const express = require('express');
const router = express.Router();
const statsController = require('./statsController');

// API routes
router.use('/api', statsController);

module.exports = router;
