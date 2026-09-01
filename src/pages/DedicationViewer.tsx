import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Volume2, VolumeX, Play, Pause, ArrowLeft, Printer, Sparkles, Gift } from 'lucide-react';
import { Petals } from '../components/Petals';
import { TimeCounter } from '../components/TimeCounter';
import { PhotoGallery } from '../components/PhotoGallery';
import { ScratchCoupon } from '../components/ScratchCoupon';
import { PrintableCardModal } from '../components/PrintableCardModal';
import { DedicationData } from '../types/dedication';

interface DedicationViewerProps {
  data: DedicationData;
  onBackToHome?: () => void;
}

export const DedicationViewer: React.FC<DedicationViewerProps> = ({ data, onBackToHome }) => {
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const letterRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const startDate = new Date(data.startDate);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleAccept = () => {
    setIsAccepted(true);
    setIsPlaying(true);
    setIsMuted(false);
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-romantic-bg text-romantic-text font-sans selection:bg-romantic-accent selection:text-white pb-24 overflow-x-hidden relative">
      <Petals active={isAccepted} />

      {/* Top Bar Navigation */}
      <div className="absolute top-6 left-6 z-40 flex items-center gap-2">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-romantic-accent border border-romantic-text/10 shadow-sm hover:bg-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Inicio
          </button>
        )}
        <button
          onClick={() => setIsPrintModalOpen(true)}
          className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-romantic-accent border border-romantic-text/10 shadow-sm hover:bg-white transition-colors cursor-pointer"
          title="Ver tarjeta imprimible con Código QR"
        >
          <Printer size={14} /> Tarjeta QR
        </button>
      </div>

      {/* Audio Floating Controls */}
      {isAccepted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-6 right-6 z-50 flex items-center gap-1.5 bg-white/70 backdrop-blur-md p-1.5 px-3 rounded-full shadow-md border border-romantic-text/10"
        >
          <button
            onClick={togglePlayPause}
            className="p-2 rounded-full hover:bg-romantic-accent/10 transition-colors text-romantic-accent cursor-pointer flex items-center justify-center"
            aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
            title={isPlaying ? "Pausar música" : "Reproducir música"}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>

          <div className="w-[1px] h-4 bg-romantic-text/20" />

          <button
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-romantic-accent/10 transition-colors text-romantic-accent cursor-pointer flex items-center justify-center"
            aria-label={isMuted ? "Activar sonido" : "Silenciar"}
            title={isMuted ? "Activar sonido" : "Silenciar"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </motion.div>
      )}

      {/* Audio Player (HTML5 or YouTube iframe) */}
      {isAccepted && (
        data.audioType === 'youtube' ? (
          (() => {
            const match = data.audioUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
            const videoId = match && match[2].length === 11 ? match[2] : null;
            return videoId ? (
              <div className="hidden">
                <iframe
                  width="1"
                  height="1"
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0`}
                  title="Música de fondo YouTube"
                  allow="autoplay"
                />
              </div>
            ) : null;
          })()
        ) : (
          <audio
            ref={audioRef}
            src={data.audioUrl}
            autoPlay
            loop
            preload="auto"
            className="hidden"
          />
        )
      )}

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-16 flex flex-col items-center">
        
        {/* Intro Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full flex flex-col items-center"
        >
          <h1 className="font-serif text-2xl sm:text-3xl mb-6 sm:mb-8 italic text-romantic-text/80 text-center">
            {data.title || 'Hay algo que quiero decirte...'}
          </h1>
          
          <div className="polaroid mb-10 sm:mb-12 w-56 sm:w-64 md:w-72 shadow-xl">
            <img 
              src={data.mainPhoto} 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518193498966-2401dc291242?q=80&w=600&auto=format&fit=crop";
              }}
              alt={`${data.senderName} y ${data.partnerName}`} 
              className="w-full aspect-square object-cover"
            />
            <div className="text-center mt-4 font-serif text-lg italic text-romantic-text/80">
              {data.senderName} y {data.partnerName}
            </div>
          </div>
        </motion.div>

        {/* Letter Section */}
        <motion.div 
          ref={letterRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full max-w-md relative"
        >
          <AnimatePresence mode="wait">
            {!isLetterOpen ? (
              <motion.button
                key="closed-letter"
                onClick={() => setIsLetterOpen(true)}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="w-full max-w-sm mx-auto relative group cursor-pointer flex flex-col items-center"
              >
                {/* Envelope Body */}
                <div className="relative w-full aspect-[3/2] bg-[#F5EEDC] rounded-lg shadow-lg overflow-visible border border-[#E8DCC4] transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                  {/* Flaps */}
                  <div className="absolute inset-0 bg-[#F2EAC8] rounded-t-lg" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 55%)' }}></div>
                  <div className="absolute inset-0 bg-[#FDF8E7] rounded-l-lg" style={{ clipPath: 'polygon(0 0, 50% 55%, 0 100%)' }}></div>
                  <div className="absolute inset-0 bg-[#FDF8E7] rounded-r-lg" style={{ clipPath: 'polygon(100% 0, 50% 55%, 100% 100%)' }}></div>
                  <div className="absolute inset-0 bg-[#FFFBF0] rounded-b-lg" style={{ clipPath: 'polygon(0 100%, 50% 55%, 100% 100%)' }}></div>
                  
                  {/* Wax Seal */}
                  <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-[#A32020] rounded-full shadow-[0_3px_10px_rgba(0,0,0,0.3)] flex items-center justify-center z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                    <Heart className="text-[#FDF8E7] w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
                  </div>
                </div>

                <div className="mt-8 text-center text-romantic-accent/80 font-sans text-xs md:text-sm tracking-[0.2em] uppercase font-semibold">
                  Descúbrelo - Hay algo dentro para ti
                </div>
              </motion.button>
            ) : (
              <motion.div
                key="open-letter"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full bg-romantic-card rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border border-[#F2E8D5] relative"
              >
                <div className="absolute inset-0 border border-[#E8DCC4] m-2 sm:m-3 rounded-xl opacity-50 pointer-events-none" />
                
                <div className="relative z-10 font-serif leading-relaxed text-base sm:text-lg space-y-4 sm:space-y-6">
                  <p className="italic text-romantic-accent text-lg sm:text-xl">
                    {data.letterTitle || `Hola ${data.partnerName}, mi amor.`}
                  </p>
                  
                  {data.letterContent.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                  
                  <div className="pt-6 sm:pt-8 text-center border-t border-romantic-text/10 mt-6 sm:mt-8">
                    <h2 className="text-xl sm:text-2xl italic mb-6 sm:mb-8 px-2">
                      {data.question || '¿Quieres seguir caminando conmigo de la mano?'}
                    </h2>
                    
                    {!isAccepted ? (
                      <button 
                        onClick={handleAccept}
                        className="bg-romantic-accent hover:bg-romantic-accent-hover text-white px-6 sm:px-8 py-3 rounded-full font-sans tracking-wide transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
                      >
                        Sí, acepto <Heart size={18} fill="currentColor" />
                      </button>
                    ) : (
                      <div className="text-romantic-accent font-serif italic text-lg sm:text-xl flex items-center justify-center gap-2">
                        {data.answerYesText || 'Sabía que dirías que sí'} <Heart size={20} fill="currentColor" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Revealed Content after Acceptance */}
        <AnimatePresence>
          {isAccepted && (
            <motion.div 
              ref={contentRef}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="w-full mt-16"
            >
              <div className="w-full max-w-2xl mx-auto">
                <TimeCounter startDate={startDate} />
              </div>

              {/* Scratch Coupons Section */}
              {data.coupons && data.coupons.length > 0 && (
                <div className="mt-12 sm:mt-16 w-full">
                  <h2 className="font-serif text-2xl sm:text-3xl text-center mb-8 italic flex items-center justify-center gap-2">
                    <Gift className="text-romantic-accent" size={24} /> Cupones de Regalo
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {data.coupons.map((coupon) => (
                      <ScratchCoupon
                        key={coupon.id}
                        coupon={coupon}
                        partnerName={data.partnerName}
                        senderName={data.senderName}
                        whatsappNumber={data.whatsapp}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Photo Galleries */}
              {data.galleries && data.galleries.length > 0 && (
                <div className="mt-12 sm:mt-16 w-full">
                  <h2 className="font-serif text-2xl sm:text-3xl text-center mb-8 sm:mb-12 italic">Nuestros Momentos</h2>
                  
                  <div className={`grid grid-cols-1 sm:grid-cols-2 ${data.galleries.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6 sm:gap-8`}>
                    {data.galleries.map((gallery) => (
                      <PhotoGallery 
                        key={gallery.id}
                        title={gallery.title}
                        coverImage={gallery.coverImage}
                        images={gallery.images}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Viral Growth Loop Link */}
        <footer className="mt-24 text-center border-t border-romantic-text/10 pt-8 pb-4 w-full">
          <a
            href="#/crear"
            className="inline-flex items-center gap-1.5 text-xs text-romantic-text/60 hover:text-romantic-accent transition-colors font-medium cursor-pointer"
          >
            <Sparkles size={14} className="text-romantic-accent" />
            ¿Quieres sorprender a tu persona favorita? <span className="underline font-bold text-romantic-accent">Crea tu carta en 2 minutos</span>
          </a>
        </footer>
      </main>

      {/* Printable Card Modal */}
      <PrintableCardModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        dedication={data}
      />
    </div>
  );
};
