const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;
const morgan = require("morgan");

// Impor router
const presensiRoutes = require("./routes/presensi.js");
const reportRoutes = require("./routes/reports.js");

const authRoutes = require('./routes/auth.js');

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Home Page for API");
});

const ruteBuku = require("./routes/books");
app.use("/api/books", ruteBuku);
app.use("/api/presensi", presensiRoutes);
app.use("/api/reports", reportRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});