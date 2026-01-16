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
        console.log("Checking phone number:", phone);
        try {
            const response = await authService.loginByPhone(phone);
            console.log("Phone check success:", response.data);
            const { token, pharmacy: authPharmacy } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('pharmacy', JSON.stringify(authPharmacy));
            setToken(token);
            setPharmacy(authPharmacy);
        } catch (error: any) {
            console.error("Phone check error details:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                config: error.config
            });
            if (error.response?.status === 404) {
                setShowRegisterFields(true);
            } else {
                const errorMsg = error.response?.data?.message || error.message || 'Error checking phone number.';
                alert(`Error: ${errorMsg}. Check console for details.`);
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
                    <h1 className="text-5xl font-black text-white mb-4">
                        Welcome, Pharmacy Owner
                    </h1>
                    <p className="text-slate-300 text-lg font-medium">
                        Please enter your pharmacy details to manage your inventory.
                    </p>
                </div>

                <div className="bg-[#262626] p-10 rounded-3xl shadow-2xl border border-white/10">
                    {!showRegisterFields ? (
                        <form onSubmit={handleCheckPhone} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-2 ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    className="w-full h-16 px-5 bg-[#0f0f0f] border border-white/20 rounded-xl text-white focus:border-accent-teal transition-all outline-none text-lg"
                                    placeholder="Enter 10-digit number"
                                    required
                                    maxLength={10}
                                    pattern="\d{10}"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-16 btn-primary active:scale-[0.98]"
                            >
                                {isLoading ? 'Checking...' : 'Continue to Dashboard'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-2 ml-1">Pharmacy Name</label>
                                <input
                                    type="text"
                                    value={pharmacyName}
                                    onChange={(e) => setPharmacyName(e.target.value)}
                                    className="w-full h-16 px-5 bg-[#0f0f0f] border border-white/20 rounded-xl text-white focus:border-accent-teal transition-all outline-none text-lg"
                                    placeholder="e.g., Apollo Pharmacy"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-2 ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    readOnly
                                    className="w-full h-16 px-5 bg-[#0f0f0f]/50 border border-white/5 rounded-xl text-slate-500 outline-none text-lg"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <label className="text-sm font-bold text-slate-200">Full Address</label>
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        disabled={isFetchingLocation}
                                        className="text-accent-teal-vibrant hover:text-white text-sm font-black flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer"
                                    >
                                        <MapPinIcon className="h-4 w-4" />
                                        {isFetchingLocation ? 'Fetching...' : 'Use Current Location'}
                                    </button>
                                </div>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full h-32 p-5 bg-[#0f0f0f] border border-white/20 rounded-xl text-white focus:border-accent-teal transition-all outline-none resize-none text-lg"
                                    placeholder="Enter full address"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !location}
                                className="w-full h-16 btn-primary active:scale-[0.98] disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
                            >
                                {isLoading ? 'Processing...' : 'Complete Profile'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowRegisterFields(false)}
                                className="w-full text-slate-400 hover:text-white text-sm font-bold transition-colors bg-transparent border-none cursor-pointer mt-2"
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
                    <h1 className="text-4xl font-black text-white tracking-tight">{pharmacy?.name || 'Dashboard'}</h1>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Pharmacy Portal</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="h-12 px-6 bg-[#262626] text-white hover:bg-accent-teal font-bold text-sm rounded-xl border-2 border-white/10 transition-all cursor-pointer shadow-lg"
                >
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 gap-12">
                <section>
                    <div className="flex items-center justify-between mb-8 px-2">
                        <h2 className="text-2xl font-black text-white">Active Reservations</h2>
                        <span className="px-4 py-1.5 bg-accent-teal text-white rounded-lg text-sm font-black shadow-[0_0_15px_rgba(20,184,166,0.3)]">{reservations.length} Pending</span>
                    </div>

                    {reservations.length === 0 ? (
                        <div className="bg-[#262626] p-20 text-center rounded-3xl border border-dashed border-white/10">
                            <p className="text-slate-500 font-bold text-lg">No active reservations</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {reservations.map((res: any) => (
                                <motion.div
                                    key={res._id}
                                    layout
                                    className="bg-[#262626] p-7 rounded-3xl border border-white/10 shadow-xl"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Medicine</p>
                                            <h3 className="text-xl font-black text-white">{res.medicineId?.name || 'Unknown'}</h3>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border-2 ${res.status === 'Pending' ? 'text-amber-400 border-amber-400/40 bg-amber-400/10' :
                                                res.status === 'Confirmed' ? 'text-accent-teal-vibrant border-teal-400/40 bg-teal-400/10' : 'text-slate-400 border-white/10 bg-black/20'
                                                }`}>
                                                {res.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8 bg-black/30 p-4 rounded-2xl border border-white/5">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400 font-medium">Customer</span>
                                            <span className="text-white font-black">{res.customerName}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400 font-medium">Contact</span>
                                            <span className="text-accent-teal-vibrant font-black">{res.customerPhone}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        {res.status === 'Pending' && (
                                            <button
                                                onClick={() => handleUpdateStatus(res._id, 'Confirmed')}
                                                className="flex-1 h-12 bg-accent-teal hover:bg-accent-teal-vibrant text-white font-black text-sm rounded-xl transition-all border-none cursor-pointer shadow-lg"
                                            >
                                                Confirm
                                            </button>
                                        )}
                                        {res.status === 'Confirmed' && (
                                            <button
                                                onClick={() => handleUpdateStatus(res._id, 'PickedUp')}
                                                className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm rounded-xl transition-all border-none cursor-pointer shadow-lg"
                                            >
                                                Mark Picked Up
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleUpdateStatus(res._id, 'Cancelled')}
                                            className="h-12 px-5 bg-white/5 text-slate-500 hover:text-white hover:bg-rose-500/20 rounded-xl transition-all border-none cursor-pointer"
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
