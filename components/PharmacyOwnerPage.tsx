import React, { useState, useEffect } from 'react';
import { authService, reservationService, medicineService, aiService } from '../services/api';
import { PharmacyOwnerDashboard } from './PharmacyOwnerDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { reverseGeocode } from '../services/geminiService';
import { MapPinIcon } from './icons';
import { StockStatus, InventoryItem } from '../types';

export const PharmacyOwnerPage: React.FC = () => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [pharmacy, setPharmacy] = useState<any>(null);
    const [reservations, setReservations] = useState<any[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
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
            const stored = localStorage.getItem('pharmacy');
            const pharmacyData = stored ? JSON.parse(stored) : null;
            setPharmacy(pharmacyData);

            if (pharmacyData?._id) {
                const [resData, invData] = await Promise.all([
                    reservationService.getPharmacyReservations(),
                    medicineService.getPharmacyInventory(pharmacyData._id)
                ]);
                setReservations(resData.data);

                // Map backend Medicine to frontend InventoryItem
                const mappedInventory = invData.data.map((m: any) => ({
                    _id: m._id,
                    medicineName: m.name,
                    price: m.price,
                    stock: m.stock as StockStatus
                }));
                setInventory(mappedInventory);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            // Don't logout immediately on inventory fetch error, might be just a network issue
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
                setLocation({ lat: latitude, lon: longitude });

                try {
                    const fetchedAddress = await reverseGeocode(latitude, longitude);
                    setAddress(fetchedAddress);
                } catch (error) {
                    console.error('Could determine address:', error);
                } finally {
                    setIsFetchingLocation(false);
                }
            },
            () => {
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
        setInventory([]);
        setReservations([]);
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

    // Inventory Handlers
    const handleItemAdd = async (newItem: InventoryItem) => {
        try {
            await medicineService.addMedicine({
                name: newItem.medicineName,
                price: newItem.price,
                stock: newItem.stock,
                quantity: 100 // Default quantity
            });
            fetchDashboardData();
        } catch (error) {
            console.error("Failed to add item", error);
            alert("Failed to add medicine to inventory.");
        }
    };

    const handleStockStatusChange = async (medicineName: string, newStatus: StockStatus) => {
        const item = inventory.find(i => i.medicineName === medicineName);
        if (!item?._id) return;

        try {
            await medicineService.updateMedicine(item._id, { stock: newStatus });
            setInventory(prev => prev.map(i =>
                i.medicineName === medicineName ? { ...i, stock: newStatus } : i
            ));
        } catch (error) {
            console.error("Failed to update stock status", error);
        }
    };

    const handleItemDelete = async (medicineName: string) => {
        const item = inventory.find(i => i.medicineName === medicineName);
        if (!item?._id) return;

        if (!window.confirm(`Are you sure you want to remove ${medicineName}?`)) return;

        try {
            await medicineService.deleteMedicine(item._id);
            setInventory(prev => prev.filter(i => i.medicineName !== medicineName));
        } catch (error) {
            console.error("Failed to delete item", error);
        }
    };

    const handleSlipUpload = async (file: File) => {
        // Mocking slip upload/parsing for now as it's a complex AI task
        // In a real app, you'd send to aiService.analyzePrescription or similar
        alert("Slip upload feature coming soon! Please add medicines manually for now.");
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
        <div className="py-12 space-y-12">
            <PharmacyOwnerDashboard
                owner={{
                    name: pharmacy?.name || 'Dashboard',
                    address: pharmacy?.address || '',
                    phone: pharmacy?.contact || ''
                }}
                inventory={inventory}
                onLogout={handleLogout}
                onSwitchAccount={handleLogout}
                onItemAdd={handleItemAdd}
                onSlipUpload={handleSlipUpload}
                onStockStatusChange={handleStockStatusChange}
                onItemDelete={handleItemDelete}
            />

            <section>
                <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className="text-3xl font-black text-white">Active Reservations</h2>
                    <span className="px-5 py-2 bg-accent-teal text-white rounded-xl text-sm font-black shadow-[0_0_20px_rgba(20,184,166,0.3)]">{reservations.length} Pending</span>
                </div>

                {reservations.length === 0 ? (
                    <div className="bg-[#1E1E1E] p-16 text-center rounded-3xl border-2 border-dashed border-white/5">
                        <p className="text-slate-500 font-bold text-lg">No active reservations yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {reservations.map((res: any) => (
                            <motion.div
                                key={res._id}
                                layout
                                className="bg-[#1E1E1E] p-7 rounded-3xl border border-white/10 shadow-xl hover:border-accent-teal/30 transition-all"
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
    );
};
