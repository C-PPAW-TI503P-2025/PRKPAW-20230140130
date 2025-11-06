const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator'); 

const presensiController = require('../controllers/presensiController.js');
const { addUserData } = require('../middleware/permissionMiddleware.js');

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

router.use(addUserData);
router.post('/check-in', presensiController.CheckIn);
router.post('/check-out', presensiController.CheckOut);

router.put("/:id", validatePresensiUpdate, presensiController.updatePresensi); 
router.delete("/:id", presensiController.deletePresensi);

module.exports = router;