const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController.js');
const { addUserData, isAdmin } = require('../middleware/permissionMiddleware.js');

router.get('/daily', [addUserData, isAdmin], reportController.getDailyReport);

module.exports = router;