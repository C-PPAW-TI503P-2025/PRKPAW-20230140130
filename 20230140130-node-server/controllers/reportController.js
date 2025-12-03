const { Presensi, User } = require("../models");
const { Op } = require("sequelize"); 

exports.getDailyReport = async (req, res) => {
  try {
    const { email, tanggalMulai, tanggalSelesai } = req.query; // GANTI nama jadi email
    let wherePresensi = {};
    let whereUser = {};

    // GANTI pencarian berdasarkan email
    if (email) {
      whereUser.email = { [Op.like]: `%${email}%` };
    }

    if (tanggalMulai) {
      const startString = `${tanggalMulai} 00:00:00`;
      const dateStart = new Date(startString); 
      
      if (isNaN(dateStart.getTime())) {
        return res.status(400).json({ message: "Format tanggalMulai tidak valid. Gunakan YYYY-MM-DD." });
      }

      let dateEnd;
      if (tanggalSelesai) {
        const endString = `${tanggalSelesai} 23:59:59.999`;
        dateEnd = new Date(endString);
        
        if (isNaN(dateEnd.getTime())) {
          return res.status(400).json({ message: "Format tanggalSelesai tidak valid. Gunakan YYYY-MM-DD." });
        }
      } else {
        const endString = `${tanggalMulai} 23:59:59.999`;
        dateEnd = new Date(endString);
      }
      
      wherePresensi.checkIn = { [Op.between]: [dateStart, dateEnd] };
    }

    const records = await Presensi.findAll({ 
      where: wherePresensi,
      include: [{
        model: User,
        as: 'user',
        where: whereUser,
        attributes: ['email'] // HAPUS 'nama'
      }]
    });

    res.json({
      reportDate: new Date().toLocaleDateString(),
      data: records,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil laporan", error: error.message });
  }
};