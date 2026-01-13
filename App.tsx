
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { ResultsPage } from './components/ResultsPage';
import { PharmacyDetailModal } from './components/PharmacyDetailModal';
import { AccessibilityControls } from './components/AccessibilityControls';
import { aiService, medicineService } from './services/api';
import { StockStatus } from './types';
import type { Pharmacy, SortKey, FontSize, SearchConfirmation } from './types';
import { PharmacyOwnerPage } from './components/PharmacyOwnerPage';
import { motion, AnimatePresence } from 'framer-motion';


export default function App() {
  const [page, setPage] = useState<'home' | 'results' | 'pharmacyOwner'>('home');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('distance');
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [statusText, setStatusText] = useState('');
  const [medicineChoices, setMedicineChoices] = useState<string[]>([]);
  const [locationError, setLocationError] = useState<string>('');
  const [searchConfirmation, setSearchConfirmation] = useState<SearchConfirmation | null>(null);
  const [searchedMedicine, setSearchedMedicine] = useState<string>('');
  const [medicineDescription, setMedicineDescription] = useState<string>('');

  useEffect(() => {
    document.body.classList.remove('font-size-base', 'font-size-lg', 'font-size-xl');
    document.body.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  const handleMedicineSelect = (medicine: string) => {
    setSearchConfirmation(null);
    setPharmacies([]);
    setMedicineChoices([]);
    setMedicineDescription('');
    setSearchedMedicine(medicine);
    setLocationError('');
    setIsLoading(true);
    setStatusText('Getting your location...');

    if (!navigator.geolocation) {
      setIsLoading(false);
      setLocationError('Geolocation is not supported by your browser.');
      setStatusText('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setStatusText(`Finding pharmacies with ${medicine} near you...`);
        try {
          // Use search endpoint from backend
          const response = await medicineService.search(medicine);
          const foundMedicines = response.data;

          setMedicineDescription(`${medicine} is commonly used for various health needs. Consult a doctor for professional advice.`);

          const availablePharmacies = foundMedicines.map((m: any) => ({
            ...m.pharmacyId,
            medicine: m.name,
            price: m.price,
            stock: m.stock,
            distance: Math.random() * 5 // Mock distance calculation
          })).filter((p: any) => p.stock === StockStatus.Available);

          setPharmacies(availablePharmacies);

        } catch (error) {
          console.error("Failed to find pharmacies:", error);
          setStatusText('Could not fetch medicine data from server.');
        } finally {
          setIsLoading(false);
          setStatusText('');
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMsg = 'Could not get your location. Please enable location services in your browser settings.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location access denied. Please allow location access to find nearby pharmacies.';
        }
        setLocationError(errorMsg);
        setStatusText(errorMsg);
        setIsLoading(false);
      }
    );
  };

  const handleMedicineSearch = async (medicine: string) => {
    const trimmedMedicine = medicine.trim();
    if (!trimmedMedicine) return;

    setPage('results');
    setPharmacies([]);
    setMedicineChoices([]);
    setSearchConfirmation(null);
    setLocationError('');
    setIsLoading(true);
    setStatusText(`Searching for '${trimmedMedicine}'...`);

    try {
      const isLocallyAvailable = await checkMedicineLocally(trimmedMedicine);
      if (isLocallyAvailable) {
        handleMedicineSelect(trimmedMedicine);
        return;
      }

      setStatusText(`Validating '${trimmedMedicine}'...`);
      const validation = await validateMedicineName(trimmedMedicine);

      if (!validation.valid) {
        setStatusText(validation.reason || `Sorry, '${trimmedMedicine}' doesn't seem to be a recognized medicine. Please check the spelling and try again.`);
        setIsLoading(false);
        return;
      }

      const suggestedMedicine = validation.correctedName || trimmedMedicine;

      if (suggestedMedicine.toLowerCase() !== trimmedMedicine.toLowerCase()) {
        setSearchConfirmation({ suggestion: suggestedMedicine, original: trimmedMedicine });
        setIsLoading(false);
        setStatusText(`We think you meant '${suggestedMedicine}'.`);
      } else {
        handleMedicineSelect(suggestedMedicine);
      }

    } catch (error) {
      console.error("Medicine validation failed:", error);
      setStatusText(`Couldn't validate '${trimmedMedicine}'. You can search for it anyway.`);
      setSearchConfirmation({ suggestion: null, original: trimmedMedicine });
      setIsLoading(false);
    }
  };


  const handleDiseaseSearch = async (disease: string) => {
    if (!disease.trim()) return;
    setIsLoading(true);
    setPage('results');
    setPharmacies([]);
    setMedicineChoices([]);
    setSearchConfirmation(null);
    setLocationError('');
    setStatusText(`Finding medicine recommendations for '${disease}'...`);

    try {
      const recommendations = await getMedicineRecommendations(disease);
      const choices = recommendations.split(',').map(m => m.trim()).filter(Boolean);

      if (choices.length === 0) {
        setStatusText(`No specific medicine recommendations found for '${disease}'. Try searching for a medicine directly.`);
        setIsLoading(false);
      } else if (choices.length === 1) {
        handleMedicineSelect(choices[0]);
      } else {
        setMedicineChoices(choices);
        setIsLoading(false);
        setStatusText(`AI recommended the following for '${disease}'. Please choose one.`);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setStatusText('An error occurred. Please try your search again.');
      setIsLoading(false);
    }
  };

  const sortedPharmacies = useMemo(() => {
    return [...pharmacies].sort((a, b) => {
      if (a.isBestOption) return -1;
      if (b.isBestOption) return 1;
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'distance':
          return a.distance - b.distance;
        case 'availability':
          // All pharmacies are 'Available', so this sort is equivalent
          // to sorting by distance as a secondary criterion.
          return a.distance - b.distance;
        default:
          return 0;
      }
    });
  }, [pharmacies, sortBy]);

  const handleFontSizeChange = () => {
    setFontSize(current => {
      if (current === 'base') return 'lg';
      if (current === 'lg') return 'xl';
      return 'base';
    });
  };

  const handleReturnHome = () => {
    setPage('home');
    setPharmacies([]);
    setMedicineChoices([]);
    setSearchConfirmation(null);
    setLocationError('');
    setStatusText('');
    setIsLoading(false);
    setSearchedMedicine('');
    setMedicineDescription('');
  }

  const handlePharmacyOwnerClick = () => {
    setPage('pharmacyOwner');
  };

  return (
    <div className={`bg-[#0f172a] min-h-screen text-slate-200 selection:bg-teal-500/30 font-size-${fontSize}`}>
      <Header onHomeClick={handleReturnHome} onPharmacyOwnerClick={handlePharmacyOwnerClick} />

      <main className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {page === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <HomePage onMedicineSearch={handleMedicineSearch} onDiseaseSearch={handleDiseaseSearch} />
            </motion.div>
          )}

          {page === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <ResultsPage
                pharmacies={sortedPharmacies}
                isLoading={isLoading}
                statusText={statusText || locationError}
                onSelectPharmacy={setSelectedPharmacy}
                sortBy={sortBy}
                onSortChange={setSortBy}
                medicineChoices={medicineChoices}
                onMedicineSelect={handleMedicineSelect}
                searchConfirmation={searchConfirmation}
                searchedMedicine={searchedMedicine}
                medicineDescription={medicineDescription}
              />
            </motion.div>
          )}

          {page === 'pharmacyOwner' && (
            <motion.div
              key="owner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <PharmacyOwnerPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <PharmacyDetailModal
        pharmacy={selectedPharmacy}
        onClose={() => setSelectedPharmacy(null)}
      />
      <AccessibilityControls onFontSizeChange={handleFontSizeChange} />
    </div>
  );
}
