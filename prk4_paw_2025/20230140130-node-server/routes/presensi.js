const express = require('express');
const router = express.Router();

const presensiController = require('../controllers/presensiController.js');
const { addUserData } = require('../middleware/permissionMiddleware.js');

router.use(addUserData);
router.post('/check-in', presensiController.CheckIn);
router.post('/check-out', presensiController.CheckOut);

module.exports = router;