const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Home Page for API');
});


const bookRoutes = require('./routes/books');
app.use('/api/books', bookRoutes);


// Middleware untuk menangani 404 Not Found
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Endpoint tidak ditemukan'
  });
});

// Global Error Handler
// Middleware ini akan menangkap semua error yang dilempar oleh route handler
app.use((err, req, res, next) => {
  console.error(err.stack); // Log error stack untuk debugging
  res.status(500).json({
    message: 'Terjadi kesalahan pada server',
    error: err.message
  });
});


app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});