import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Plus, ExternalLink, Printer, LogOut, Copy, Check, Sparkles, HelpCircle, Edit3, Clock } from 'lucide-react';
import { DedicationData, User } from '../types/dedication';
import { getUserDedicationsApi } from '../services/api';
import { PrintableCardModal } from '../components/PrintableCardModal';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onCreateNew: () => void;
  onViewDedication: (slug: string) => void;
  onEditDedication?: (dedication: DedicationData) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onCreateNew, onViewDedication, onEditDedication }) => {
  const [dedications, setDedications] = useState<DedicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [printDedication, setPrintDedication] = useState<DedicationData | null>(null);
  const [showGuide, setShowGuide] = useState(true);

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

  const isEditable = (createdAt: number) => {
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    return Date.now() - createdAt < twentyFourHoursMs;
  };

  return (
    <div className="min-h-screen bg-romantic-bg text-romantic-text font-sans pb-16">
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
              Hola, <strong>{user.name} {user.lastName}</strong>
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
        
        {/* Onboarding Tour Banner */}
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-romantic-card to-[#FFFBF5] rounded-2xl p-5 border border-romantic-accent/30 shadow-sm relative overflow-hidden"
          >
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-3 right-3 text-romantic-text/40 hover:text-romantic-text text-xs"
            >
              ✕ Entendido
            </button>

            <div className="flex items-center gap-2 mb-3 text-romantic-accent font-bold text-xs tracking-wider uppercase">
              <Sparkles size={14} /> Guía rápida de inicio
            </div>

            <h3 className="font-serif font-bold text-base mb-3">¿Cómo crear y entregar tu primer regalo digital?</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white/80 p-3 rounded-xl border border-romantic-text/10">
                <span className="font-bold text-romantic-accent">1. Diseña el detalle</span>
                <p className="text-romantic-text/70 mt-1">Escribe tu carta con la ayuda del asistente poético y elige fotos y canciones.</p>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-romantic-text/10">
                <span className="font-bold text-romantic-accent">2. Publica y descarga</span>
                <p className="text-romantic-text/70 mt-1">Al terminar se generará tu enlace único y tu Tarjeta Física con Código QR en PDF.</p>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-romantic-text/10">
                <span className="font-bold text-romantic-accent">3. Entrega y sorprende</span>
                <p className="text-romantic-text/70 mt-1">Imprime el QR para acompañar tus flores o envía el link directamente por WhatsApp.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Header & CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-2xl font-bold">Mis Dedicatorias</h2>
            <p className="text-xs text-romantic-text/50 mt-1">
              Administra tus regalos digitales. Puedes editar cada dedicatoria durante las primeras 24 horas.
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="bg-romantic-accent hover:bg-romantic-accent-hover text-white px-5 py-2.5 rounded-full font-bold shadow-md text-sm flex items-center gap-2 transition-all hover:scale-105 cursor-pointer flex-shrink-0"
          >
            <Plus size={16} /> Nueva Dedicatoria
          </button>
        </div>

        {/* Dedications List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-romantic-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-romantic-text/50">Cargando tus dedicatorias...</p>
          </div>
        ) : dedications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-romantic-card rounded-2xl border border-[#F2E8D5] shadow-sm"
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
            {dedications.map((ded, idx) => {
              const canEdit = isEditable(ded.createdAt);
              return (
                <motion.div
                  key={ded.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-romantic-card rounded-2xl border border-[#F2E8D5] shadow-sm p-5 hover:shadow-md transition-shadow relative"
                >
                  <div className="flex items-start gap-3 mb-4">
                    {ded.mainPhoto ? (
                      <img
                        src={ded.mainPhoto}
                        alt={ded.partnerName}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-romantic-text/10"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-romantic-accent/10 flex items-center justify-center flex-shrink-0 text-romantic-accent">
                        <Heart size={20} fill="currentColor" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-serif font-bold text-sm truncate">{ded.title || 'Sin título'}</h4>
                      <p className="text-[11px] text-romantic-text/60 truncate">
                        Para <strong>{ded.partnerName}</strong> · de {ded.senderName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-romantic-text/40">
                          {new Date(ded.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {canEdit && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5 border border-amber-200">
                            <Clock size={9} /> Editable (24h)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-romantic-text/10">
                    <button
                      onClick={() => onViewDedication(ded.slug)}
                      className="flex items-center gap-1 text-[11px] font-semibold bg-romantic-accent/10 text-romantic-accent px-3 py-1.5 rounded-full hover:bg-romantic-accent/20 transition-colors cursor-pointer"
                    >
                      <ExternalLink size={12} /> Ver
                    </button>

                    {canEdit && onEditDedication && (
                      <button
                        onClick={() => onEditDedication(ded)}
                        className="flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors cursor-pointer border border-amber-200"
                        title="Puedes editar esta dedicatoria durante 24 horas"
                      >
                        <Edit3 size={12} /> Editar
                      </button>
                    )}

                    <button
                      onClick={() => handleCopyLink(ded.slug)}
                      className="flex items-center gap-1 text-[11px] font-semibold bg-romantic-text/5 text-romantic-text/70 px-3 py-1.5 rounded-full hover:bg-romantic-text/10 transition-colors cursor-pointer"
                    >
                      {copiedSlug === ded.slug ? (
                        <><Check size={12} className="text-green-600" /> Copiado</>
                      ) : (
                        <><Copy size={12} /> Copiar link</>
                      )}
                    </button>

                    <button
                      onClick={() => setPrintDedication(ded)}
                      className="flex items-center gap-1 text-[11px] font-semibold bg-romantic-text/5 text-romantic-text/70 px-3 py-1.5 rounded-full hover:bg-romantic-text/10 transition-colors cursor-pointer"
                    >
                      <Printer size={12} /> Tarjeta QR
                    </button>
                  </div>
                </motion.div>
              );
            })}
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
