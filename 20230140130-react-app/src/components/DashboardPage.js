import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser(decodedToken);
        
        const timer = setInterval(() => {
          setCurrentTime(new Date());
        }, 1000);

        const fakeWeather = {
          temperature: 24,
          condition: 'Cerah',
          humidity: 65
        };
        setWeather(fakeWeather);

        return () => clearInterval(timer);
      } catch (error) {
        console.error("Token tidak valid:", error);
        handleLogout();
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/login'); 
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-400 mx-auto"></div>
          <p className="mt-6 text-slate-300 text-lg">Memuat data...</p>
        </div>
      </div>
    );
  }

  const formatDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const day = days[currentTime.getDay()];
    const date = currentTime.getDate();
    const month = months[currentTime.getMonth()];
    const year = currentTime.getFullYear();
    
    return `${day}, ${date} ${month} ${year}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Card - Dark Minimalist */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-slate-700/50 hover:border-teal-500/50 transition-all duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Selamat Datang 👋
              </h1>
              <p className="text-xl text-slate-300 mb-2">
                {user.email}
              </p>
              <span className="inline-block bg-teal-500/20 text-teal-400 px-4 py-1.5 rounded-lg text-sm font-semibold uppercase tracking-wide border border-teal-500/30">
                {user.role}
              </span>
            </div>
            
            <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30 min-w-[200px]">
              <div className="text-4xl font-bold text-teal-400 mb-2 font-mono">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-slate-400 text-sm mb-3">
                {formatDate()}
              </div>
              {weather && (
                <div className="flex items-center justify-between text-slate-300 bg-slate-600/20 rounded-lg px-3 py-2">
                  <span className="text-xl">☀️</span>
                  <span className="font-semibold">{weather.temperature}°C</span>
                  <span className="text-xs text-slate-400">{weather.condition}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid - Minimalist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Total Aktivitas */}
          <div className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="flex items-center justify-between">
              <div className="bg-blue-500/10 p-3 rounded-lg group-hover:bg-blue-500/20 transition-colors duration-300">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm mb-1">Total Aktivitas</p>
                <p className="text-4xl font-bold text-white">0</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 w-0 group-hover:w-full transition-all duration-1000"></div>
            </div>
          </div>

          {/* Pengguna Online */}
          <div className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-teal-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10">
            <div className="flex items-center justify-between">
              <div className="bg-teal-500/10 p-3 rounded-lg group-hover:bg-teal-500/20 transition-colors duration-300">
                <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm mb-1">Pengguna Online</p>
                <p className="text-4xl font-bold text-white">0</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 w-0 group-hover:w-full transition-all duration-1000"></div>
            </div>
          </div>

          {/* Tugas Selesai */}
          <div className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="flex items-center justify-between">
              <div className="bg-purple-500/10 p-3 rounded-lg group-hover:bg-purple-500/20 transition-colors duration-300">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm mb-1">Tugas Selesai</p>
                <p className="text-4xl font-bold text-white">0%</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 w-0 group-hover:w-full transition-all duration-1000"></div>
            </div>
          </div>

        </div>

        {/* Quick Actions - Minimalist Grid */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-700/50">
          <div className="flex items-center mb-6">
            <div className="bg-teal-500/20 p-2 rounded-lg mr-3">
              <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Aksi Cepat</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Presensi */}
            <button 
              onClick={() => navigate('/presensi')}
              className="group bg-slate-700/30 hover:bg-slate-700/50 rounded-xl p-6 border border-slate-600/30 hover:border-teal-500/50 transition-all duration-300"
            >
              <div className="bg-teal-500/10 group-hover:bg-teal-500/20 p-4 rounded-lg mx-auto w-14 h-14 flex items-center justify-center transition-all duration-300">
                <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="block mt-4 text-slate-300 font-medium text-center group-hover:text-teal-400 transition-colors duration-300">Presensi</span>
            </button>
            
            {/* Laporan */}
            {user.role === 'admin' && (
              <button 
                onClick={() => navigate('/reports')}
                className="group bg-slate-700/30 hover:bg-slate-700/50 rounded-xl p-6 border border-slate-600/30 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="bg-blue-500/10 group-hover:bg-blue-500/20 p-4 rounded-lg mx-auto w-14 h-14 flex items-center justify-center transition-all duration-300">
                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="block mt-4 text-slate-300 font-medium text-center group-hover:text-blue-400 transition-colors duration-300">Laporan</span>
              </button>
            )}

            {/* Pengaturan */}
            <button className="group bg-slate-700/30 hover:bg-slate-700/50 rounded-xl p-6 border border-slate-600/30 hover:border-purple-500/50 transition-all duration-300">
              <div className="bg-purple-500/10 group-hover:bg-purple-500/20 p-4 rounded-lg mx-auto w-14 h-14 flex items-center justify-center transition-all duration-300">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="block mt-4 text-slate-300 font-medium text-center group-hover:text-purple-400 transition-colors duration-300">Pengaturan</span>
            </button>

            {/* Profile */}
            <button className="group bg-slate-700/30 hover:bg-slate-700/50 rounded-xl p-6 border border-slate-600/30 hover:border-amber-500/50 transition-all duration-300">
              <div className="bg-amber-500/10 group-hover:bg-amber-500/20 p-4 rounded-lg mx-auto w-14 h-14 flex items-center justify-center transition-all duration-300">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="block mt-4 text-slate-300 font-medium text-center group-hover:text-amber-400 transition-colors duration-300">Profile</span>
            </button>

          </div>
        </div>

      </main>
    </div>
  );
}

export default DashboardPage;