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
    className={`px-8 py-3.5 font-bold text-center transition-all duration-300 relative rounded-t-xl border-none outline-none cursor-pointer ${active ? 'text-teal-400 bg-[#1a1a1a]' : 'text-slate-400 hover:text-slate-200 bg-transparent'
      }`}
  >
    {children}
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
          Find Your Medicine <span className="text-teal-400">Near You.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-12">
          Instantly locate pharmacies, compare prices, and get AI-powered recommendations.
        </p>
      </motion.div>

      <div className="w-full max-w-2xl px-4">
        <div className="flex space-x-1 mb-0 relative z-10 overflow-x-auto scrollbar-hide">
          <TabButton active={activeTab === 'medicine'} onClick={() => setActiveTab('medicine')}>
            Search by Medicine
          </TabButton>
          <TabButton active={activeTab === 'disease'} onClick={() => setActiveTab('disease')}>
            Search by Disease
          </TabButton>
        </div>

        <div className="bg-[#1a1a1a] p-6 pt-8 rounded-b-3xl rounded-tr-3xl shadow-2xl relative">
          <AnimatePresence mode="wait">
            {activeTab === 'medicine' ? (
              <motion.div
                key="medicine-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleMedicineSubmit} className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={medicineQuery}
                    onChange={(e) => setMedicineQuery(e.target.value)}
                    placeholder="Enter medicine name (e.g., Paracetamol)"
                    className="w-full h-14 pl-12 pr-32 bg-[#0f0f0f] border border-white/10 focus:border-teal-500/50 text-white rounded-2xl transition-all outline-none"
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center space-x-1">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button
                      type="button"
                      onClick={handleScanClick}
                      disabled={isProcessingImage}
                      className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all bg-transparent"
                    >
                      {isProcessingImage ? <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" /> : <CameraIcon className="h-5 w-5" />}
                    </button>
                    <button type="button" className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all bg-transparent">
                      <MicIcon className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="disease-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleDiseaseSubmit} className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={diseaseQuery}
                    onChange={(e) => setDiseaseQuery(e.target.value)}
                    placeholder="Describe your symptoms (e.g., severe headache)"
                    className="w-full h-14 pl-12 pr-12 bg-[#0f0f0f] border border-white/10 focus:border-teal-500/50 text-white rounded-2xl transition-all outline-none"
                  />
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={activeTab === 'medicine' ? handleMedicineSubmit : handleDiseaseSubmit}
            className="mt-6 w-full h-14 bg-accent-teal hover:bg-teal-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-900/20 border-none cursor-pointer"
          >
            {activeTab === 'medicine' ? 'Search Medicine' : 'Get AI Advice'}
          </button>
        </div>
      </div>

      {/* Floating Buttons EN and HC */}
      <div className="fixed bottom-8 right-8 flex flex-col space-y-4 items-end z-50">
        <button className="w-12 h-12 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer">EN</button>
        <button className="w-12 h-12 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-sm font-bold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer">HC</button>
      </div>
    </div>
  );
};