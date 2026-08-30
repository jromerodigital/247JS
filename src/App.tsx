import { useState, useEffect } from 'react';
import { Sparkles, Heart, User as UserIcon, LogOut } from 'lucide-react';
import { DedicationData, User } from './types/dedication';
import { JORGE_SUSANA_DEDICATION } from './data/defaultDedication';
import { DedicationViewer } from './pages/DedicationViewer';
import { Builder } from './pages/Builder';
import { AuthModal } from './components/AuthModal';
import { getDedicationBySlugApi } from './services/api';

export default function App() {
  const [view, setView] = useState<'home' | 'builder' | 'custom'>('home');
  const [currentDedication, setCurrentDedication] = useState<DedicationData>(JORGE_SUSANA_DEDICATION);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Load user session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('vibelove_session');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  // Hash-based routing check (#/crear or #/d/:slug)
  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/crear')) {
        setView('builder');
      } else if (hash.startsWith('#/d/')) {
        const slug = hash.replace('#/d/', '');
        const found = await getDedicationBySlugApi(slug);
        if (found) {
          setCurrentDedication(found);
          setView('custom');
        } else {
          setCurrentDedication(JORGE_SUSANA_DEDICATION);
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

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('vibelove_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vibelove_session');
  };

  const handleSaveDedication = (newDedication: DedicationData) => {
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
      {/* Top User Bar (Login / Profile) */}
      <div className="absolute top-6 right-6 z-40 flex items-center gap-2">
        {currentUser ? (
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-romantic-accent border border-romantic-text/10 shadow-sm">
            <UserIcon size={14} />
            <span>Hola, {currentUser.name}</span>
            <button
              onClick={handleLogout}
              className="ml-1 p-1 hover:text-red-600 transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-romantic-accent border border-romantic-text/10 shadow-sm hover:bg-white transition-colors cursor-pointer"
          >
            <UserIcon size={14} /> Ingresar / Registrarse
          </button>
        )}
      </div>

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

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
