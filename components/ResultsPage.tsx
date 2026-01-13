import React from 'react';
import type { Pharmacy, SortKey, SearchConfirmation } from '../types';
import { PharmacyCard } from './PharmacyCard';
import { PillIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';

interface ResultsPageProps {
  pharmacies: Pharmacy[];
  isLoading: boolean;
  statusText: string;
  onSelectPharmacy: (pharmacy: Pharmacy) => void;
  sortBy: SortKey;
  onSortChange: (key: SortKey) => void;
  medicineChoices: string[];
  onMedicineSelect: (medicine: string) => void;
  searchConfirmation: SearchConfirmation | null;
  searchedMedicine: string;
  medicineDescription: string;
}

const SortButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 text-sm font-bold rounded-full transition-all duration-300 ${active
          ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
          : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700'
        }`}
    >
      {children}
    </button>
  );
};

const MedicineInfoCard: React.FC<{ medicineName: string; description: string }> = ({ medicineName, description }) => {
  if (!medicineName) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 mb-10 border-l-4 border-l-teal-500"
    >
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0 bg-teal-500/10 p-4 rounded-2xl">
          <PillIcon className="h-8 w-8 text-teal-400" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">{medicineName}</h2>
          <p className="mt-3 text-slate-400 leading-relaxed text-lg">{description || 'Loading medicine information...'}</p>
        </div>
      </div>
    </motion.div>
  );
};

export const ResultsPage: React.FC<ResultsPageProps> = ({
  pharmacies,
  isLoading,
  statusText,
  onSelectPharmacy,
  sortBy,
  onSortChange,
  medicineChoices,
  onMedicineSelect,
  searchConfirmation,
  searchedMedicine,
  medicineDescription
}) => {

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-teal-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xl font-bold text-slate-400 animate-pulse">{statusText || 'Analyzing data...'}</p>
      </div>
    );
  }

  if (searchConfirmation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto glass-card p-10 text-center"
      >
        <h2 className="text-3xl font-black text-white mb-4">
          {searchConfirmation?.suggestion ? "Did you mean?" : "Confirm Search"}
        </h2>
        <p className="text-slate-400 mb-10 text-lg leading-relaxed">{statusText}</p>
        <div className="flex flex-col gap-4">
          {searchConfirmation?.suggestion && (
            <button
              onClick={() => onMedicineSelect(searchConfirmation.suggestion!)}
              className="h-16 bg-teal-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-teal-500/20 hover:bg-teal-400 transition-all hover:scale-[1.02]"
            >
              SEARCH FOR "{searchConfirmation.suggestion.toUpperCase()}"
            </button>
          )}
          <button
            onClick={() => onMedicineSelect(searchConfirmation.original)}
            className="h-16 bg-slate-800 text-slate-200 font-bold text-lg rounded-2xl hover:bg-slate-700 transition-all"
          >
            SEARCH FOR "{searchConfirmation.original.toUpperCase()}" ANYWAY
          </button>
        </div>
      </motion.div>
    );
  }

  if (medicineChoices.length > 0 && pharmacies.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-black text-white mb-8 text-center uppercase tracking-wider">AI Recommendations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {medicineChoices.map((medicine, i) => (
            <motion.button
              key={medicine}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onMedicineSelect(medicine)}
              className="glass-card p-6 text-left hover:border-teal-500 transition-all group"
            >
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-slate-200 group-hover:text-teal-400 transition-colors uppercase">{medicine}</span>
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-teal-500/20 transition-all">
                  <span className="text-teal-400">→</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {pharmacies.length > 0 && (
        <>
          <MedicineInfoCard medicineName={searchedMedicine} description={medicineDescription} />
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Available Options</h3>
            <div className="flex items-center space-x-3 p-1 bg-slate-900/50 rounded-full border border-slate-700/50">
              <SortButton active={sortBy === 'distance'} onClick={() => onSortChange('distance')}>DISTANCE</SortButton>
              <SortButton active={sortBy === 'price'} onClick={() => onSortChange('price')}>PRICE</SortButton>
            </div>
          </div>

          <motion.div
            layout
            className="space-y-6"
          >
            <AnimatePresence>
              {pharmacies.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <PharmacyCard pharmacy={p} onClick={() => onSelectPharmacy(p)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}

      {pharmacies.length === 0 && !isLoading && (
        <div className="glass-card p-12 text-center">
          <p className="text-xl font-bold text-slate-500 italic">No pharmacies found with this medicine in stock.</p>
        </div>
      )}
    </div>
  );
};
