const { Presensi, User } = require("../models");
const { format } = require("date-fns-tz");
const { Op } = require("sequelize"); 
const timeZone = "Asia/Jakarta";

exports.CheckIn = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user; 
    const waktuSekarang = new Date();

    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (existingRecord) {
      return res
        .status(400)
        .json({ message: "Anda sudah melakukan check-in hari ini." });
    }

    const newRecord = await Presensi.create({
      userId: userId, 
      checkIn: waktuSekarang,
    });
    
    const dataToResponse = await Presensi.findByPk(newRecord.id, {
        include: { model: User, as: 'user', attributes: ['nama', 'email'] }
    });

    res.status(201).json({
      message: `Halo ${userName}, check-in Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: dataToResponse,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.CheckOut = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();

    const recordToUpdate = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
      include: { model: User, as: 'user', attributes: ['nama', 'email'] }
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
      });
    }

    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    res.json({
      message: `Selamat jalan ${userName}, check-out Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
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
        include: { model: User, as: 'user', attributes: ['nama', 'email'] }
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

exports.searchByNama = async (req, res) => {
  try {
    const { nama } = req.query;
    if (!nama) {
        return res.status(400).json({ message: "Parameter nama harus diisi." });
    }
    
    const hasil = await Presensi.findAll({
      include: [{
        model: User,
        as: 'user',
        where: {
          nama: { [Op.like]: `%${nama}%` }
        },
        attributes: ['nama', 'email'] 
      }],
      attributes: ['id', 'checkIn', 'checkOut', 'userId']
    });
    
    res.json({
      message: `Hasil pencarian untuk nama '${nama}'`,
      data: hasil
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

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
                attributes: ['nama', 'email'] 
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