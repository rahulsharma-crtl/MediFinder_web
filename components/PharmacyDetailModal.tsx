import React, { useState } from 'react';
import type { Pharmacy } from '../types';
import { MapPinIcon, PhoneIcon, XIcon, PillIcon } from './icons';
import { reservationService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface PharmacyDetailModalProps {
  pharmacy: Pharmacy | null;
  onClose: () => void;
}

export const PharmacyDetailModal: React.FC<PharmacyDetailModalProps> = ({ pharmacy, onClose }) => {
  const [isReserving, setIsReserving] = useState(false);
  const [reservationStatus, setReservationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  if (!pharmacy) return null;

  const handleReserve = async () => {
    if (!customerName || !customerPhone) return;

    setReservationStatus('loading');
    try {
      await reservationService.create({
        medicineId: (pharmacy as any)._id || pharmacy.id, // Support both MongoDB _id and mock id
        pharmacyId: (pharmacy as any).pharmacyId || pharmacy.id,
        customerName,
        customerPhone
      });
      setReservationStatus('success');
    } catch (error) {
      console.error('Reservation failed:', error);
      setReservationStatus('error');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-card w-full max-w-lg overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Image/Pattern */}
          <div className="h-32 bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center border-b border-slate-700/50">
            <PillIcon className="h-16 w-16 text-teal-400 opacity-20" />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/50 text-slate-400 hover:text-white transition-colors"
          >
            <XIcon className="h-6 w-6" />
          </button>

          <div className="p-8">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-1">{pharmacy.name}</h2>
            <p className="text-slate-500 uppercase tracking-widest text-xs font-bold mb-6">{pharmacy.address}</p>

            <div className="flex items-center justify-between mb-8 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Price per unit</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black text-slate-500">₹</span>
                  <span className="text-4xl font-black text-teal-400 tracking-tighter">{pharmacy.price.toFixed(0)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Distance</p>
                <p className="text-2xl font-black text-white tracking-tight">{pharmacy.distance.toFixed(1)} km</p>
              </div>
            </div>

            {!isReserving ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-14 bg-slate-800 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-all uppercase tracking-widest"
                  >
                    <MapPinIcon className="h-5 w-5" /> Directions
                  </a>
                  <a
                    href={`tel:${pharmacy.phone}`}
                    className="flex-1 h-14 bg-slate-800 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-all uppercase tracking-widest"
                  >
                    <PhoneIcon className="h-5 w-5" /> Call Now
                  </a>
                </div>
                <button
                  onClick={() => setIsReserving(true)}
                  className="w-full h-16 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 transition-all uppercase tracking-widest"
                >
                  RESERVE MEDICINE
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">Reserve your order</h3>

                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full h-14 px-4 glass-input rounded-xl"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full h-14 px-4 glass-input rounded-xl"
                />

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setIsReserving(false)}
                    className="flex-1 h-14 bg-slate-800 text-slate-400 font-bold rounded-xl"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleReserve}
                    disabled={reservationStatus === 'loading' || !customerName || !customerPhone}
                    className="flex-[2] h-14 bg-teal-500 text-white font-black rounded-xl"
                  >
                    {reservationStatus === 'loading' ? 'PROCESSING...' : 'CONFIRM RESERVATION'}
                  </button>
                </div>

                {reservationStatus === 'success' && (
                  <p className="text-emerald-400 font-bold text-center mt-4">✓ Reserved! Pick up within 2 hours.</p>
                )}
                {reservationStatus === 'error' && (
                  <p className="text-rose-400 font-bold text-center mt-4">✕ Something went wrong. Try again.</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};