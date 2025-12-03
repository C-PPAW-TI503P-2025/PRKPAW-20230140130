import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// IMPORT STANDAR (Gunakan ini untuk project di VS Code)
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Icon Marker Leaflet yang suka hilang di React
// Mengambil gambar langsung dari folder node_modules
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
  const [coords, setCoords] = useState(null); // State untuk menyimpan lokasi {lat, lng}
  const navigate = useNavigate();

  // Helper untuk ambil token auth
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

  // Fungsi untuk mendapatkan lokasi GPS pengguna
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          setError("Gagal mendapatkan lokasi: " + err.message);
        }
      );
    } else {
      setError("Geolocation tidak didukung oleh browser ini.");
    }
  };

  // Ambil lokasi otomatis saat halaman dibuka
  useEffect(() => {
    getLocation();
  }, []);

  const handleCheckIn = async () => {
    const config = getAuthConfig();
    if (!config) return;

    // Validasi: Lokasi harus ada sebelum check-in
    if (!coords) {
        setError("Lokasi belum ditemukan. Pastikan GPS aktif dan izinkan akses lokasi.");
        return;
    }

    setMessage('');
    setError('');

    try {
      // Kirim latitude & longitude ke Backend
      const response = await axios.post(`${API_URL}/check-in`, {
        latitude: coords.lat,
        longitude: coords.lng
      }, config);
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response ? err.response.data.message : "Check-In gagal!");
    }
  };

  const handleCheckOut = async () => {
    const config = getAuthConfig();
    if (!config) return;
    
    setMessage('');
    setError('');

    try {
      const response = await axios.put(`${API_URL}/check-out`, {}, config);
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response ? err.response.data.message : "Check-Out gagal!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Lakukan Presensi
        </h2>

        {/* AREA PETA (MAPS) */}
        {coords ? (
            <div className="mb-6 rounded-lg overflow-hidden border border-gray-300 h-64 w-full relative z-0">
                <MapContainer center={[coords.lat, coords.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
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
            <div className="mb-6 p-4 bg-yellow-50 text-yellow-700 rounded-lg">
                <p>Sedang mencari lokasi...</p>
                <button 
                    onClick={getLocation} 
                    className="mt-2 underline text-blue-600 hover:text-blue-800 text-sm"
                >
                    Coba lagi
                </button>
            </div>
        )}

        {message && <p className="text-green-600 mb-4 font-semibold">{message}</p>}
        {error && <p className="text-red-600 mb-4 font-semibold">{error}</p>}

        <div className="flex space-x-4">
          <button
            onClick={handleCheckIn}
            className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 transition duration-200"
          >
            Check-In
          </button>

          <button
            onClick={handleCheckOut}
            className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-red-700 transition duration-200"
          >
            Check-Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default AttendancePage;