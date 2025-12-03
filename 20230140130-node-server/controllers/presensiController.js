const { Presensi, User } = require("../models");
const { format } = require("date-fns-tz");
const { Op } = require("sequelize"); 
const timeZone = "Asia/Jakarta";

exports.CheckIn = async (req, res) => {
  try {
    // 1. Ambil User ID dari Token (bukan dari body)
    const { id: userId } = req.user;

    // 2. Ambil data Lokasi dari Frontend (Body)
    const { latitude, longitude } = req.body; 

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
      return res.status(400).json({ message: "Anda sudah melakukan Check-In hari ini." });
    }

    // 3. Simpan Check-In baru BESERTA data Lokasi
    const newPresensi = await Presensi.create({
      userId: userId,
      checkIn: new Date(),
      latitude: latitude,
      longitude: longitude
    });

    res.status(201).json({
      message: "Check-in berhasil dicatat!",
      data: newPresensi
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

exports.CheckOut = async (req, res) => {
  try {
    const { id: userId } = req.user; // HAPUS nama: userName
    const waktuSekarang = new Date();

    const recordToUpdate = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
      include: { model: User, as: 'user', attributes: ['email'] } // HAPUS 'nama'
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
      });
    }

    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    res.json({
      message: `Check-out Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`, // HAPUS ${userName}
      data: recordToUpdate, 
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.updatePresensi = async (req, res) => {
  try {
    const presensiId = req.params.id;
    const { checkIn, checkOut } = req.body; 
    if (checkIn === undefined && checkOut === undefined) {
        return res.status(400).json({
        message:
        "Request body tidak berisi data yang valid untuk diupdate (checkIn atau checkOut).",
    });
    }
    const recordToUpdate = await Presensi.findByPk(presensiId, {
        include: { model: User, as: 'user', attributes: ['email'] } // HAPUS 'nama'
    });
    if (!recordToUpdate) {
        return res
            .status(404)
            .json({ message: "Catatan presensi tidak ditemukan." });
        }

    recordToUpdate.checkIn = checkIn || recordToUpdate.checkIn;
    recordToUpdate.checkOut = checkOut || recordToUpdate.checkOut;
    await recordToUpdate.save();

    res.json({
        message: "Data presensi berhasil diperbarui.",
        data: recordToUpdate,
    });
  } catch (error) {
    res
        .status(500)
        .json({ message: "Terjadi kesalahan pada server", error: error.message });
    }
};

exports.deletePresensi = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const presensiId = req.params.id;

    const recordToDelete = await Presensi.findByPk(presensiId);

    if (!recordToDelete) {
      return res
        .status(404)
        .json({ message: "Catatan presensi tidak ditemukan." });
    }

    if (recordToDelete.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Akses ditolak: Anda bukan pemilik catatan ini." });
    }

    await recordToDelete.destroy();
    res.status(204).send();
    
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// HAPUS FUNCTION searchByNama KARENA TIDAK ADA FIELD nama LAGI
// exports.searchByNama = ...

exports.searchByTanggal = async (req, res) => {
    try {
        const { tanggal } = req.query;

        if (!tanggal) {
            return res.status(400).json({ message: "Parameter tanggal harus diisi (format: YYYY-MM-DD)." });
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
                attributes: ['email'] // HAPUS 'nama'
            }
        });

        if (hasil.length === 0) {
            return res.status(404).json({ message: "Tidak ada presensi pada tanggal tersebut." });
        }

        res.json({
            message: `Hasil presensi untuk tanggal ${tanggal}`,
            data: hasil,
        });
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
    }
};