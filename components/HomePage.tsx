import React, { useState, useRef } from 'react';
import { SearchIcon, CameraIcon, MicIcon } from './icons';
import { aiService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface HomePageProps {
  onMedicineSearch: (query: string) => void;
  onDiseaseSearch: (query: string) => void;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`w-1/2 py-4 font-bold text-center transition-all duration-300 rounded-t-2xl relative ${active ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
      }`}
  >
    {children}
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-1 bg-teal-400"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    )}
  </button>
);

export const HomePage: React.FC<HomePageProps> = ({ onMedicineSearch, onDiseaseSearch }) => {
  const [medicineQuery, setMedicineQuery] = useState('');
  const [diseaseQuery, setDiseaseQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'medicine' | 'disease'>('medicine');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      try {
        const base64 = await blobToBase64(file);
        const response = await aiService.analyzePrescription(base64);
        const medicines = response.data.medicines;

        // If multiple medicines found, we'll take the first one for search
        const firstMedicine = medicines.split(',')[0]?.trim();
        if (firstMedicine) {
          setMedicineQuery(firstMedicine);
          onMedicineSearch(firstMedicine);
        }
      } catch (error) {
        console.error("Error processing prescription image:", error);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleMedicineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (medicineQuery.trim()) onMedicineSearch(medicineQuery);
  };

  const handleDiseaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (diseaseQuery.trim()) onDiseaseSearch(diseaseQuery);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 neon-glow">
          Smart Medicine <span className="text-teal-400">Locator.</span>
        </h1>
        <p className="max-w-xl mx-auto text-lg md:text-xl text-slate-400 mb-12">
          Instantly locate medications, compare prices, and get AI-powered recommendations in a premium experience.
        </p>
      </motion.div>

      <div className="w-full max-w-3xl glass-card overflow-hidden">
        <div className="flex bg-slate-900/50">
          <TabButton active={activeTab === 'medicine'} onClick={() => setActiveTab('medicine')}>
            Search Medicine
          </TabButton>
          <TabButton active={activeTab === 'disease'} onClick={() => setActiveTab('disease')}>
            AI Recommendations
          </TabButton>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'medicine' ? (
              <motion.div
                key="medicine-tab"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleMedicineSubmit} className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="h-6 w-6 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={medicineQuery}
                    onChange={(e) => setMedicineQuery(e.target.value)}
                    placeholder="What medicine are you looking for?"
                    className="w-full h-16 pl-14 pr-32 glass-input text-xl rounded-2xl"
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center space-x-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button
                      type="button"
                      onClick={handleScanClick}
                      disabled={isProcessingImage}
                      className="p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-teal-400 transition-all"
                    >
                      {isProcessingImage ? <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" /> : <CameraIcon className="h-6 w-6" />}
                    </button>
                    <button type="button" className="p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-teal-400 transition-all">
                      <MicIcon className="h-6 w-6" />
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="disease-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleDiseaseSubmit} className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="h-6 w-6 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={diseaseQuery}
                    onChange={(e) => setDiseaseQuery(e.target.value)}
                    placeholder="Describe your symptoms (e.g., severe headache)"
                    className="w-full h-16 pl-14 pr-12 glass-input text-xl rounded-2xl focus:border-blue-500"
                  />
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={activeTab === 'medicine' ? handleMedicineSubmit : handleDiseaseSubmit}
            className={`mt-8 w-full h-16 rounded-2xl font-black text-xl tracking-wider transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl ${activeTab === 'medicine'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-teal-500/20 hover:shadow-teal-500/40'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/20 hover:shadow-blue-500/40'
              }`}
          >
            {activeTab === 'medicine' ? 'LOCATE MEDICINE' : 'GET AI ADVICE'}
          </button>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: 'Pharmacies', value: '500+' },
          { label: 'Medicines', value: '10k+' },
          { label: 'Users', value: '50k+' },
          { label: 'Reliability', value: '99.9%' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + (i * 0.1) }}
            className="text-center"
          >
            <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
            <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};