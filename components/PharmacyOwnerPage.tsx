import React, { useState, useEffect } from 'react';
import { authService, reservationService } from '../services/api';
import { PharmacyOwnerDashboard } from './PharmacyOwnerDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { reverseGeocode } from '../services/geminiService';
import { MapPinIcon } from './icons';

export const PharmacyOwnerPage: React.FC = () => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [pharmacy, setPharmacy] = useState<any>(null);
    const [reservations, setReservations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form fields
    const [phone, setPhone] = useState('');
    const [pharmacyName, setPharmacyName] = useState('');
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState<{ lat: number, lon: number } | null>(null);
    const [showRegisterFields, setShowRegisterFields] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    useEffect(() => {
        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const resData = await reservationService.getPharmacyReservations();
            setReservations(resData.data);

            const stored = localStorage.getItem('pharmacy');
            if (stored) setPharmacy(JSON.parse(stored));
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            handleLogout();
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckPhone = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await authService.loginByPhone(phone);
            const { token, pharmacy: authPharmacy } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('pharmacy', JSON.stringify(authPharmacy));
            setToken(token);
            setPharmacy(authPharmacy);
        } catch (error: any) {
            if (error.response?.status === 404) {
                setShowRegisterFields(true);
            } else {
                alert(error.response?.data?.message || 'Error checking phone number.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location) {
            alert("Please get your current location first.");
            return;
        }
        setIsLoading(true);
        try {
            const response = await authService.register({
                name: pharmacyName,
                address,
                contact: phone,
                location,
                operatingHours: '9 AM - 9 PM'
            });

            const { token, pharmacy: authPharmacy } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('pharmacy', JSON.stringify(authPharmacy));
            setToken(token);
            setPharmacy(authPharmacy);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numericValue = e.target.value.replace(/[^0-9]/g, '');
        if (numericValue.length <= 10) {
            setPhone(numericValue);
        }
    };

    const handleGetLocation = () => {
        setIsFetchingLocation(true);
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            setIsFetchingLocation(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({
                    lat: latitude,
                    lon: longitude
                });

                try {
                    const fetchedAddress = await reverseGeocode(latitude, longitude);
                    setAddress(fetchedAddress);
                } catch (error) {
                    console.error('Could determine address:', error);
                } finally {
                    setIsFetchingLocation(false);
                }
            },
            (error) => {
                alert('Could not get your location. Please enable location services.');
                setIsFetchingLocation(false);
            }
        );
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('pharmacy');
        setToken(null);
        setPharmacy(null);
        setShowRegisterFields(false);
        setPhone('');
        setPharmacyName('');
        setAddress('');
        setLocation(null);
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
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto py-12"
            >
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Welcome, Pharmacy Owner
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Please enter your pharmacy details to manage your inventory and connect with customers.
                    </p>
                </div>

                <div className="bg-[#1a1a1a] p-10 rounded-3xl shadow-2xl border border-white/5">
                    {!showRegisterFields ? (
                        <form onSubmit={handleCheckPhone} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    className="w-full h-14 px-5 bg-[#0f0f0f] border border-white/10 rounded-xl text-white focus:border-teal-500/50 transition-all outline-none"
                                    placeholder="Enter 10-digit number"
                                    required
                                    maxLength={10}
                                    pattern="\d{10}"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-900/20"
                            >
                                {isLoading ? 'Checking...' : 'Continue'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Pharmacy Name</label>
                                <input
                                    type="text"
                                    value={pharmacyName}
                                    onChange={(e) => setPharmacyName(e.target.value)}
                                    className="w-full h-14 px-5 bg-[#0f0f0f] border border-white/10 rounded-xl text-white focus:border-teal-500/50 transition-all outline-none"
                                    placeholder="e.g., Apollo Pharmacy"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    readOnly
                                    className="w-full h-14 px-5 bg-[#0f0f0f]/50 border border-white/5 rounded-xl text-slate-500 outline-none"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <label className="text-sm font-semibold text-slate-300">Full Address</label>
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        disabled={isFetchingLocation}
                                        className="text-teal-400 hover:text-teal-300 text-xs font-bold flex items-center gap-1 transition-colors"
                                    >
                                        <MapPinIcon className="h-3.5 w-3.5" />
                                        {isFetchingLocation ? 'Determining Location...' : 'Use My Current Location'}
                                    </button>
                                </div>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full h-32 p-5 bg-[#0f0f0f] border border-white/10 rounded-xl text-white focus:border-teal-500/50 transition-all outline-none resize-none"
                                    placeholder="Enter your pharmacy's full address"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !location}
                                className="w-full h-14 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-900/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Registering...' : 'Complete Profile'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowRegisterFields(false)}
                                className="w-full text-slate-500 hover:text-slate-300 text-sm font-semibold transition-colors"
                            >
                                Back to Login
                            </button>
                        </form>
                    )}
                </div>
            </motion.div >
        );
    }

    return (
        <div className="py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">{pharmacy?.name || 'Dashboard'}</h1>
                    <p className="text-slate-500 text-sm font-medium">Pharmacy Management Portal</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="h-12 px-6 bg-[#1a1a1a] text-slate-300 hover:text-white font-bold text-sm rounded-xl border border-white/5 transition-all"
                >
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 gap-12">
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white">Active Reservations</h2>
                        <span className="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-lg text-xs font-bold">{reservations.length} Orders</span>
                    </div>

                    {reservations.length === 0 ? (
                        <div className="bg-[#1a1a1a] p-20 text-center rounded-3xl border border-dashed border-white/10">
                            <p className="text-slate-500 font-medium">No active reservations at the moment</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reservations.map((res: any) => (
                                <motion.div
                                    key={res._id}
                                    layout
                                    className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/5"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Medicine</p>
                                            <h3 className="text-xl font-bold text-white">{res.medicineId?.name || 'Unknown'}</h3>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${res.status === 'Pending' ? 'text-amber-400 border-amber-400/20 bg-amber-400/10' :
                                                res.status === 'Confirmed' ? 'text-teal-400 border-teal-400/20 bg-teal-400/10' : 'text-slate-500 border-slate-700 bg-slate-800/50'
                                                }`}>
                                                {res.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Customer</span>
                                            <span className="text-white font-semibold">{res.customerName}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Contact</span>
                                            <span className="text-teal-400 font-bold">{res.customerPhone}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {res.status === 'Pending' && (
                                            <button
                                                onClick={() => handleUpdateStatus(res._id, 'Confirmed')}
                                                className="flex-1 h-12 bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm rounded-xl transition-all"
                                            >
                                                Confirm
                                            </button>
                                        )}
                                        {res.status === 'Confirmed' && (
                                            <button
                                                onClick={() => handleUpdateStatus(res._id, 'PickedUp')}
                                                className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded-xl transition-all"
                                            >
                                                Mark Picked Up
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleUpdateStatus(res._id, 'Cancelled')}
                                            className="h-12 px-4 bg-white/5 text-slate-500 hover:text-rose-500 rounded-xl transition-all"
                                        >
                                            Cancel
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
