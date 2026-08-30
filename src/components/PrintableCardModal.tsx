import React from 'react';
import { motion } from 'motion/react';
import { X, Printer, Heart } from 'lucide-react';
import { DedicationData } from '../types/dedication';

interface PrintableCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  dedication: DedicationData;
}

export const PrintableCardModal: React.FC<PrintableCardModalProps> = ({ isOpen, onClose, dedication }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentUrl = `${window.location.origin}${window.location.pathname}#/d/${dedication.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl relative my-8 print:p-0 print:shadow-none print:max-w-none print:w-full print:m-0"
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between mb-4 print:hidden">
          <span className="font-serif italic text-lg font-bold text-romantic-accent flex items-center gap-1.5">
            <Heart size={18} fill="currentColor" /> Tarjeta Física Imprimible
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-romantic-accent text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow hover:bg-romantic-accent-hover flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} /> Imprimir / Guardar PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Card Frame */}
        <div className="border-4 border-double border-romantic-accent/40 rounded-2xl p-8 text-center bg-[#FFFBF5] shadow-inner print:border-4 print:border-romantic-accent print:rounded-none">
          <div className="w-10 h-10 bg-romantic-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 text-romantic-accent">
            <Heart size={20} fill="currentColor" />
          </div>

          <h2 className="font-serif italic text-2xl font-bold text-romantic-accent mb-1">
            Una sorpresa especial para ti
          </h2>
          <p className="text-sm font-semibold text-romantic-text/80 mb-6">
            Para {dedication.partnerName} de parte de {dedication.senderName}
          </p>

          <div className="bg-white p-4 rounded-2xl shadow-md border border-romantic-accent/20 inline-block mb-6">
            <img src={qrUrl} alt="Código QR de la dedicatoria" className="w-48 h-48 mx-auto" />
          </div>

          <p className="font-sans text-xs text-romantic-text/70 leading-relaxed max-w-xs mx-auto mb-4">
            📷 Escanea este Código QR con la cámara de tu celular para abrir tu dedicatoria interactiva.
          </p>

          <div className="text-[10px] text-romantic-text/40 font-mono pt-4 border-t border-romantic-text/10">
            {currentUrl}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
