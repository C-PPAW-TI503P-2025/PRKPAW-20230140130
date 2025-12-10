import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import { id } from 'date-fns/locale';

const API_URL = "http://localhost:3001/api/reports";
const UPLOADS_BASE_URL = "http://localhost:3001/";

// Komponen Modal untuk menampilkan foto ukuran penuh
const PhotoModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-700"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                        <svg className="w-5 h-5 mr-2 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Foto Presensi
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4">
                    <img src={imageUrl} alt="Bukti Presensi" className="w-full h-auto rounded-xl" />
                </div>
            </div>
        </div>
    );
};

function ReportPage() {
    const [reports, setReports] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalData, setTotalData] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const getToken = () => localStorage.getItem("token");

    const getAuthConfig = useCallback(() => {
        const token = getToken();
        if (!token) {
            navigate("/login");
            return null;
        }
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }, [navigate]);

    const openPhotoModal = (buktiFotoPath) => {
        const fullUrl = UPLOADS_BASE_URL + buktiFotoPath;
        setModalImageUrl(fullUrl);
        setIsModalOpen(true);
    };

    const closePhotoModal = () => {
        setIsModalOpen(false);
        setModalImageUrl('');
    };

    const fetchReports = useCallback(async (query = {}) => {
        const config = getAuthConfig();
        if (!config) return;

        setIsLoading(true);
        try {
            setMessage('');
            setError('');
            
            const queryString = new URLSearchParams(query).toString();
            const response = await axios.get(`${API_URL}/daily?${queryString}`, config); 
            
            setReports(response.data.data);
            setTotalData(response.data.data.length);
            setMessage(response.data.message || "Data laporan berhasil dimuat.");
            
        } catch (err) {
            setError(err.response ? err.response.data.message : "Gagal memuat data laporan.");
            setReports([]);
            setTotalData(0);
        } finally {
            setIsLoading(false);
        }
    }, [getAuthConfig]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleSearch = (e) => {
        e.preventDefault();
        
        const query = {};
        if (searchEmail) query.email = searchEmail;
        if (startDate) query.startDate = startDate; 
        if (endDate) query.endDate = endDate;
        
        fetchReports(query);
    };

    const handleReset = () => {
        setSearchEmail('');
        setStartDate('');
        setEndDate('');
        fetchReports();
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = parseISO(dateString);
        return isValid(date) ? format(date, 'd MMM yyyy', { locale: id }) : '-';
    };

    const formatTime = (dateString) => {
        if (!dateString) return "-";
        const date = parseISO(dateString);
        return isValid(date) ? format(date, 'HH:mm:ss') : '-';
    };

    const getThumbnailUrl = (path) => {
        if (!path) return null;
        return UPLOADS_BASE_URL + path;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Laporan Presensi Harian</h1>
                    <p className="text-slate-400">Kelola dan pantau data presensi karyawan</p>
                </div>

                {/* Filter Card */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-slate-700/50">
                    <div className="flex items-center mb-4">
                        <svg className="w-5 h-5 text-teal-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-white">Filter Pencarian</h3>
                    </div>
                    
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    placeholder="cari@email.com"
                                    value={searchEmail}
                                    onChange={(e) => setSearchEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Tanggal Mulai</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Tanggal Selesai</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {isLoading ? 'Mencari...' : 'Cari'}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={isLoading}
                                className="flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Notifications */}
                {message && (
                    <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4 mb-6">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-teal-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-teal-400 text-sm">{message}</p>
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Stats Bar */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-teal-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-slate-300 font-medium">Total Data:</span>
                        <span className="ml-2 text-2xl font-bold text-teal-400">{totalData}</span>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-700/30">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Check-In</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Check-Out</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">Foto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400 mb-4"></div>
                                                <p className="text-slate-400">Memuat data...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : reports.length > 0 ? (
                                    reports.map((report, index) => (
                                        <tr key={report.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                                {formatDate(report.checkIn)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                                {report.user ? report.user.email : "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-teal-500/20 text-teal-400 border border-teal-500/30">
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {formatTime(report.checkIn)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {report.checkOut ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatTime(report.checkOut)}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-slate-700 text-slate-400">
                                                        Belum Check-Out
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {report.buktiFoto ? (
                                                    <button
                                                        onClick={() => openPhotoModal(report.buktiFoto)}
                                                        className="inline-block p-1 border-2 border-slate-600 hover:border-teal-500 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20"
                                                    >
                                                        <img 
                                                            src={getThumbnailUrl(report.buktiFoto)} 
                                                            alt="Bukti Foto" 
                                                            className="w-12 h-12 object-cover rounded-md"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/48x48/1e293b/64748b?text=N/A" }}
                                                        />
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-500 text-xs">No Photo</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p className="text-slate-400 text-lg">Tidak ada data laporan</p>
                                                <p className="text-slate-500 text-sm mt-1">Coba ubah filter pencarian Anda</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
            
            {/* Photo Modal */}
            {isModalOpen && (
                <PhotoModal 
                    imageUrl={modalImageUrl} 
                    onClose={closePhotoModal} 
                />
            )}
        </div>
    );
}

export default ReportPage;