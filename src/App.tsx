import { useState, useEffect } from 'react';
import { User, DedicationData } from './types/dedication';
import { getDedicationBySlugApi, saveDedicationApi } from './services/api';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Builder } from './pages/Builder';
import { DedicationViewer } from './pages/DedicationViewer';
import { AuthModal } from './components/AuthModal';

type View = 'landing' | 'dashboard' | 'builder' | 'viewer';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentDedication, setCurrentDedication] = useState<DedicationData | null>(null);
  const [editingDedication, setEditingDedication] = useState<DedicationData | undefined>(undefined);

  // Restore session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('linklove_session');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  // Hash-based routing
  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash;

      if (hash.startsWith('#/dashboard')) {
        if (currentUser) {
          setView('dashboard');
        } else {
          setIsAuthOpen(true);
        }
      } else if (hash.startsWith('#/crear')) {
        if (currentUser) {
          setView('builder');
        } else {
          setIsAuthOpen(true);
        }
      } else if (hash.startsWith('#/d/')) {
        const slug = hash.replace('#/d/', '');
        const found = await getDedicationBySlugApi(slug);
        if (found) {
          setCurrentDedication(found);
          setView('viewer');
        } else {
          setView('landing');
        }
      } else {
        if (currentUser) {
          setView('dashboard');
        } else {
          setView('landing');
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('linklove_session', JSON.stringify(user));
    setIsAuthOpen(false);
    window.location.hash = '#/dashboard';
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('linklove_session');
    window.location.hash = '';
    setView('landing');
  };

  const handleGetStarted = () => {
    if (currentUser) {
      window.location.hash = '#/dashboard';
    } else {
      setIsAuthOpen(true);
    }
  };

  const handleSaveDedication = async (newDedication: DedicationData) => {
    if (currentUser) {
      newDedication.userEmail = currentUser.email;
    }
    await saveDedicationApi(newDedication);
    setCurrentDedication(newDedication);
    setEditingDedication(undefined);
    window.location.hash = `#/d/${newDedication.slug}`;
    setView('viewer');
  };

  // ─── RENDER VIEWS ───

  if (view === 'builder' && currentUser) {
    return (
      <Builder
        initialData={editingDedication}
        onSave={handleSaveDedication}
        onCancel={() => {
          setEditingDedication(undefined);
          window.location.hash = '#/dashboard';
          setView('dashboard');
        }}
      />
    );
  }

  if (view === 'dashboard' && currentUser) {
    return (
      <>
        <Dashboard
          user={currentUser}
          onLogout={handleLogout}
          onCreateNew={() => {
            setEditingDedication(undefined);
            window.location.hash = '#/crear';
            setView('builder');
          }}
          onViewDedication={(slug) => {
            window.location.hash = `#/d/${slug}`;
          }}
          onEditDedication={(dedicationToEdit) => {
            setEditingDedication(dedicationToEdit);
            window.location.hash = '#/crear';
            setView('builder');
          }}
        />
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={handleAuthSuccess} />
      </>
    );
  }

  if (view === 'viewer' && currentDedication) {
    return (
      <DedicationViewer
        data={currentDedication}
        onBackToHome={() => {
          if (currentUser) {
            window.location.hash = '#/dashboard';
          } else {
            window.location.hash = '';
            setView('landing');
          }
        }}
      />
    );
  }

  // Default: Landing Page
  return (
    <>
      <LandingPage onGetStarted={handleGetStarted} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={handleAuthSuccess} />
    </>
  );
}
