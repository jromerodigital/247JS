import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Petals } from './components/Petals';
import { TimeCounter } from './components/TimeCounter';
import { PhotoGallery } from './components/PhotoGallery';

export default function App() {
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const startDate = new Date('2026-07-24T00:00:00'); // 24 de Julio 2026

  const sendCommand = (func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func,
          args,
        }),
        '*'
      );
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      sendCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      sendCommand('playVideo');
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      sendCommand('unMute');
      setIsMuted(false);
    } else {
      sendCommand('mute');
      setIsMuted(true);
    }
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
    <div className="min-h-screen bg-romantic-bg text-romantic-text font-sans selection:bg-romantic-accent selection:text-white pb-24 overflow-x-hidden">
      <Petals active={isAccepted} />
      
      {/* Audio Controls */}
      {isAccepted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-6 right-6 z-50 flex items-center gap-1.5 bg-white/70 backdrop-blur-md p-1.5 px-3 rounded-full shadow-md border border-romantic-text/10"
        >
          {/* Play / Pause */}
          <button
            onClick={togglePlayPause}
            className="p-2 rounded-full hover:bg-romantic-accent/10 transition-colors text-romantic-accent cursor-pointer flex items-center justify-center"
            aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
            title={isPlaying ? "Pausar música" : "Reproducir música"}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>

          <div className="w-[1px] h-4 bg-romantic-text/20" />

          {/* Volume / Mute */}
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

      {/* Hidden Audio Player (Kept mounted after acceptance to preserve playback position) */}
      {isAccepted && (
        <iframe
          ref={iframeRef}
          src="https://www.youtube-nocookie.com/embed/9uB1Bl2SVBs?autoplay=1&enablejsapi=1&loop=1&playlist=9uB1Bl2SVBs"
          title="Música de fondo"
          allow="autoplay; encrypted-media"
          className="fixed -top-[1000px] -left-[1000px] w-1 h-1 opacity-0 pointer-events-none border-0"
        />
      )}

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 flex flex-col items-center">
        
        {/* Intro Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full flex flex-col items-center"
        >
          <h1 className="font-serif text-2xl sm:text-3xl mb-6 sm:mb-8 italic text-romantic-text/80 text-center">Hay algo que quiero decirte...</h1>
          
          <div className="polaroid mb-10 sm:mb-12 w-56 sm:w-64 md:w-72">
            <img 
              src="/Fotos/Principal.jpeg" 
              onError={(e) => {
                // Fallback a la imagen de Unsplash si no se carga la foto local
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518193498966-2401dc291242?q=80&w=600&auto=format&fit=crop";
              }}
              alt="Jorge y Susana" 
              className="w-full aspect-square object-cover"
            />
            <div className="text-center mt-4 font-serif text-lg italic text-romantic-text/80">
              Jorge y Susana
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
                  {/* Envelope Flaps */}
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
                  <p className="italic text-romantic-accent text-lg sm:text-xl">Para ti, Misu:</p>
                  
                  <p>
                    Hay momentos en los que me quedo atrapado en la luz de tu mirada, en los pequeños gestos que te hacen única y en esa sonrisa que me da paz. Me pierdo completamente en ti.
                  </p>
                  
                  <p>
                    Hemos vivido muchísimo en muy poco tiempo, pero sé que esto es solo el inicio de todo lo lindo que estamos construyendo juntos. Y aunque a veces suelo ser un poco torpe, hoy quiero decirte, más que nunca, que te amo; te prometo que encontraré mil y un formas de demostrártelo.
                  </p>
                  
                  <p>
                    Sé que el camino no siempre es fácil, pero cuando el destino es compartir una vida infinita contigo, cualquier reto vale la pena.
                  </p>

                  <p>
                    Por todo esto, solo quiero reafirmar cuánto te amo y pedirte que me respondas la siguiente pregunta, mi amor...
                  </p>
                  
                  <div className="pt-6 sm:pt-8 text-center border-t border-romantic-text/10 mt-6 sm:mt-8">
                    <h2 className="text-xl sm:text-2xl italic mb-6 sm:mb-8 px-2">¿Quieres seguir caminando conmigo de la mano?</h2>
                    
                    {!isAccepted ? (
                      <button 
                        onClick={handleAccept}
                        className="bg-romantic-accent hover:bg-romantic-accent-hover text-white px-6 sm:px-8 py-3 rounded-full font-sans tracking-wide transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2 mx-auto"
                      >
                        Sí, acepto <Heart size={18} fill="currentColor" />
                      </button>
                    ) : (
                      <div className="text-romantic-accent font-serif italic text-lg sm:text-xl flex items-center justify-center gap-2">
                        Sabía que dirías que sí <Heart size={20} fill="currentColor" />
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

              <div className="mt-12 sm:mt-16 w-full">
                <h2 className="font-serif text-2xl sm:text-3xl text-center mb-8 sm:mb-12 italic">Nuestros Momentos</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
                  <PhotoGallery 
                    title="Por más viajes juntos" 
                    coverImage="/Fotos/viajes.JPG"
                    images={[
                      "/Fotos/viajes.JPG",
                      "/Fotos/Viajes/WhatsApp%20Image%202026-08-06%20at%206.43.09%20AM%20(1).jpeg",
                      "/Fotos/Viajes/WhatsApp%20Image%202026-08-06%20at%206.43.09%20AM.jpeg",
                      "/Fotos/Viajes/WhatsApp%20Image%202026-08-06%20at%206.43.10%20AM%20(1).jpeg",
                      "/Fotos/Viajes/WhatsApp%20Image%202026-08-06%20at%206.43.10%20AM%20(2).jpeg",
                      "/Fotos/Viajes/WhatsApp%20Image%202026-08-06%20at%206.43.10%20AM%20(3).jpeg",
                      "/Fotos/Viajes/WhatsApp%20Image%202026-08-06%20at%206.43.10%20AM.jpeg"
                    ]}
                  />
                  
                  <PhotoGallery 
                    title="Más salidas" 
                    coverImage="/Fotos/salidas.jpeg"
                    images={[
                      "/Fotos/salidas.jpeg",
                      "/Fotos/Salidas/WhatsApp%20Image%202026-08-06%20at%206.52.53%20AM%20(1).jpeg",
                      "/Fotos/Salidas/WhatsApp%20Image%202026-08-06%20at%206.52.53%20AM%20(2).jpeg",
                      "/Fotos/Salidas/WhatsApp%20Image%202026-08-06%20at%206.52.53%20AM%20(3).jpeg",
                      "/Fotos/Salidas/WhatsApp%20Image%202026-08-06%20at%206.52.53%20AM%20(4).jpeg",
                      "/Fotos/Salidas/WhatsApp%20Image%202026-08-06%20at%206.52.54%20AM%20(1).jpeg",
                      "/Fotos/Salidas/WhatsApp%20Image%202026-08-06%20at%206.52.54%20AM.jpeg"
                    ]}
                  />
                  
                  <PhotoGallery 
                    title="Te amo" 
                    coverImage="/Fotos/Te%20amo.jpeg"
                    images={[
                      "/Fotos/Te%20amo.jpeg",
                      "/Fotos/Te%20amo/WhatsApp%20Image%202026-08-06%20at%207.03.34%20AM.jpeg",
                      "/Fotos/Te%20amo/WhatsApp%20Image%202026-08-06%20at%207.03.35%20AM%20(1).jpeg",
                      "/Fotos/Te%20amo/WhatsApp%20Image%202026-08-06%20at%207.03.35%20AM%20(3).jpeg",
                      "/Fotos/Te%20amo/WhatsApp%20Image%202026-08-06%20at%207.03.35%20AM%20(4).jpeg",
                      "/Fotos/Te%20amo/WhatsApp%20Image%202026-08-06%20at%207.03.35%20AM.jpeg",
                      "/Fotos/Te%20amo/WhatsApp%20Image%202026-08-06%20at%207.03.36%20AM.jpeg",
                      "/Fotos/Te%20amo/ia.JPG"
                    ]}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

