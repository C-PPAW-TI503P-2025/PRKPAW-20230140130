import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardPage from './components/DashboardPage';
import AttendancePage from './components/PresensiPage'; // Halaman Presensi
import ReportPage from './components/ReportPage';     // Halaman Laporan 
import Navbar from './components/Navbar'; 

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar /> 
        <Routes>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/presensi" element={<AttendancePage />} /> 
          <Route path="/reports" element={<ReportPage />} /> 
          <Route path="/" element={<DashboardPage />} /> 
        </Routes>
      </div>
    </Router>
  );
}
export default App;