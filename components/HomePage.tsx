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
    className={`px-8 py-4 font-bold text-center transition-all duration-300 relative rounded-t-xl border-none outline-none cursor-pointer ${active ? 'text-white bg-[#262626]' : 'text-slate-400 hover:text-white bg-transparent'
      }`}
  >
    {children}
    {active && (
      <motion.div
        layoutId="activeTabUnderline"
        className="absolute bottom-0 left-0 right-0 h-1 bg-accent-teal"
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
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
          Find Your Medicine <span className="text-accent-teal-vibrant">Near You.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-300 font-medium mb-12">
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

        <div className="bg-[#262626] p-7 pt-9 rounded-b-3xl rounded-tr-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative border border-white/5">
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
                    <SearchIcon className="h-5 w-5 text-slate-400 group-focus-within:text-accent-teal-vibrant transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={medicineQuery}
                    onChange={(e) => setMedicineQuery(e.target.value)}
                    placeholder="Enter medicine name (e.g., Paracetamol)"
                    className="w-full h-16 pl-12 pr-32 bg-[#0c0c0c] border border-white/10 focus:border-accent-teal text-white rounded-2xl transition-all outline-none text-lg shadow-inner"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center space-x-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button
                      type="button"
                      onClick={handleScanClick}
                      disabled={isProcessingImage}
                      className="p-3 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all bg-transparent"
                      title="Scan Prescription"
                    >
                      {isProcessingImage ? <div className="w-5 h-5 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" /> : <CameraIcon className="h-6 w-6" />}
                    </button>
                    <button type="button" className="p-3 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all bg-transparent" title="Voice Search">
                      <MicIcon className="h-6 w-6" />
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
                    <SearchIcon className="h-5 w-5 text-slate-400 group-focus-within:text-accent-teal-vibrant transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={diseaseQuery}
                    onChange={(e) => setDiseaseQuery(e.target.value)}
                    placeholder="Describe your symptoms (e.g., severe headache)"
                    className="w-full h-16 pl-12 pr-12 bg-[#0c0c0c] border border-white/10 focus:border-accent-teal text-white rounded-2xl transition-all outline-none text-lg shadow-inner"
                  />
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={activeTab === 'medicine' ? handleMedicineSubmit : handleDiseaseSubmit}
            className="mt-8 w-full h-16 btn-primary text-xl active:scale-[0.98]"
          >
            {activeTab === 'medicine' ? 'Locate Medicine' : 'Get AI Advice'}
          </button>
        </div>
      </div>

      {/* Floating Buttons EN and HC */}
      <div className="fixed bottom-10 right-10 flex flex-col space-y-4 items-end z-50">
        <button className="w-14 h-14 bg-[#262626] border-2 border-white/20 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-accent-teal hover:border-accent-teal-vibrant shadow-2xl transition-all cursor-pointer">EN</button>
        <button className="w-14 h-14 bg-[#262626] border-2 border-white/20 rounded-full flex items-center justify-center text-lg font-black text-white hover:bg-accent-teal hover:border-accent-teal-vibrant shadow-2xl transition-all cursor-pointer">HC</button>
      </div>
    </div>
  );
};