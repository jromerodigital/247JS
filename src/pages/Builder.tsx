import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Music, Image as ImageIcon, Upload, Check, ArrowRight, ArrowLeft, Trash2, QrCode, Play, Pause, ExternalLink } from 'lucide-react';
import { DedicationData, PhotoGalleryData } from '../types/dedication';
import { PRELOADED_AUDIO_TRACKS } from '../data/audioTracks';
import { enhanceRomanticLetter } from '../services/gemini';
import { cropAndCompressImage } from '../utils/imageCropper';

interface BuilderProps {
  onSave: (dedication: DedicationData) => void;
  onCancel: () => void;
}

export const Builder: React.FC<BuilderProps> = ({ onSave, onCancel }) => {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [partnerName, setPartnerName] = useState('Susana');
  const [senderName, setSenderName] = useState('Jorge');
  const [title, setTitle] = useState('Hay algo que quiero decirte...');
  const [startDate, setStartDate] = useState('2026-07-24');
  const [mainPhoto, setMainPhoto] = useState<string>('./Fotos/Principal.jpeg');
  
  // Letter & AI State
  const [letterTitle, setLetterTitle] = useState('Para ti, Misu:');
  const [rawLetterInput, setRawLetterInput] = useState('');
  const [letterParagraphs, setLetterParagraphs] = useState<string[]>([
    'Solo quiero robarte unos minutitos de tu día para decirte algo especial. Quiero desearte una hermosa semana y un lindo regreso al trabajo.',
    'Quiero seguir a tu lado para seguir haciendo crecer esto tan lindo que estamos construyendo. Mi amor por ti es indescriptible.',
    'Me pierdo en tu mirada, en tus gestos y en esa sonrisa tuya que me encanta.',
    'Sé que el camino no siempre es fácil, pero cuando el destino es compartir una vida infinita contigo, cualquier reto vale la pena.',
    'Por todo esto, solo quiero reafirmar cuánto te amo y pedirte que me respondas la siguiente pregunta, mi amor...'
  ]);
  const [aiAttemptsLeft, setAiAttemptsLeft] = useState(3);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Audio State
  const [audioChoice, setAudioChoice] = useState<'preloaded' | 'custom'>('preloaded');
  const [selectedPreloadedId, setSelectedPreloadedId] = useState(PRELOADED_AUDIO_TRACKS[0].id);
  const [customAudioUrl, setCustomAudioUrl] = useState<string>('./musica.mp3');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Albums State (Galleries)
  const [galleries, setGalleries] = useState<PhotoGalleryData[]>([
    {
      id: 'g1',
      title: 'Por más viajes juntos',
      coverImage: './Fotos/viajes.JPG',
      images: ['./Fotos/viajes.JPG']
    },
    {
      id: 'g2',
      title: 'Más salidas',
      coverImage: './Fotos/salidas.jpeg',
      images: ['./Fotos/salidas.jpeg']
    },
    {
      id: 'g3',
      title: 'Te amo',
      coverImage: './Fotos/Te%20amo.jpeg',
      images: ['./Fotos/Te%20amo.jpeg']
    }
  ]);

  // Slug & Final State
  const [slug, setSlug] = useState('nuestro-amor');
  const [newGalleryTitle, setNewGalleryTitle] = useState('');

  // Handle Main Photo Upload
  const handleMainPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const croppedBase64 = await cropAndCompressImage(file, 800);
        setMainPhoto(croppedBase64);
      } catch (err) {
        alert('Error al procesar la imagen principal. Intenta con otra foto.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // AI Generation
  const handleAiEnhance = async () => {
    if (aiAttemptsLeft <= 0) {
      alert('Has agotado los 3 intentos de IA. Puedes editar el texto manualmente a tu gusto.');
      return;
    }

    if (!rawLetterInput.trim()) {
      alert('Escribe unas breves palabras o una idea básica de lo que sientes para que la IA la convierta en poema.');
      return;
    }

    setIsAiLoading(true);
    try {
      const resultText = await enhanceRomanticLetter(rawLetterInput);
      const paragraphs = resultText.split('\n\n').filter(p => p.trim().length > 0);
      setLetterParagraphs(paragraphs);
      setAiAttemptsLeft(prev => prev - 1);
    } catch (err) {
      alert('Hubo un problema al conectar con la IA. Inténtalo de nuevo.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Handle MP3 Upload
  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('El archivo MP3 excede el límite recomendado de 15MB.');
        return;
      }
      const url = URL.createObjectURL(file);
      setCustomAudioUrl(url);
      setAudioChoice('custom');
    }
  };

  // Add New Gallery
  const handleAddGallery = () => {
    if (galleries.length >= 4) {
      alert('El límite máximo es de 4 álbumes de fotos.');
      return;
    }
    if (!newGalleryTitle.trim()) {
      alert('Escribe un título para el nuevo álbum.');
      return;
    }

    const newGallery: PhotoGalleryData = {
      id: `g_${Date.now()}`,
      title: newGalleryTitle.trim(),
      coverImage: 'https://images.unsplash.com/photo-1518193498966-2401dc291242?q=80&w=600&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1518193498966-2401dc291242?q=80&w=600&auto=format&fit=crop']
    };

    setGalleries([...galleries, newGallery]);
    setNewGalleryTitle('');
  };

  // Add Photo to Gallery
  const handleAddPhotoToGallery = async (galleryId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const gallery = galleries.find(g => g.id === galleryId);
    if (gallery && gallery.images.length >= 5) {
      alert('Cada álbum permite un máximo de 5 fotos.');
      return;
    }

    setIsProcessing(true);
    try {
      const croppedBase64 = await cropAndCompressImage(file, 800);
      setGalleries(prev => prev.map(g => {
        if (g.id === galleryId) {
          const updatedImages = [...g.images, croppedBase64];
          return {
            ...g,
            images: updatedImages,
            coverImage: g.images.length === 0 ? croppedBase64 : g.coverImage
          };
        }
        return g;
      }));
    } catch (err) {
      alert('Error al procesar la foto.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete Photo from Gallery
  const handleDeletePhoto = (galleryId: string, photoIndex: number) => {
    setGalleries(prev => prev.map(g => {
      if (g.id === galleryId) {
        const newImages = g.images.filter((_, idx) => idx !== photoIndex);
        return {
          ...g,
          images: newImages,
          coverImage: newImages.length > 0 ? (newImages.includes(g.coverImage) ? g.coverImage : newImages[0]) : ''
        };
      }
      return g;
    }));
  };

  // Set Cover Photo
  const handleSetCoverPhoto = (galleryId: string, photoUrl: string) => {
    setGalleries(prev => prev.map(g => {
      if (g.id === galleryId) {
        return { ...g, coverImage: photoUrl };
      }
      return g;
    }));
  };

  // Finish and Save
  const handleComplete = () => {
    const activeAudioUrl = audioChoice === 'preloaded'
      ? (PRELOADED_AUDIO_TRACKS.find(t => t.id === selectedPreloadedId)?.url || PRELOADED_AUDIO_TRACKS[0].url)
      : customAudioUrl;

    const finalSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const finalData: DedicationData = {
      id: `ded_${Date.now()}`,
      slug: finalSlug || `amor-${Date.now()}`,
      partnerName,
      senderName,
      title,
      startDate,
      mainPhoto,
      letterTitle,
      letterContent: letterParagraphs,
      question: '¿Quieres seguir caminando conmigo de la mano?',
      answerYesText: 'Sabía que dirías que sí',
      audioUrl: activeAudioUrl,
      audioType: audioChoice,
      galleries,
      createdAt: Date.now()
    };

    onSave(finalData);
  };

  return (
    <div className="min-h-screen bg-romantic-bg text-romantic-text font-sans p-4 sm:p-6 md:p-8 flex flex-col items-center">
      {/* Top Bar Navigation */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-8">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-romantic-accent hover:underline font-medium text-sm sm:text-base cursor-pointer"
        >
          <ArrowLeft size={18} /> Volver al Inicio
        </button>
        <span className="font-serif italic text-lg sm:text-xl font-bold text-romantic-accent flex items-center gap-2">
          <Heart size={20} fill="currentColor" /> Creador Romántico
        </span>
      </div>

      {/* Progress Stepper */}
      <div className="w-full max-w-3xl bg-white/60 backdrop-blur-md rounded-full p-2 mb-8 shadow-sm border border-romantic-text/10 flex items-center justify-between text-xs sm:text-sm font-semibold">
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <button
            key={num}
            onClick={() => setStep(num)}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
              step === num
                ? 'bg-romantic-accent text-white shadow-md scale-110'
                : step > num
                ? 'bg-romantic-accent/20 text-romantic-accent'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {step > num ? <Check size={16} /> : num}
          </button>
        ))}
      </div>

      {/* Form Container */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-3xl bg-romantic-card rounded-2xl p-6 sm:p-8 shadow-xl border border-[#F2E8D5]"
      >
        {/* STEP 1: General Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl text-romantic-accent italic text-center mb-6">
              1. Los Protagonistas de la Historia
            </h2>

            <div>
              <label className="block text-sm font-semibold mb-2 text-romantic-text/80">Nombre de tu Pareja (Persona Favorita)</label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Ej. Susana, Misu..."
                className="w-full p-3 rounded-xl border border-romantic-text/20 bg-white focus:outline-none focus:border-romantic-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-romantic-text/80">Tu Nombre (Remitente)</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Ej. Jorge"
                className="w-full p-3 rounded-xl border border-romantic-text/20 bg-white focus:outline-none focus:border-romantic-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-romantic-text/80">Fecha Especial / Aniversario</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-romantic-text/20 bg-white focus:outline-none focus:border-romantic-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-romantic-text/80">Título de la Carta</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Hay algo que quiero decirte..."
                className="w-full p-3 rounded-xl border border-romantic-text/20 bg-white focus:outline-none focus:border-romantic-accent"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Main Photo */}
        {step === 2 && (
          <div className="space-y-6 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl text-romantic-accent italic mb-4">
              2. Foto Principal de la Polaroid
            </h2>

            <div className="polaroid mx-auto w-64 sm:w-72 shadow-lg">
              <img
                src={mainPhoto}
                alt="Foto principal"
                className="w-full aspect-square object-cover rounded-md"
              />
              <div className="text-center mt-3 font-serif text-lg italic text-romantic-text/80">
                {senderName} y {partnerName}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <label className="bg-romantic-accent hover:bg-romantic-accent-hover text-white px-6 py-3 rounded-full font-medium cursor-pointer shadow-md flex items-center gap-2 transition-transform hover:scale-105">
                <Upload size={18} /> Subir Foto de Portada (Recorte 1x1)
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainPhotoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-romantic-text/60">
                💡 Se recortará y optimizará automáticamente a formato cuadrado (1x1).
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Letter & AI Assistant */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl text-romantic-accent italic text-center mb-4">
              3. Mensaje Romántico & Asistente IA
            </h2>

            <div className="bg-white/80 p-4 rounded-xl border border-romantic-accent/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm flex items-center gap-1.5 text-romantic-accent">
                  <Sparkles size={16} /> Inspirador IA Poético
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-romantic-accent/10 text-romantic-accent">
                  {aiAttemptsLeft} {aiAttemptsLeft === 1 ? 'intento restante' : 'intentos restantes'}
                </span>
              </div>
              <p className="text-xs text-romantic-text/70 mb-3">
                Escribe una idea simple o palabras clave de lo que sientes y la IA las convertirá en una carta poética inolvidable.
              </p>
              
              <textarea
                value={rawLetterInput}
                onChange={(e) => setRawLetterInput(e.target.value)}
                placeholder="Ej. Quiero desearle buena semana, agradecerle por el lindo fin de semana juntos y recordarle que la amo muchísimo..."
                rows={3}
                className="w-full p-3 rounded-lg border border-romantic-text/20 bg-white text-sm focus:outline-none focus:border-romantic-accent mb-3"
              />

              <button
                onClick={handleAiEnhance}
                disabled={isAiLoading || aiAttemptsLeft <= 0}
                className="bg-romantic-accent text-white px-4 py-2 rounded-full text-xs font-semibold shadow flex items-center gap-1.5 hover:bg-romantic-accent-hover transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isAiLoading ? '✨ Transformando con magia poética...' : '✨ Embellecer con IA'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-romantic-text/80">Salida de la Carta (Párrafos)</label>
              {letterParagraphs.map((paragraph, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  <textarea
                    value={paragraph}
                    onChange={(e) => {
                      const updated = [...letterParagraphs];
                      updated[index] = e.target.value;
                      setLetterParagraphs(updated);
                    }}
                    rows={2}
                    className="w-full p-3 rounded-xl border border-romantic-text/20 bg-white text-sm font-serif italic focus:outline-none focus:border-romantic-accent"
                  />
                  <button
                    onClick={() => setLetterParagraphs(letterParagraphs.filter((_, idx) => idx !== index))}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar párrafo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button
                onClick={() => setLetterParagraphs([...letterParagraphs, 'Nuevo párrafo romántico...'])}
                className="text-xs text-romantic-accent font-semibold hover:underline mt-2 cursor-pointer"
              >
                + Agregar otro párrafo
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Music Selection */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl text-romantic-accent italic text-center mb-6">
              4. Música de Fondo
            </h2>

            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setAudioChoice('preloaded')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  audioChoice === 'preloaded'
                    ? 'bg-romantic-accent text-white shadow-md'
                    : 'bg-white text-romantic-text/70 border border-romantic-text/10'
                }`}
              >
                🎵 Canciones Precargadas
              </button>
              <button
                onClick={() => setAudioChoice('custom')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  audioChoice === 'custom'
                    ? 'bg-romantic-accent text-white shadow-md'
                    : 'bg-white text-romantic-text/70 border border-romantic-text/10'
                }`}
              >
                📁 Subir mi propio MP3
              </button>
            </div>

            {audioChoice === 'preloaded' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PRELOADED_AUDIO_TRACKS.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => setSelectedPreloadedId(track.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedPreloadedId === track.id
                        ? 'border-romantic-accent bg-romantic-accent/10 shadow-md'
                        : 'border-romantic-text/10 bg-white hover:border-romantic-accent/50'
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-sm text-romantic-text">{track.name}</h4>
                      <p className="text-xs text-romantic-text/60">{track.artist}</p>
                    </div>
                    {selectedPreloadedId === track.id && (
                      <Check className="text-romantic-accent" size={20} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 border-2 border-dashed border-romantic-accent/30 rounded-2xl bg-white/50">
                <Music className="w-12 h-12 text-romantic-accent mx-auto mb-3" />
                <h4 className="font-semibold text-sm mb-2">Selecciona un archivo MP3 de tu computadora</h4>
                <label className="bg-romantic-accent hover:bg-romantic-accent-hover text-white px-5 py-2.5 rounded-full text-xs font-semibold cursor-pointer shadow inline-block transition-transform hover:scale-105">
                  Seleccionar MP3
                  <input
                    type="file"
                    accept="audio/mp3,audio/*"
                    onChange={handleCustomAudioUpload}
                    className="hidden"
                  />
                </label>
                {customAudioUrl && (
                  <p className="text-xs text-green-600 font-semibold mt-3">
                    ✓ Archivo listo para reproducir en tu dedicatoria.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Albums / Galleries */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl text-romantic-accent italic text-center mb-6">
              5. Álbumes de Fotos ("Nuestros Momentos")
            </h2>

            {/* Add Album Input */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newGalleryTitle}
                onChange={(e) => setNewGalleryTitle(e.target.value)}
                placeholder="Nombre del nuevo álbum (ej. Viajes juntos, Salidas...)"
                className="w-full p-3 rounded-xl border border-romantic-text/20 bg-white text-sm focus:outline-none focus:border-romantic-accent"
              />
              <button
                onClick={handleAddGallery}
                className="bg-romantic-accent text-white px-5 py-3 rounded-xl text-xs font-semibold shadow hover:bg-romantic-accent-hover whitespace-nowrap cursor-pointer"
              >
                + Crear Álbum
              </button>
            </div>

            {/* Albums List */}
            <div className="space-y-6">
              {galleries.map((gallery) => (
                <div key={gallery.id} className="p-4 bg-white/80 rounded-2xl border border-romantic-text/10 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif italic font-bold text-lg text-romantic-accent">
                      {gallery.title}
                    </h3>
                    <button
                      onClick={() => setGalleries(galleries.filter(g => g.id !== gallery.id))}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={14} /> Eliminar Álbum
                    </button>
                  </div>

                  {/* Photo Thumbnails */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                    {gallery.images.map((imgUrl, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                        <img src={imgUrl} alt={`Foto ${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSetCoverPhoto(gallery.id, imgUrl)}
                            className={`p-1 rounded-full ${gallery.coverImage === imgUrl ? 'bg-green-500 text-white' : 'bg-white text-gray-800'}`}
                            title="Marcar como Portada"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => handleDeletePhoto(gallery.id, idx)}
                            className="p-1 rounded-full bg-red-500 text-white"
                            title="Eliminar foto"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {gallery.images.length < 5 && (
                      <label className="border-2 border-dashed border-romantic-accent/40 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-romantic-accent/5 aspect-square text-romantic-accent text-xs font-semibold p-2 text-center">
                        <Upload size={16} className="mb-1" /> + Foto
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAddPhotoToGallery(gallery.id, e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-[11px] text-romantic-text/60 italic">
                    * Muestra máxima 5 fotos por álbum. Fotos en formato 1x1.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: Finalize & URL */}
        {step === 6 && (
          <div className="space-y-6 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl text-romantic-accent italic mb-4">
              6. Genera tu Enlace Especial
            </h2>

            <div className="bg-white p-6 rounded-2xl border border-romantic-text/10 shadow-sm text-left">
              <label className="block text-sm font-semibold mb-2 text-romantic-text/80">URL Personalizada de la Dedicatoria</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-romantic-text/60 font-mono bg-gray-100 p-3 rounded-xl border border-romantic-text/10">
                  jromerodigital.github.io/247JS/#/d/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="jorge-y-susana"
                  className="w-full p-3 rounded-xl border border-romantic-text/20 bg-white text-sm font-semibold text-romantic-accent focus:outline-none"
                />
              </div>
            </div>

            <div className="p-6 bg-romantic-accent/5 rounded-2xl border border-romantic-accent/20 flex flex-col items-center">
              <QrCode className="w-16 h-16 text-romantic-accent mb-3" />
              <h4 className="font-semibold text-sm mb-1">¡Listo para publicar y sorprender!</h4>
              <p className="text-xs text-romantic-text/70 mb-4 max-w-md">
                Se guardará tu dedicatoria con el enlace personalizado elegido. Podrás compartir el link o imprimir el Código QR para obsequiarlo en una carta física.
              </p>
              
              <button
                onClick={handleComplete}
                className="bg-romantic-accent hover:bg-romantic-accent-hover text-white px-8 py-3.5 rounded-full font-bold shadow-lg flex items-center gap-2 text-base transition-transform hover:scale-105 cursor-pointer"
              >
                💖 Publicar mi Dedicatoria
              </button>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-romantic-text/10 mt-8">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2.5 rounded-full border border-romantic-text/20 text-romantic-text/80 font-semibold text-sm hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft size={16} /> Anterior
            </button>
          ) : <div />}

          {step < 6 && (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-full bg-romantic-accent text-white font-semibold text-sm hover:bg-romantic-accent-hover shadow transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5"
            >
              Siguiente <ArrowRight size={16} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
