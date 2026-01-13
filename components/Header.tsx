import React from 'react';
import { PillIcon } from './icons';
import { motion } from 'framer-motion';

interface HeaderProps {
  onHomeClick: () => void;
  onPharmacyOwnerClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHomeClick, onPharmacyOwnerClick }) => {
  return (
    <header className="glass-card !rounded-none !border-t-0 !border-x-0 sticky top-0 z-40 px-4 sm:px-6 lg:px-8">
      <nav className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-20">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center"
          >
            <button onClick={onHomeClick} className="flex items-center gap-3">
              <div className="bg-teal-500 rounded-xl p-2 shadow-lg shadow-teal-500/20">
                <PillIcon className="h-6 w-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-white uppercase italic">Medi<span className="text-teal-400">Finder</span></span>
            </button>
          </motion.div>

          <div className="flex items-center space-x-8">
            <button
              onClick={onHomeClick}
              className="text-slate-400 hover:text-white font-black text-xs tracking-[0.2em] uppercase transition-colors"
            >
              Search
            </button>
            <button
              onClick={onPharmacyOwnerClick}
              className="px-6 py-2.5 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 font-black text-xs tracking-[0.2em] uppercase rounded-xl border border-slate-700 transition-all"
            >
              OWNER PANEL
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};