import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Plus, Link2, ExternalLink, Printer, LogOut, Trash2, Copy, Check } from 'lucide-react';
import { DedicationData, User } from '../types/dedication';
import { getUserDedicationsApi } from '../services/api';
import { PrintableCardModal } from '../components/PrintableCardModal';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onCreateNew: () => void;
  onViewDedication: (slug: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onCreateNew, onViewDedication }) => {
  const [dedications, setDedications] = useState<DedicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [printDedication, setPrintDedication] = useState<DedicationData | null>(null);

  useEffect(() => {
    loadDedications();
  }, [user.email]);

  const loadDedications = async () => {
    setLoading(true);
    try {
      const list = await getUserDedicationsApi(user.email);
      setDedications(list);
    } catch (e) {
      console.error('Error loading dedications:', e);
    } finally {
      setLoading(false);
    }
  };

  const getPublicUrl = (slug: string) => {
    return `${window.location.origin}${window.location.pathname}#/d/${slug}`;
  };

  const handleCopyLink = (slug: string) => {
    navigator.clipboard.writeText(getPublicUrl(slug));
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="min-h-screen bg-romantic-bg text-romantic-text font-sans">
      {/* Top Bar */}
      <header className="bg-romantic-card border-b border-romantic-text/10 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-romantic-accent/10 rounded-full flex items-center justify-center text-romantic-accent">
              <Heart size={16} fill="currentColor" />
            </div>
            <div>
              <h1 className="font-serif italic font-bold text-lg text-romantic-accent leading-none">VibeLove</h1>
              <p className="text-[11px] text-romantic-text/50">Panel de Administración</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-romantic-text/60 hidden sm:inline">
              Hola, <strong>{user.name}</strong>
            </span>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs text-romantic-text/50 hover:text-red-500 transition-colors cursor-pointer bg-white/80 px-3 py-1.5 rounded-full border border-romantic-text/10"
            >
              <LogOut size={13} /> Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome & CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-2xl font-bold">Mis Dedicatorias</h2>
            <p className="text-xs text-romantic-text/50 mt-1">Administra y crea nuevos regalos digitales para tus personas favoritas.</p>
          </div>
          <button
            onClick={onCreateNew}
            className="bg-romantic-accent hover:bg-romantic-accent-hover text-white px-5 py-2.5 rounded-full font-bold shadow-md text-sm flex items-center gap-2 transition-all hover:scale-105 cursor-pointer flex-shrink-0"
          >
            <Plus size={16} /> Nueva Dedicatoria
          </button>
        </div>

        {/* Dedications Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-romantic-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-romantic-text/50">Cargando tus dedicatorias...</p>
          </div>
        ) : dedications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-romantic-card rounded-2xl border border-[#F2E8D5] shadow-sm"
          >
            <div className="w-16 h-16 bg-romantic-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 text-romantic-accent">
              <Heart size={28} />
            </div>
            <h3 className="font-serif font-bold text-xl mb-2">Aún no has creado ninguna dedicatoria</h3>
            <p className="text-xs text-romantic-text/50 mb-6 max-w-sm mx-auto">
              Crea tu primer regalo digital y sorprende a alguien especial hoy mismo.
            </p>
            <button
              onClick={onCreateNew}
              className="bg-romantic-accent hover:bg-romantic-accent-hover text-white px-6 py-2.5 rounded-full font-bold shadow-md text-sm flex items-center gap-2 mx-auto transition-all hover:scale-105 cursor-pointer"
            >
              <Plus size={16} /> Crear mi primera Dedicatoria
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dedications.map((ded, idx) => (
              <motion.div
                key={ded.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-romantic-card rounded-2xl border border-[#F2E8D5] shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-4">
                  {ded.mainPhoto ? (
                    <img
                      src={ded.mainPhoto}
                      alt={ded.partnerName}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-romantic-text/10"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-romantic-accent/10 flex items-center justify-center flex-shrink-0 text-romantic-accent">
                      <Heart size={18} fill="currentColor" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-serif font-bold text-sm truncate">{ded.title || 'Sin título'}</h4>
                    <p className="text-[11px] text-romantic-text/50 truncate">
                      Para {ded.partnerName} · de {ded.senderName}
                    </p>
                    <p className="text-[10px] text-romantic-text/35 mt-0.5">
                      {new Date(ded.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onViewDedication(ded.slug)}
                    className="flex items-center gap-1 text-[11px] font-semibold bg-romantic-accent/10 text-romantic-accent px-3 py-1.5 rounded-full hover:bg-romantic-accent/20 transition-colors cursor-pointer"
                  >
                    <ExternalLink size={12} /> Ver
                  </button>

                  <button
                    onClick={() => handleCopyLink(ded.slug)}
                    className="flex items-center gap-1 text-[11px] font-semibold bg-romantic-text/5 text-romantic-text/70 px-3 py-1.5 rounded-full hover:bg-romantic-text/10 transition-colors cursor-pointer"
                  >
                    {copiedSlug === ded.slug ? (
                      <><Check size={12} className="text-green-600" /> ¡Copiado!</>
                    ) : (
                      <><Copy size={12} /> Copiar enlace</>
                    )}
                  </button>

                  <button
                    onClick={() => setPrintDedication(ded)}
                    className="flex items-center gap-1 text-[11px] font-semibold bg-romantic-text/5 text-romantic-text/70 px-3 py-1.5 rounded-full hover:bg-romantic-text/10 transition-colors cursor-pointer"
                  >
                    <Printer size={12} /> QR
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Printable Card Modal */}
      {printDedication && (
        <PrintableCardModal
          isOpen={true}
          onClose={() => setPrintDedication(null)}
          dedication={printDedication}
        />
      )}
    </div>
  );
};
