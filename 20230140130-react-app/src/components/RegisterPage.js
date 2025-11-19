import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // <-- Tambahkan Link

function RegisterPage() {
  // Buat state untuk semua field yang diperlukan
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('mahasiswa'); // Default role 
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // State untuk pesan sukses
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Kirim data ke endpoint register 
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        nama: nama,
        email: email,
        password: password,
        role: role
      });

      // Tampilkan pesan sukses
      setSuccess('Registrasi berhasil! Anda akan diarahkan ke halaman login.');

      // Arahkan ke halaman login setelah 2 detik 
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      // Tangani error (misal: email sudah terdaftar)
      setError(err.response ? err.response.data.message : 'Registrasi gagal');
    }
  };

  return (
    // Gunakan styling Tailwind yang mirip dengan LoginPage
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Register
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Field untuk Nama */}
          <div>
            <label 
              htmlFor="nama" 
              className="block text-sm font-medium text-gray-700"
            >
              Nama Lengkap:
            </label>
            <input
              id="nama"
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Field untuk Email */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              Email:
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Field untuk Password */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Password:
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Field untuk Role (Dropdown)  */}
          <div>
            <label 
              htmlFor="role" 
              className="block text-sm font-medium text-gray-700"
            >
              Role:
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="mahasiswa">Mahasiswa</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700"
          >
            Register
          </button>
        </form>

        {/* Tampilkan pesan Error atau Sukses */}
        {error && (
          <p className="text-red-600 text-sm mt-4 text-center">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-sm mt-4 text-center">{success}</p>
        )}

        <p className="text-sm text-center text-gray-600 mt-4">
          Sudah punya akun? 
          <Link to="/login" className="text-blue-600 hover:underline ml-1">
            Login di sini
          </Link>
        </p>

      </div>
    </div>
  );
}

export default RegisterPage;