import React from 'react';
import type { Pharmacy } from '../types';
import { StockStatus } from '../types';
import { StarIcon, PillIcon } from './icons';
import { motion } from 'framer-motion';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  onClick: () => void;
}

const getStockStatus = (stock: StockStatus) => {
  switch (stock) {
    case StockStatus.Available:
      return { label: 'IN STOCK', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    case StockStatus.LimitedStock:
      return { label: 'LIMITED', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    default:
      return { label: 'OUT OF STOCK', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
  }
};

export const PharmacyCard: React.FC<PharmacyCardProps> = ({ pharmacy, onClick }) => {
  const { name, price, priceUnit, distance, stock, isBestOption, address } = pharmacy;
  const status = getStockStatus(stock);

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`glass-card p-6 cursor-pointer transition-all relative overflow-hidden group ${isBestOption ? 'border-teal-500/50 shadow-teal-500/10' : ''
        }`}
    >
      {isBestOption && (
        <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl tracking-[0.2em] flex items-center gap-2">
          <StarIcon className="h-3 w-3" />
          RECOMMENDED
        </div>
      )}

      <div className="flex justify-between items-start gap-6">
        <div className="flex-grow">
          <h3 className="font-black text-2xl text-white group-hover:text-teal-400 transition-colors uppercase tracking-tight">{name}</h3>
          <p className="text-slate-500 text-sm mt-1 uppercase font-bold tracking-widest">{address}</p>
        </div>

        {stock === StockStatus.Available && (
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-xs font-black text-slate-500 uppercase">₹</span>
              <span className="text-3xl font-black text-teal-400 tracking-tighter">{price.toFixed(0)}</span>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{priceUnit}</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between items-center border-t border-slate-700/50 pt-6">
        <div className={`px-4 py-1.5 text-[10px] font-black rounded-xl border ${status.color} tracking-[0.1em]`}>
          {status.label}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-white font-black text-lg tracking-tight">{distance.toFixed(1)} km</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">away</p>
          </div>
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-teal-500 transition-all">
            <span className="text-white group-hover:scale-125 transition-transform">→</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
