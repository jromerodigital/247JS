import { useState, useEffect } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { DedicationData } from './types/dedication';
import { JORGE_SUSANA_DEDICATION } from './data/defaultDedication';
import { DedicationViewer } from './pages/DedicationViewer';
import { Builder } from './pages/Builder';

export default function App() {
  const [view, setView] = useState<'home' | 'builder' | 'custom'>('home');
  const [currentDedication, setCurrentDedication] = useState<DedicationData>(JORGE_SUSANA_DEDICATION);

  // Hash-based routing check (#/crear or #/d/:slug)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/crear')) {
        setView('builder');
      } else if (hash.startsWith('#/d/')) {
        const slug = hash.replace('#/d/', '');
        const saved = localStorage.getItem(`dedication_${slug}`);
        if (saved) {
          try {
            setCurrentDedication(JSON.parse(saved));
            setView('custom');
          } catch (e) {
            setCurrentDedication(JORGE_SUSANA_DEDICATION);
            setView('home');
          }
        } else {
          // If not found in local storage, fallback to home
          setView('home');
        }
      } else {
        setView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSaveDedication = (newDedication: DedicationData) => {
    // Save to localStorage for persistence
    localStorage.setItem(`dedication_${newDedication.slug}`, JSON.stringify(newDedication));
    setCurrentDedication(newDedication);
    window.location.hash = `#/d/${newDedication.slug}`;
    setView('custom');
  };

  if (view === 'builder') {
    return (
      <Builder
        onSave={handleSaveDedication}
        onCancel={() => {
          window.location.hash = '';
          setView('home');
        }}
      />
    );
  }

  return (
    <div className="relative">
      {/* Floating CTA button for Visitors to create their own dedication */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            window.location.hash = '#/crear';
            setView('builder');
          }}
          className="bg-romantic-accent hover:bg-romantic-accent-hover text-white px-5 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 text-xs sm:text-sm border-2 border-white/80 transition-transform hover:scale-105 cursor-pointer"
        >
          <Sparkles size={16} /> Crear mi Dedicatoria
        </button>
      </div>

      {/* Render Dedication Viewer */}
      <DedicationViewer
        data={currentDedication}
        onBackToHome={view === 'custom' ? () => {
          window.location.hash = '';
          setCurrentDedication(JORGE_SUSANA_DEDICATION);
          setView('home');
        } : undefined}
      />
    </div>
  );
}
