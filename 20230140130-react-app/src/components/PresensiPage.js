import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Webcam from 'react-webcam';

// IMPORT STANDAR UNTUK LEAFLET MAP
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Icon Marker Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = "http://localhost:3001/api/presensi"; 

function AttendancePage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [coords, setCoords] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- LOGIKA KAMERA ---
  const [image, setImage] = useState(null);
  const webcamRef = useRef(null);

  // Fungsi untuk mengambil gambar (capture)
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot(); 
    setImage(imageSrc);
    setError('');
  }, [webcamRef]);

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return null;
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setError('');
        },
        (err) => {
          setError("Gagal mendapatkan lokasi: " + err.message);
        }
      );
    } else {
      setError("Geolocation tidak didukung oleh browser ini.");
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleCheckIn = async () => {
    const config = getAuthConfig();
    if (!config) return;

    if (!coords) {
        setError("Lokasi belum tersedia! Mohon aktifkan GPS Anda.");
        return;
    }

    if (!image) {
        setError("Foto selfie wajib diambil sebelum Check-In!");
        return;
    }

    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const blob = await (await fetch(image)).blob();

      if (blob.size > 5 * 1024 * 1024) {
        setError("Ukuran foto terlalu besar! Maksimal 5MB");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('latitude', coords.lat); 
      formData.append('longitude', coords.lng); 
      formData.append('image', blob, 'selfie.jpg'); 
      
      const response = await axios.post(
        `${API_URL}/check-in`,
        formData,
        config
      );

      setMessage(response.data.message);
      setImage(null);
      
    } catch (err) {
      if (err.response?.status === 413) {
        setError("Ukuran file terlalu besar!");
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || "Data yang dikirim tidak valid!");
      } else {
        setError(err.response ? err.response.data.message : "Check-In gagal! Periksa koneksi Anda.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    const config = getAuthConfig();
    if (!config) return;
    
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.put(`${API_URL}/check-out`, {}, config);
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response ? err.response.data.message : "Check-Out gagal!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Lakukan Presensi</h1>
          <p className="text-slate-400">Ambil foto selfie dan pastikan lokasi GPS aktif</p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
          
          {/* Camera Section */}
          <div className="p-6">
            <div className="relative rounded-xl overflow-hidden bg-slate-900 border-2 border-slate-700/50 mb-4">
              {image ? (
                <div className="relative">
                  <img src={image} alt="Selfie" className="w-full" />
                  <div className="absolute top-4 right-4 bg-teal-500/20 backdrop-blur-sm border border-teal-500/50 text-teal-400 px-3 py-1 rounded-lg text-sm font-semibold">
                    ✓ Foto Tersimpan
                  </div>
                </div>
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full"
                  videoConstraints={{
                    facingMode: "user"
                  }}
                />
              )}
            </div>
            
            {/* Camera Control Button */}
            <div className="mb-6">
              {!image ? (
                <button 
                  onClick={capture} 
                  disabled={isLoading}
                  className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Ambil Foto Selfie</span>
                </button> 
              ) : (
                <button 
                  onClick={() => setImage(null)} 
                  disabled={isLoading}
                  className="w-full bg-slate-700 hover:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Foto Ulang</span>
                </button>
              )}
            </div>

            {/* Location Section */}
            {coords ? (
              <div className="rounded-xl overflow-hidden border-2 border-slate-700/50 h-64 mb-6">
                <MapContainer 
                  center={[coords.lat, coords.lng]} 
                  zoom={15} 
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <Marker position={[coords.lat, coords.lng]}>
                    <Popup>Lokasi Anda Saat Ini</Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-amber-400 font-semibold mb-1">Sedang mencari lokasi...</p>
                    <p className="text-amber-300/80 text-sm mb-2">Pastikan GPS Anda aktif</p>
                    <button 
                      onClick={getLocation} 
                      className="text-amber-400 hover:text-amber-300 text-sm font-medium underline"
                    >
                      Coba lagi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Messages */}
            {message && (
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-teal-400 font-medium">{message}</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleCheckIn}
                disabled={isLoading || !coords || !image}
                className={`py-4 px-6 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                  isLoading || !coords || !image
                    ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                    : 'bg-teal-500 hover:bg-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Check-In</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCheckOut}
                disabled={isLoading}
                className={`py-4 px-6 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                  isLoading
                    ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white hover:shadow-lg hover:shadow-red-500/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Check-Out</span>
                  </>
                )}
              </button>
            </div>

            {/* Info Tips */}
            <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-blue-400 text-sm font-medium mb-1">Tips Presensi</p>
                  <p className="text-blue-300/80 text-xs">
                    Pastikan foto selfie Anda jelas dan lokasi GPS aktif sebelum melakukan check-in.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendancePage;