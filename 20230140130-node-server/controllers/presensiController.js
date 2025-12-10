const { Presensi, User } = require("../models");
const { format } = require("date-fns-tz");
const { Op } = require("sequelize"); 
const timeZone = "Asia/Jakarta";
const multer = require('multer');
const path = require('path');

// Konfigurasi Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Format nama file: userId-timestamp.jpg
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File Filter untuk memastikan hanya gambar yang diterima
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
  }
};

// Export middleware upload
exports.upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit 5MB
});

// ==================== CHECK-IN ====================
exports.CheckIn = async (req, res) => {
  try {
    console.log("=== CHECK-IN REQUEST ===");
    console.log("User:", req.user);
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { id: userId } = req.user;
    const { latitude, longitude } = req.body;
    const buktiFoto = req.file ? req.file.path : null;

    // Validasi input
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        message: "Latitude dan Longitude wajib diisi!" 
      });
    }

    if (!buktiFoto) {
      return res.status(400).json({ 
        message: "Foto selfie wajib diupload!" 
      });
    }

    // Cek apakah user sudah check-in hari ini
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const existingPresensi = await Presensi.findOne({
      where: {
        userId: userId,
        checkIn: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    if (existingPresensi) {
      return res.status(400).json({ 
        message: "Anda sudah melakukan Check-In hari ini." 
      });
    }

    // Simpan Check-In baru dengan foto
    const newPresensi = await Presensi.create({
      userId,
      checkIn: new Date(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      buktiFoto: buktiFoto
    });

    console.log("=== CHECK-IN SUCCESS ===");
    console.log("Data:", newPresensi);

    res.status(201).json({
      message: "Check-in berhasil dicatat!",
      data: newPresensi
    });

  } catch (error) {
    console.error("=== CHECK-IN ERROR ===");
    console.error(error);
    res.status(500).json({ 
      message: "Terjadi kesalahan server", 
      error: error.message 
    });
  }
};

// ==================== CHECK-OUT ====================
exports.CheckOut = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const waktuSekarang = new Date();

    const recordToUpdate = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
      include: { model: User, as: 'user', attributes: ['email', 'role'] }
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
      });
    }

    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    res.json({
      message: `Check-out berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: recordToUpdate, 
    });
  } catch (error) {
    console.error("Error in CheckOut:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan pada server", 
      error: error.message 
    });
  }
};

// ==================== UPDATE PRESENSI ====================
exports.updatePresensi = async (req, res) => {
  try {
    const presensiId = req.params.id;
    const { checkIn, checkOut } = req.body; 
    
    if (checkIn === undefined && checkOut === undefined) {
      return res.status(400).json({
        message: "Request body tidak berisi data yang valid untuk diupdate (checkIn atau checkOut).",
      });
    }
    
    const recordToUpdate = await Presensi.findByPk(presensiId, {
      include: { model: User, as: 'user', attributes: ['email', 'role'] }
    });
    
    if (!recordToUpdate) {
      return res.status(404).json({ 
        message: "Catatan presensi tidak ditemukan." 
      });
    }

    recordToUpdate.checkIn = checkIn || recordToUpdate.checkIn;
    recordToUpdate.checkOut = checkOut || recordToUpdate.checkOut;
    await recordToUpdate.save();

    res.json({
      message: "Data presensi berhasil diperbarui.",
      data: recordToUpdate,
    });
  } catch (error) {
    console.error("Error in updatePresensi:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan pada server", 
      error: error.message 
    });
  }
};

// ==================== DELETE PRESENSI ====================
exports.deletePresensi = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const presensiId = req.params.id;

    const recordToDelete = await Presensi.findByPk(presensiId);

    if (!recordToDelete) {
      return res.status(404).json({ 
        message: "Catatan presensi tidak ditemukan." 
      });
    }

    if (recordToDelete.userId !== userId) {
      return res.status(403).json({ 
        message: "Akses ditolak: Anda bukan pemilik catatan ini." 
      });
    }

    await recordToDelete.destroy();
    res.status(204).send();
    
  } catch (error) {
    console.error("Error in deletePresensi:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan pada server", 
      error: error.message 
    });
  }
};

// ==================== SEARCH BY TANGGAL ====================
exports.searchByTanggal = async (req, res) => {
  try {
    const { tanggal } = req.query;

    if (!tanggal) {
      return res.status(400).json({ 
        message: "Parameter tanggal harus diisi (format: YYYY-MM-DD)." 
      });
    }

    const startDate = new Date(`${tanggal}T00:00:00.000Z`);
    const endDate = new Date(`${tanggal}T23:59:59.999Z`);

    const hasil = await Presensi.findAll({
      where: {
        checkIn: { [Op.between]: [startDate, endDate] },
      },
      include: { 
        model: User, 
        as: 'user', 
        attributes: ['id', 'email', 'role']
      }
    });

    if (hasil.length === 0) {
      return res.status(404).json({ 
        message: "Tidak ada presensi pada tanggal tersebut." 
      });
    }

    res.json({
      message: `Hasil presensi untuk tanggal ${tanggal}`,
      data: hasil,
    });
  } catch (error) {
    console.error("Error in searchByTanggal:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan pada server", 
      error: error.message 
    });
  }
};