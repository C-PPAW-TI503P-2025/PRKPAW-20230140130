const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController.js');

const authenticateToken = require('../middleware/authenticateToken.js');
const { isAdmin } = require('../middleware/permissionMiddleware.js');

router.get('/daily', [authenticateToken, isAdmin], reportController.getDailyReport);

module.exports = router;