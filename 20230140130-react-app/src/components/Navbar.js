import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Navbar() {
    const [user, setUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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

    const isActive = (path) => {
        return location.pathname === path;
    };

    // Don't show navbar on login/register pages
    if (location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    return (
        <nav className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    
                    {/* Logo & Brand */}
                    <div className="flex items-center space-x-8">
                        <Link 
                            to="/dashboard" 
                            className="flex items-center space-x-3 group"
                        >
                            <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors duration-300">
                                PresensiApp
                            </span>
                        </Link>
                        
                        {/* Desktop Navigation */}
                        {user && (
                            <div className="hidden md:flex items-center space-x-1">
                                <Link 
                                    to="/dashboard" 
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                                        isActive('/dashboard') 
                                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
                                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span>Dashboard</span>
                                </Link>
                                
                                <Link 
                                    to="/presensi" 
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                                        isActive('/presensi') 
                                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
                                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    <span>Presensi</span>
                                </Link>
                                
                                {user.role === 'admin' && (
                                    <Link 
                                        to="/reports" 
                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                                            isActive('/reports') 
                                                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
                                                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>Laporan</span>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                {/* User Info - Desktop */}
                                <div className="hidden md:flex items-center space-x-3 bg-slate-700/30 px-4 py-2 rounded-lg border border-slate-600/30">
                                    <div className="bg-teal-500/20 p-2 rounded-lg">
                                        <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm text-white font-medium truncate max-w-[150px]">
                                            {user.email}
                                        </p>
                                        <p className="text-xs text-teal-400 font-semibold uppercase">
                                            {user.role}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Logout Button - Desktop */}
                                <button 
                                    onClick={handleLogout}
                                    className="hidden md:flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Logout</span>
                                </button>

                                {/* Mobile Menu Button */}
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {isMobileMenuOpen ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        )}
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <div className="flex space-x-3">
                                <Link 
                                    to="/login" 
                                    className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-all duration-300"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                {user && isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-700/50 space-y-2">
                        {/* User Info Mobile */}
                        <div className="flex items-center space-x-3 bg-slate-700/30 px-4 py-3 rounded-lg border border-slate-600/30 mb-3">
                            <div className="bg-teal-500/20 p-2 rounded-lg">
                                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-white font-medium">{user.email}</p>
                                <p className="text-xs text-teal-400 font-semibold uppercase">{user.role}</p>
                            </div>
                        </div>

                        <Link 
                            to="/dashboard" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                                isActive('/dashboard') 
                                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
                                    : 'text-slate-300 hover:bg-slate-700/50'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Dashboard</span>
                        </Link>
                        
                        <Link 
                            to="/presensi" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                                isActive('/presensi') 
                                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
                                    : 'text-slate-300 hover:bg-slate-700/50'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <span>Presensi</span>
                        </Link>
                        
                        {user.role === 'admin' && (
                            <Link 
                                to="/reports" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                                    isActive('/reports') 
                                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
                                        : 'text-slate-300 hover:bg-slate-700/50'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Laporan</span>
                            </Link>
                        )}

                        <button 
                            onClick={() => {
                                handleLogout();
                                setIsMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-semibold transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;