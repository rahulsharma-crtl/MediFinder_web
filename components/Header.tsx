import React from 'react';
import { PillIcon, SettingsIcon } from './icons';
import { motion } from 'framer-motion';

interface HeaderProps {
  onHomeClick: () => void;
  onPharmacyOwnerClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHomeClick, onPharmacyOwnerClick }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 border-b border-white/5">
      <nav className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-20">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center"
          >
            <button
              onClick={onHomeClick}
              className="flex items-center gap-2 bg-transparent border-none p-0 cursor-pointer"
            >
              <PillIcon className="h-7 w-7 text-teal-500" />
              <span className="font-bold text-xl tracking-tight text-white">MediFinder</span>
            </button>
          </motion.div>

          <div className="flex items-center space-x-8">
            <button
              onClick={onHomeClick}
              className="text-slate-300 hover:text-white font-medium text-sm transition-colors bg-transparent"
            >
              Home
            </button>
            <button
              onClick={onPharmacyOwnerClick}
              className="text-slate-300 hover:text-white font-medium text-sm transition-colors bg-transparent"
            >
              For Pharmacy Owners
            </button>
            <button className="text-slate-300 hover:text-white transition-colors bg-transparent">
              <SettingsIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};