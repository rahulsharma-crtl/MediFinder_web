import React from 'react';
import { PillIcon, SettingsIcon } from './icons';
import { motion } from 'framer-motion';

interface HeaderProps {
  onHomeClick: () => void;
  onPharmacyOwnerClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHomeClick, onPharmacyOwnerClick }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 border-b border-white/10">
      <nav className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-20">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center"
          >
            <button
              onClick={onHomeClick}
              className="flex items-center gap-2 bg-transparent border-none p-0 cursor-pointer group"
            >
              <PillIcon className="h-7 w-7 text-accent-teal group-hover:text-accent-teal-vibrant transition-colors" />
              <span className="font-bold text-xl tracking-tight text-white">MediFinder</span>
            </button>
          </motion.div>

          <div className="flex items-center space-x-8">
            <button
              onClick={onHomeClick}
              className="text-white hover:text-accent-teal-vibrant font-semibold text-sm transition-colors bg-transparent px-2 py-1"
            >
              Home
            </button>
            <button
              onClick={onPharmacyOwnerClick}
              className="text-white hover:text-accent-teal-vibrant font-semibold text-sm transition-colors bg-transparent px-2 py-1"
            >
              For Pharmacy Owners
            </button>
            <button className="text-white hover:text-accent-teal-vibrant transition-colors bg-transparent p-1">
              <SettingsIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};