const { Presensi, User } = require("../models");
const { Op } = require("sequelize"); 

exports.getDailyReport = async (req, res) => {
  try {
    const { email, startDate, endDate } = req.query;

    // Build query conditions
    let wherePresensi = {};
    let whereUser = {};

    // Filter by email if provided
    if (email) {
      whereUser.email = { [Op.like]: `%${email}%` };
    }

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00.000Z`);
      const end = new Date(`${endDate}T23:59:59.999Z`);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ 
          message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD." 
        });
      }
      
      wherePresensi.checkIn = { [Op.between]: [start, end] };
    } else if (startDate) {
      const start = new Date(`${startDate}T00:00:00.000Z`);
      const end = new Date(`${startDate}T23:59:59.999Z`);
      
      if (isNaN(start.getTime())) {
        return res.status(400).json({ 
          message: "Format tanggal mulai tidak valid. Gunakan YYYY-MM-DD." 
        });
      }
      
      wherePresensi.checkIn = { [Op.between]: [start, end] };
    } else if (endDate) {
      const end = new Date(`${endDate}T23:59:59.999Z`);
      
      if (isNaN(end.getTime())) {
        return res.status(400).json({ 
          message: "Format tanggal selesai tidak valid. Gunakan YYYY-MM-DD." 
        });
      }
      
      wherePresensi.checkIn = { [Op.lte]: end };
    }

    // Fetch data with filters
    const records = await Presensi.findAll({ 
      where: wherePresensi,
      include: [{
        model: User,
        as: 'user',
        where: Object.keys(whereUser).length > 0 ? whereUser : undefined,
        attributes: ['id', 'email', 'role'],
        required: Object.keys(whereUser).length > 0 // INNER JOIN jika ada filter email
      }],
      order: [['checkIn', 'DESC']]
    });

    res.json({
      message: records.length > 0 
        ? `Ditemukan ${records.length} data presensi` 
        : "Tidak ada data presensi ditemukan",
      reportDate: new Date().toLocaleDateString('id-ID'),
      data: records,
    });

  } catch (error) {
    console.error("Error in getDailyReport:", error);
    res.status(500).json({ 
      message: "Gagal mengambil laporan", 
      error: error.message 
    });
  }
};