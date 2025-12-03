import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser(decodedToken);
            } catch (error) {
                console.error("Token tidak valid");
                handleLogout();
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const renderAuthButtons = user ? (
        <div className="flex items-center space-x-4">
            <span className="text-gray-700 text-sm hidden sm:inline">
                Halo, <b className="text-blue-600">{user.email}</b> ({user.role}) {/* GANTI user.nama jadi user.email */}
            </span>
            <button 
                onClick={handleLogout}
                className="py-1 px-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
            >
                Logout
            </button>
        </div>
    ) : (
        <div className="flex space-x-4">
            <Link to="/login" className="text-blue-600 hover:text-blue-800">Login</Link>
            <Link to="/register" className="text-blue-600 hover:text-blue-800">Register</Link>
        </div>
    );

    return (
        <nav className="bg-white shadow-md border-b sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-3">
                    <div className="flex items-center space-x-6">
                        <Link to="/dashboard" className="text-xl font-bold text-gray-800 hover:text-blue-600">
                            PresensiApp
                        </Link>
                        
                        {user && (
                            <>
                                <Link to="/presensi" className="text-gray-600 hover:text-blue-600 transition duration-200">
                                    Presensi
                                </Link>
                                
                                {user.role === 'admin' && (
                                    <Link to="/reports" className="text-gray-600 hover:text-blue-600 transition duration-200 font-semibold">
                                        Laporan Admin
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                    {renderAuthButtons}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;