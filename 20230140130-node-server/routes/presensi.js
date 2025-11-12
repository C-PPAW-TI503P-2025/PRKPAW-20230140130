const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator'); 

const presensiController = require('../controllers/presensiController.js');
const authenticateToken = require('../middleware/authenticateToken.js');

const validatePresensiUpdate = [
    body('checkIn')
        .optional() 
        .isISO8601() 
        .withMessage('Format checkIn tidak valid. Gunakan format tanggal/waktu ISO 8601.'),
    body('checkOut')
        .optional() 
        .isISO8601()
        .withMessage('Format checkOut tidak valid. Gunakan format tanggal/waktu ISO 8601.'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: "Validasi input gagal.", 
                errors: errors.array() 
            });
        }
        next();
    }
];

router.post('/check-in', authenticateToken, presensiController.CheckIn);
router.put('/check-out', authenticateToken, presensiController.CheckOut);

router.put("/:id", authenticateToken, validatePresensiUpdate, presensiController.updatePresensi); 
router.delete("/:id", authenticateToken, presensiController.deletePresensi);

router.get('/search/nama', presensiController.searchByNama);
router.get('/search/tanggal', presensiController.searchByTanggal);

module.exports = router;