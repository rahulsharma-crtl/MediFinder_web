import React, { useState, useEffect } from 'react';
import { authService, reservationService, medicineService } from '../services/api';
import { PharmacyOwnerDashboard } from './PharmacyOwnerDashboard';
import { motion, AnimatePresence } from 'framer-motion';

export const PharmacyOwnerPage: React.FC = () => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [pharmacy, setPharmacy] = useState<any>(null);
    const [reservations, setReservations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [ownerId, setOwnerId] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            // In a real app, we'd have a /me endpoint
            const resData = await reservationService.getPharmacyReservations();
            setReservations(resData.data);

            // Mock pharmacy data for dashboard since we don't have /me yet
            const stored = localStorage.getItem('pharmacy');
            if (stored) setPharmacy(JSON.parse(stored));
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            handleLogout();
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await authService.login({ ownerId, password });
            const { token, pharmacy } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('pharmacy', JSON.stringify(pharmacy));
            setToken(token);
            setPharmacy(pharmacy);
        } catch (error) {
            alert('Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('pharmacy');
        setToken(null);
        setPharmacy(null);
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await reservationService.updateStatus(id, status);
            fetchDashboardData();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    if (!token) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto glass-card p-10 mt-12"
            >
                <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight text-center">OWNER LOGIN</h1>
                <p className="text-slate-500 text-center mb-10 text-xs font-bold tracking-widest uppercase">Manage your pharmacy & inventory</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Owner ID</label>
                        <input
                            type="text"
                            value={ownerId}
                            onChange={(e) => setOwnerId(e.target.value)}
                            className="w-full h-14 px-4 glass-input rounded-xl"
                            placeholder="PH-12345"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-14 px-4 glass-input rounded-xl"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-16 bg-teal-500 text-white font-black rounded-2xl shadow-xl shadow-teal-500/20 hover:bg-teal-400 transition-all uppercase tracking-widest mt-4"
                    >
                        {isLoading ? 'SECURE LOGGING...' : 'ACCESS DASHBOARD'}
                    </button>
                    <p className="text-[10px] text-slate-600 text-center uppercase font-bold tracking-tighter mt-4">
                        Secure 256-bit encrypted session
                    </p>
                </form>
            </motion.div>
        );
    }

    return (
        <div className="py-8">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase">{pharmacy?.name || 'DASHBOARD'}</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Pharamcy Management System</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="h-12 px-6 bg-slate-800 text-slate-400 hover:text-white font-black text-xs tracking-widest uppercase rounded-xl border border-slate-700 transition-all"
                >
                    LOGOUT
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Incoming Reservations</h2>
                        <span className="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-lg text-[10px] font-black tracking-widest">{reservations.length} ACTIVE</span>
                    </div>

                    {reservations.length === 0 ? (
                        <div className="glass-card p-20 text-center border-dashed border-slate-700">
                            <p className="text-slate-500 font-bold uppercase tracking-widest">No active reservations at the moment</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {reservations.map((res: any) => (
                                <motion.div
                                    key={res._id}
                                    layout
                                    className="glass-card p-6 border-l-4 border-l-teal-500"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Medicine Requested</p>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight">{res.medicineId?.name || 'Unknown'}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-md border ${res.status === 'Pending' ? 'text-amber-400 border-amber-400/20 bg-amber-400/10' :
                                                    res.status === 'Confirmed' ? 'text-teal-400 border-teal-400/20 bg-teal-400/10' : 'text-slate-500 border-slate-700 bg-slate-800/50'
                                                }`}>
                                                {res.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Customer</p>
                                            <p className="text-white font-bold text-sm tracking-tight">{res.customerName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Phone</p>
                                            <p className="text-teal-400 font-black text-sm tracking-tighter">{res.customerPhone}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {res.status === 'Pending' && (
                                            <button
                                                onClick={() => handleUpdateStatus(res._id, 'Confirmed')}
                                                className="flex-1 h-12 bg-teal-500 text-white font-black text-xs tracking-widest rounded-lg"
                                            >
                                                CONFIRM
                                            </button>
                                        )}
                                        {res.status === 'Confirmed' && (
                                            <button
                                                onClick={() => handleUpdateStatus(res._id, 'PickedUp')}
                                                className="flex-1 h-12 bg-emerald-500 text-white font-black text-xs tracking-widest rounded-lg"
                                            >
                                                PICKED UP
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleUpdateStatus(res._id, 'Cancelled')}
                                            className="h-12 px-4 bg-slate-800 text-rose-500/50 hover:text-rose-500 font-black text-xs tracking-widest rounded-lg border border-slate-700 transition-all"
                                        >
                                            X
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};
