import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Music, Upload, Check, ArrowRight, ArrowLeft, Trash2, QrCode, Play, Pause, Edit3, Image as ImageIcon, Sparkles, HelpCircle, Eye, Calendar, Gift, Star, X } from 'lucide-react';
import { DedicationData, PhotoGalleryData, ScratchCouponData } from '../types/dedication';
import { PRELOADED_AUDIO_TRACKS } from '../data/audioTracks';
import { enhanceRomanticLetter } from '../services/gemini';
import { cropAndCompressImage } from '../utils/imageCropper';
import { saveDedicationApi } from '../services/api';

interface BuilderProps {
  initialData?: DedicationData;
  onSave: (dedication: DedicationData) => void;
  onCancel: () => void;
}

export const Builder: React.FC<BuilderProps> = ({ initialData, onSave, onCancel }) => {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State (Neutral defaults with placeholders)
  const [partnerName, setPartnerName] = useState(initialData?.partnerName || '');
  const [senderName, setSenderName] = useState(initialData?.senderName || '');
  const [title, setTitle] = useState(initialData?.title || 'Un detalle especial para ti');
  const [startDate, setStartDate] = useState(initialData?.startDate || new Date().toISOString().split('T')[0]);
  
  // High quality HD romantic default photo
  const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1518193498966-2401dc291242?q=80&w=800&auto=format&fit=crop';
  const [mainPhoto, setMainPhoto] = useState<string>(initialData?.mainPhoto || DEFAULT_PHOTO);

  // Title AI Suggestions
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const TITLE_SUGGESTIONS = [
    'Un detalle especial para ti',
    'Por más momentos juntos',
    'Nuestra historia de amor',
    'Para el amor de mi vida',
  ];

  // Letter State
  const [letterTitle, setLetterTitle] = useState(initialData?.letterTitle || '');
  const [rawLetterInput, setRawLetterInput] = useState('');
  const [letterParagraphs, setLetterParagraphs] = useState<string[]>(
    initialData?.letterContent || [
      'Solo quiero robarte unos minutitos de tu día para decirte algo muy especial.',
      'Quiero recordar cuánto significas para mí y lo feliz que me hace compartir este camino a tu lado.',
      'Me pierdo en tu mirada, en tu sonrisa y en todo lo que estamos construyendo juntos.',
      'Te amo infinitamente y todos los días buscaré una nueva forma de demostrártelo.'
    ]
  );
  const [aiAttemptsLeft, setAiAttemptsLeft] = useState(3);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPreviewLetterOpen, setIsPreviewLetterOpen] = useState(false);

  // Audio State
  const [audioChoice, setAudioChoice] = useState<'preloaded' | 'custom' | 'youtube'>(initialData?.audioType || 'preloaded');
  const [selectedPreloadedId, setSelectedPreloadedId] = useState(PRELOADED_AUDIO_TRACKS[0].id);
  const [customAudioUrl, setCustomAudioUrl] = useState<string>(initialData?.audioUrl || '');
  const [youtubeUrl, setYoutubeUrl] = useState<string>(initialData?.audioType === 'youtube' ? initialData.audioUrl : '');
  const [youtubeTitle, setYoutubeTitle] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch YouTube Song Title via oEmbed API
  useEffect(() => {
    const match = youtubeUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    const ytId = match && match[2].length === 11 ? match[2] : null;

    if (ytId) {
      fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`)
        .then(res => res.json())
        .then(data => {
          if (data.title) setYoutubeTitle(data.title);
        })
        .catch(() => setYoutubeTitle(null));
    } else {
      setYoutubeTitle(null);
    }
  }, [youtubeUrl]);

  // WhatsApp state for coupons claim
  const [whatsappNumber, setWhatsappNumber] = useState<string>(initialData?.whatsapp || '');

  // Albums State (Max 4 albums, max 5 photos each)
  const [galleries, setGalleries] = useState<PhotoGalleryData[]>(
    initialData?.galleries || [
      {
        id: 'g1',
        title: 'Nuestros Recuerdos',
        coverImage: DEFAULT_PHOTO,
        images: [DEFAULT_PHOTO]
      }
    ]
  );
  const [editingTitleGalleryId, setEditingTitleGalleryId] = useState<string | null>(null);
  const [newGalleryTitle, setNewGalleryTitle] = useState('');

  // Coupons State (Optional Toggle)
  const [includeCoupons, setIncludeCoupons] = useState<boolean>(
    initialData?.coupons ? initialData.coupons.length > 0 : true
  );
  const [coupons, setCoupons] = useState<ScratchCouponData[]>(
    initialData?.coupons || [
      { id: 'c1', title: 'Cupón Romántico #1', rewardText: 'Vale por una cena romántica a la luz de las velas 🕯️' },
      { id: 'c2', title: 'Cupón Romántico #2', rewardText: 'Vale por un masaje relajante y mimos 💆‍♀️' }
    ]
  );
  const [showCouponHelp, setShowCouponHelp] = useState(false);

  // Auto-generated Slug
  const [slug, setSlug] = useState(initialData?.slug || '');

  // Auto-generate slug when names or date change if slug is not manually set
  useEffect(() => {
    if (!initialData?.slug && (partnerName || senderName)) {
      const cleanPartner = partnerName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanSender = senderName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanDate = startDate.replace(/-/g, '');
      const auto = [cleanPartner, cleanSender, cleanDate].filter(Boolean).join('-');
      setSlug(auto || `amor-${Date.now()}`);
    }
  }, [partnerName, senderName, startDate]);

  // Clean up audio preview when unmounting
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
    };
  }, [step]);

  const handleTogglePreviewTrack = (trackId: string, trackUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewTrackId === trackId) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      setPreviewTrackId(null);
    } else {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      const audio = new Audio(trackUrl);
      previewAudioRef.current = audio;
      audio.play().catch(() => {});
      setPreviewTrackId(trackId);
      audio.onended = () => setPreviewTrackId(null);
    }
  };

  // Main Photo Upload
  const handleMainPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const croppedBase64 = await cropAndCompressImage(file, 800, 800);
      setMainPhoto(croppedBase64);
    } catch (err) {
      alert('Error al procesar la foto principal.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Custom Song Upload with 8 MB limit
  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioError(null);

    const maxSizeBytes = 8 * 1024 * 1024; // 8 MB
    if (file.size > maxSizeBytes) {
      setAudioError('La canción supera el límite máximo de 8 MB. Por favor elige un archivo más liviano.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomAudioUrl(event.target.result as string);
        setAudioChoice('custom');
      }
    };
    reader.readAsDataURL(file);
  };

  // AI Romantic Letter Enhance
  const handleEnhanceLetterWithAI = async () => {
    if (aiAttemptsLeft <= 0) return;
    if (!rawLetterInput.trim()) {
      alert('Escribe una breve idea para que el asistente poético pueda inspirarse.');
      return;
    }
    setIsAiLoading(true);
    try {
      const resultText = await enhanceRomanticLetter(rawLetterInput);
      const paragraphs = resultText.split('\n\n').filter(p => p.trim());
      setLetterParagraphs(paragraphs);
      setAiAttemptsLeft(prev => prev - 1);
    } catch (err: any) {
      alert(err.message || 'Error al inspirar la carta.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Album Management (Max 4 albums, max 5 photos each)
  const handleAddGallery = () => {
    if (galleries.length >= 4) {
      alert('Puedes crear un máximo de 4 álbumes de recuerdos.');
      return;
    }
    const newId = `g_${Date.now()}`;
    setGalleries(prev => [
      ...prev,
      { id: newId, title: `Álbum ${prev.length + 1}`, coverImage: '', images: [] }
    ]);
  };

  const handleAddPhotoToGallery = async (galleryId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const targetGallery = galleries.find(g => g.id === galleryId);
    if (targetGallery && targetGallery.images.length >= 5) {
      alert('Cada álbum permite un máximo de 5 fotos.');
      return;
    }

    setIsProcessing(true);
    try {
      const croppedBase64 = await cropAndCompressImage(file, 800, 800);
      setGalleries(prev => prev.map(g => {
        if (g.id === galleryId) {
          const updatedImages = [...g.images, croppedBase64];
          return {
            ...g,
            images: updatedImages,
            coverImage: g.coverImage || croppedBase64
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

  const handleSetCoverPhoto = (galleryId: string, photoUrl: string) => {
    setGalleries(prev => prev.map(g => {
      if (g.id === galleryId) {
        return { ...g, coverImage: photoUrl };
      }
      return g;
    }));
  };

  const handleDeleteGallery = (galleryId: string) => {
    if (galleries.length <= 1) {
      alert('Debes mantener al menos 1 álbum.');
      return;
    }
    setGalleries(prev => prev.filter(g => g.id !== galleryId));
  };

  // Finish and Save
  const handleComplete = async () => {
    if (previewAudioRef.current) previewAudioRef.current.pause();

    let activeAudioUrl = customAudioUrl;
    if (audioChoice === 'preloaded') {
      activeAudioUrl = PRELOADED_AUDIO_TRACKS.find(t => t.id === selectedPreloadedId)?.url || PRELOADED_AUDIO_TRACKS[0].url;
    } else if (audioChoice === 'youtube') {
      activeAudioUrl = youtubeUrl.trim();
    }

    const finalSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const finalData: DedicationData = {
      id: initialData?.id || `ded_${Date.now()}`,
      slug: finalSlug || `amor-${Date.now()}`,
      partnerName: partnerName.trim() || 'Mi Amor',
      senderName: senderName.trim() || 'Yo',
      title: title.trim() || 'Hay algo que quiero decirte...',
      startDate,
      mainPhoto,
      letterTitle: letterTitle.trim() || `Para ti, ${partnerName || 'mi amor'}:`,
      letterContent: letterParagraphs,
      question: '¿Quieres seguir caminando conmigo de la mano?',
      answerYesText: 'Sabía que dirías que sí',
      audioUrl: activeAudioUrl,
      audioType: audioChoice,
      galleries,
      coupons: includeCoupons ? coupons : [],
      whatsapp: whatsappNumber.trim(),
      createdAt: initialData?.createdAt || Date.now()
    };

    await saveDedicationApi(finalData);
    onSave(finalData);
  };

  return (
    <div className="min-h-screen bg-romantic-bg text-romantic-text font-sans selection:bg-romantic-accent selection:text-white pb-20">
      {/* Top Header */}
      <header className="bg-romantic-card border-b border-romantic-text/10 px-4 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={onCancel}
            className="flex items-center gap-1 text-xs font-semibold text-romantic-text/60 hover:text-romantic-text transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Volver al Panel
          </button>
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-romantic-accent" fill="currentColor" />
            <span className="font-serif italic font-bold text-romantic-accent text-sm">Diseñando mi Detalle</span>
          </div>
          <span className="text-xs font-bold text-romantic-accent bg-romantic-accent/10 px-3 py-1 rounded-full">
            Paso {step} de 6
          </span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-romantic-text/10 h-1">
        <div
          className="bg-romantic-accent h-full transition-all duration-300"
          style={{ width: `${(step / 6) * 100}%` }}
        />
      </div>

      <main className="max-w-2xl mx-auto px-4 pt-8">

        {/* ─── PASO 1: PROTAGONISTAS ─── */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl font-bold mb-1">1. Protagonistas del Detalle</h2>
              <p className="text-xs text-romantic-text/60">Ingresa los nombres y la fecha de su historia juntos.</p>
            </div>

            <div className="bg-romantic-card rounded-2xl p-6 border border-[#F2E8D5] shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-romantic-text/80">
                    ¿Para quién es este detalle? *
                  </label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="Ej: Lucía"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-romantic-text/20 bg-white text-sm focus:outline-none focus:border-romantic-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-romantic-text/80">
                    ¿De parte de quién? *
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Ej: Juan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-romantic-text/20 bg-white text-sm focus:outline-none focus:border-romantic-accent"
                  />
                </div>
              </div>

              {/* Title with AI Suggestion Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-romantic-text/80">
                    Título principal de la portada
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTitleSuggestions(!showTitleSuggestions)}
                    className="text-[11px] font-bold text-romantic-accent hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={12} /> Sugerencias de Título
                  </button>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Un detalle especial para ti..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-romantic-text/20 bg-white text-sm focus:outline-none focus:border-romantic-accent font-serif italic"
                />

                {showTitleSuggestions && (
                  <div className="mt-2 p-3 bg-romantic-bg rounded-xl border border-romantic-accent/20 space-y-1.5">
                    <p className="text-[10px] font-bold text-romantic-text/60 uppercase tracking-wider mb-1">
                      Elige una sugerencia para inspirarte:
                    </p>
                    {TITLE_SUGGESTIONS.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setTitle(sug);
                          setShowTitleSuggestions(false);
                        }}
                        className="block w-full text-left text-xs text-romantic-accent hover:bg-romantic-accent/10 px-2.5 py-1.5 rounded-lg font-serif italic transition-colors"
                      >
                        " {sug} "
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Styled Special Date Input */}
              <div>
                <label className="block text-xs font-bold mb-1 text-romantic-text/80 flex items-center gap-1.5">
                  <Calendar size={14} className="text-romantic-accent" /> Fecha especial o aniversario *
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-romantic-text/20 bg-white text-sm focus:outline-none focus:border-romantic-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setStartDate(new Date().toISOString().split('T')[0])}
                    className="px-3 py-2 bg-romantic-accent/10 text-romantic-accent rounded-xl text-xs font-bold hover:bg-romantic-accent/20 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    Hoy
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── PASO 2: FOTO PRINCIPAL ─── */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl font-bold mb-1">2. Foto Principal (Polaroid)</h2>
              <p className="text-xs text-romantic-text/60">Esta imagen aparecerá en el centro de la portada estilo Polaroid.</p>
            </div>

            <div className="bg-romantic-card rounded-2xl p-6 border border-[#F2E8D5] shadow-sm text-center">
              <div className="polaroid w-56 mx-auto mb-6">
                <img src={mainPhoto} alt="Foto Principal" className="w-full aspect-square object-cover rounded" />
                <p className="text-center mt-3 font-serif italic text-sm text-romantic-text/80">
                  {senderName || 'Nombre'} y {partnerName || 'Pareja'}
                </p>
              </div>

              <label className="inline-flex items-center gap-2 bg-romantic-accent hover:bg-romantic-accent-hover text-white px-5 py-2.5 rounded-full font-bold shadow text-xs cursor-pointer transition-transform hover:scale-105">
                <Upload size={14} /> Cambiar Foto Principal (1x1)
                <input type="file" accept="image/*" onChange={handleMainPhotoUpload} className="hidden" />
              </label>
            </div>
          </motion.div>
        )}

        {/* ─── PASO 3: MENSAJE ROMÁNTICO Y ASISTENTE POÉTICO ─── */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl font-bold mb-1">3. Mensaje Romántico y Carta</h2>
              <p className="text-xs text-romantic-text/60">Redacta el mensaje o usa nuestro Asistente Poético.</p>
            </div>

            {/* Asistente Poético */}
            <div className="bg-gradient-to-r from-[#FFFBF5] to-[#FFF5E8] rounded-2xl p-5 border border-romantic-accent/30 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif italic font-bold text-sm text-romantic-accent flex items-center gap-1.5">
                  <Sparkles size={16} /> Asistente de Redacción Romántica
                </span>
                <span className="text-[10px] font-bold text-romantic-text/50">
                  {aiAttemptsLeft} intentos disponibles
                </span>
              </div>
              <p className="text-xs text-romantic-text/70 mb-3">
                Escribe una idea sencilla (ej: *"Quiero desearle una hermosa semana y recordarle que la amo"*). La IA redactará una carta poética y emotiva.
              </p>
              <textarea
                value={rawLetterInput}
                onChange={(e) => setRawLetterInput(e.target.value)}
                placeholder="Escribe tu idea corta aquí..."
                rows={2}
                className="w-full p-3 rounded-xl border border-romantic-text/20 bg-white text-xs focus:outline-none focus:border-romantic-accent mb-3"
              />
              <button
                type="button"
                onClick={handleEnhanceLetterWithAI}
                disabled={isAiLoading || aiAttemptsLeft <= 0}
                className="bg-romantic-accent text-white px-4 py-2 rounded-full text-xs font-bold shadow hover:bg-romantic-accent-hover flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isAiLoading ? 'Perfeccionando...' : '✍️ Perfeccionar Mensaje con IA'}
              </button>
            </div>

            {/* Carta Editor */}
            <div className="bg-romantic-card rounded-2xl p-6 border border-[#F2E8D5] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-romantic-text/80">Título de la carta</label>
                <button
                  type="button"
                  onClick={() => setIsPreviewLetterOpen(true)}
                  className="text-xs font-bold text-romantic-accent hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye size={14} /> Previsualizar en la Carta
                </button>
              </div>
              <input
                type="text"
                value={letterTitle}
                onChange={(e) => setLetterTitle(e.target.value)}
                placeholder={`Ej: Para ti, ${partnerName || 'mi amor'}:`}
                className="w-full px-3.5 py-2.5 rounded-xl border border-romantic-text/20 bg-white text-sm font-serif italic focus:outline-none focus:border-romantic-accent"
              />

              <label className="block text-xs font-bold text-romantic-text/80">Párrafos de la carta</label>
              {letterParagraphs.map((paragraph, index) => (
                <div key={index} className="relative">
                  <textarea
                    value={paragraph}
                    onChange={(e) => {
                      const newP = [...letterParagraphs];
                      newP[index] = e.target.value;
                      setLetterParagraphs(newP);
                    }}
                    rows={2}
                    className="w-full p-3 pr-8 rounded-xl border border-romantic-text/20 bg-white text-xs leading-relaxed focus:outline-none focus:border-romantic-accent"
                  />
                  {letterParagraphs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setLetterParagraphs(prev => prev.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 text-romantic-text/30 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => setLetterParagraphs(prev => [...prev, ''])}
                className="text-xs font-bold text-romantic-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                + Agregar otro párrafo
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── PASO 4: MÚSICA DE FONDO ─── */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl font-bold mb-1">4. Música de Fondo</h2>
              <p className="text-xs text-romantic-text/60">Elige una canción precargada o sube tu propia canción.</p>
            </div>

            {audioError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs text-center font-medium">
                {audioError}
              </div>
            )}

            <div className="bg-romantic-card rounded-2xl p-6 border border-[#F2E8D5] shadow-sm space-y-5">
              
              {/* 3 Explicit Option Tabs */}
              <div>
                <label className="block text-xs font-bold mb-2 text-romantic-text/80 text-center">
                  Selecciona cómo quieres incluir la música (Elige 1 de las 3 opciones):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAudioChoice('preloaded')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      audioChoice === 'preloaded'
                        ? 'border-romantic-accent bg-romantic-accent text-white font-bold shadow-md'
                        : 'border-romantic-text/15 bg-white text-romantic-text/70 hover:bg-romantic-bg'
                    }`}
                  >
                    <Music size={18} />
                    <span className="text-xs font-semibold">1. Precargadas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAudioChoice('youtube')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      audioChoice === 'youtube'
                        ? 'border-romantic-accent bg-romantic-accent text-white font-bold shadow-md'
                        : 'border-romantic-text/15 bg-white text-romantic-text/70 hover:bg-romantic-bg'
                    }`}
                  >
                    <Play size={18} />
                    <span className="text-xs font-semibold">2. YouTube</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAudioChoice('custom')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      audioChoice === 'custom'
                        ? 'border-romantic-accent bg-romantic-accent text-white font-bold shadow-md'
                        : 'border-romantic-text/15 bg-white text-romantic-text/70 hover:bg-romantic-bg'
                    }`}
                  >
                    <Upload size={18} />
                    <span className="text-xs font-semibold">3. Subir MP3</span>
                  </button>
                </div>
              </div>

              {/* OPTION 1: PRELOADED TRACKS */}
              {audioChoice === 'preloaded' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-romantic-accent">Canciones románticas clásicas disponibles:</span>
                    <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      ✓ Opción seleccionada
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRELOADED_AUDIO_TRACKS.map((track) => (
                      <div
                        key={track.id}
                        onClick={() => setSelectedPreloadedId(track.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedPreloadedId === track.id
                            ? 'border-romantic-accent bg-romantic-accent/10 font-bold shadow-sm'
                            : 'border-romantic-text/15 bg-white hover:border-romantic-accent/40'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-serif italic text-romantic-accent">{track.name}</p>
                          <p className="text-[10px] text-romantic-text/50">{track.artist}</p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleTogglePreviewTrack(track.id, track.url, e)}
                          className="p-2 rounded-full bg-white border border-romantic-text/10 text-romantic-accent shadow-sm hover:scale-110 transition-transform"
                          title="Probar sonido"
                        >
                          {previewTrackId === track.id ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OPTION 2: YOUTUBE LINK WITH LIVE PREVIEW PLAYER */}
              {audioChoice === 'youtube' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-romantic-accent">
                      Pega tu enlace de YouTube:
                    </label>
                    <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      ✓ Opción seleccionada
                    </span>
                  </div>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Ej: https://www.youtube.com/watch?v=9uB1Bl2SVBs o https://youtu.be/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-romantic-text/20 bg-white text-xs focus:outline-none focus:border-romantic-accent"
                  />

                  {/* YouTube Live Music Card Preview & Interactive Audio Player */}
                  {(() => {
                    const match = youtubeUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
                    const ytId = match && match[2].length === 11 ? match[2] : null;
                    if (!ytId) return null;

                    const isPlayingThis = previewTrackId === `yt_${ytId}`;

                    return (
                      <div className="bg-white p-4 rounded-xl border border-romantic-accent/30 space-y-3 shadow-sm">
                        <div className="flex items-center gap-4">
                          <img
                            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                            alt="Thumbnail Canción YouTube"
                            className="w-20 h-14 object-cover rounded-lg flex-shrink-0 border border-romantic-text/10"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-romantic-accent uppercase tracking-wider block">
                              Canción de YouTube identificada
                            </span>
                            <p className="text-xs font-bold text-romantic-text truncate mt-0.5" title={youtubeTitle || `Vídeo ID: ${ytId}`}>
                              🎵 {youtubeTitle || `Vídeo ID: ${ytId}`}
                            </p>
                            <p className="text-[10px] text-green-600 font-semibold mt-0.5">
                              ✓ Lista para sonar de fondo en tu dedicatoria
                            </p>
                          </div>

                          {/* Test Play Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (isPlayingThis) {
                                setPreviewTrackId(null);
                              } else {
                                setPreviewTrackId(`yt_${ytId}`);
                              }
                            }}
                            className="px-3 py-1.5 rounded-full bg-romantic-accent text-white text-xs font-bold shadow-sm flex items-center gap-1 hover:bg-romantic-accent-hover transition-transform hover:scale-105 cursor-pointer flex-shrink-0"
                          >
                            {isPlayingThis ? (
                              <><Pause size={13} fill="currentColor" /> Detener</>
                            ) : (
                              <><Play size={13} fill="currentColor" /> Probar Audio</>
                            )}
                          </button>
                        </div>

                        {/* Embedded Live Player Preview when Testing */}
                        {isPlayingThis && (
                          <div className="pt-2 border-t border-romantic-text/10">
                            <p className="text-[11px] font-bold text-romantic-accent mb-2 flex items-center gap-1">
                              <Play size={12} fill="currentColor" /> Reproduciendo vista previa de YouTube:
                            </p>
                            <div className="aspect-video w-full max-w-sm mx-auto rounded-lg overflow-hidden border border-romantic-accent/40 shadow">
                              <iframe
                                className="w-full h-full"
                                src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1`}
                                title="Reproductor de prueba de YouTube"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* OPTION 3: CUSTOM MP3 UPLOAD WITH HTML5 PLAYER */}
              {audioChoice === 'custom' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-romantic-accent">
                      Sube tu archivo de audio en MP3 (Máx. 8 MB):
                    </label>
                    <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      ✓ Opción seleccionada
                    </span>
                  </div>
                  <label className="flex items-center justify-center gap-2 bg-white border-2 border-dashed border-romantic-accent/40 hover:border-romantic-accent p-4 rounded-xl cursor-pointer text-xs font-semibold text-romantic-accent">
                    <Upload size={16} /> Seleccionar archivo de mi equipo (MP3)
                    <input type="file" accept="audio/*" onChange={handleCustomAudioUpload} className="hidden" />
                  </label>

                  {customAudioUrl && (
                    <div className="bg-white p-4 rounded-xl border border-romantic-accent/30 space-y-2">
                      <p className="text-xs font-bold text-romantic-accent">
                        ✓ Archivo MP3 cargado correctamente. Escúchalo aquí:
                      </p>
                      <audio controls src={customAudioUrl} className="w-full h-8" />
                    </div>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        )}

        {/* ─── PASO 5: ÁLBUMES Y CUPONES OPCIONALES ─── */}
        {step === 5 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl font-bold mb-1">5. Recuerdos y Cupones</h2>
              <p className="text-xs text-romantic-text/60">Organiza tus álbumes de fotos y añade cupones rascables opcionales.</p>
            </div>

            {/* Album Section */}
            <div className="bg-romantic-card rounded-2xl p-6 border border-[#F2E8D5] shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-romantic-accent">
                  Álbumes de Fotos (Máx. 4 álbumes)
                </h3>
                {galleries.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddGallery}
                    className="text-xs font-bold text-romantic-accent hover:underline cursor-pointer"
                  >
                    + Nuevo Álbum
                  </button>
                )}
              </div>

              {galleries.map((gallery) => (
                <div key={gallery.id} className="bg-white p-4 rounded-xl border border-romantic-text/10 space-y-3">
                  <div className="flex items-center justify-between">
                    {editingTitleGalleryId === gallery.id ? (
                      <input
                        type="text"
                        value={newGalleryTitle}
                        onChange={(e) => setNewGalleryTitle(e.target.value)}
                        onBlur={() => {
                          if (newGalleryTitle.trim()) {
                            setGalleries(prev => prev.map(g => g.id === gallery.id ? { ...g, title: newGalleryTitle } : g));
                          }
                          setEditingTitleGalleryId(null);
                        }}
                        autoFocus
                        className="px-2 py-1 rounded border border-romantic-accent text-xs font-serif italic"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-serif italic font-bold text-sm text-romantic-accent">{gallery.title}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTitleGalleryId(gallery.id);
                            setNewGalleryTitle(gallery.title);
                          }}
                          className="text-romantic-text/40 hover:text-romantic-accent"
                        >
                          <Edit3 size={12} />
                        </button>
                      </div>
                    )}

                    {galleries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteGallery(gallery.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>

                  {/* Photos Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {gallery.images.map((imgUrl, imgIdx) => {
                      const isCover = gallery.coverImage === imgUrl;
                      return (
                        <div key={imgIdx} className="relative group aspect-square rounded-lg overflow-hidden border border-romantic-text/10">
                          <img src={imgUrl} alt="Foto" className="w-full h-full object-cover" />
                          
                          {/* Cover Badge */}
                          {isCover && (
                            <span className="absolute top-1 left-1 bg-romantic-accent text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                              Portada
                            </span>
                          )}

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverPhoto(gallery.id, imgUrl)}
                                className="p-1 bg-white text-romantic-accent rounded text-[9px] font-bold"
                                title="Fijar como foto de portada"
                              >
                                Portada
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(gallery.id, imgIdx)}
                              className="p-1 bg-white text-red-500 rounded"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {gallery.images.length < 5 && (
                      <label className="aspect-square rounded-lg border-2 border-dashed border-romantic-accent/30 flex flex-col items-center justify-center cursor-pointer hover:border-romantic-accent text-romantic-accent">
                        <Upload size={14} />
                        <span className="text-[9px] font-bold mt-1">+ Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAddPhotoToGallery(gallery.id, e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-[10px] text-romantic-text/40">{gallery.images.length}/5 fotos subidas (1x1)</p>
                </div>
              ))}
            </div>

            {/* Coupons Optional Section */}
            <div className="bg-romantic-card rounded-2xl p-6 border border-[#F2E8D5] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift size={18} className="text-romantic-accent" />
                  <label className="font-serif font-bold text-sm text-romantic-text">
                    ¿Quieres incluir Cupones de Regalo rascables?
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCouponHelp(true)}
                    className="text-romantic-text/40 hover:text-romantic-accent"
                    title="¿Qué es esto?"
                  >
                    <HelpCircle size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIncludeCoupons(true)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                      includeCoupons ? 'bg-romantic-accent text-white' : 'bg-romantic-bg text-romantic-text/50'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncludeCoupons(false)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                      !includeCoupons ? 'bg-romantic-accent text-white' : 'bg-romantic-bg text-romantic-text/50'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {includeCoupons && (
                <div className="space-y-3 pt-2">
                  {/* WhatsApp Field for Coupon Claims */}
                  <div className="p-3.5 bg-white rounded-xl border border-romantic-accent/20">
                    <label className="block text-xs font-bold mb-1 text-romantic-text/80">
                      📱 Tu número de WhatsApp para recibir los reclamos (con código de país):
                    </label>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="Ej: +51987654321"
                      className="w-full px-3 py-2 rounded-lg border border-romantic-text/20 text-xs focus:outline-none focus:border-romantic-accent"
                    />
                    <p className="text-[10px] text-romantic-text/50 mt-1">
                      Cuando tu pareja raspe un cupón y presione "💬 Reclamar por WhatsApp", se abrirá un chat directo a este número.
                    </p>
                  </div>
                  {coupons.map((coupon, idx) => (
                    <div key={coupon.id} className="p-3 bg-white rounded-xl border border-romantic-text/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-romantic-accent">Cupón #{idx + 1}</span>
                        {coupons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setCoupons(prev => prev.filter(c => c.id !== coupon.id))}
                            className="text-xs text-red-500"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={coupon.rewardText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, rewardText: val } : c));
                        }}
                        placeholder="Ej: Vale por una cena romántica 🕯️"
                        className="w-full px-3 py-1.5 rounded-lg border border-romantic-text/20 text-xs focus:outline-none focus:border-romantic-accent"
                      />
                    </div>
                  ))}

                  {coupons.length < 4 && (
                    <button
                      type="button"
                      onClick={() => setCoupons(prev => [...prev, { id: `c_${Date.now()}`, title: `Cupón #${prev.length + 1}`, rewardText: '' }])}
                      className="text-xs font-bold text-romantic-accent hover:underline"
                    >
                      + Añadir otro cupón
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── PASO 6: GENERAR ENLACE Y PUBLICAR ─── */}
        {step === 6 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl font-bold mb-1">6. Publicar Dedicatoria</h2>
              <p className="text-xs text-romantic-text/60">Verifica tu enlace personalizado y publica tu regalo.</p>
            </div>

            <div className="bg-romantic-card rounded-2xl p-6 border border-[#F2E8D5] shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-romantic-text/80">
                  Enlace personalizado (Slug)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-romantic-text/40 font-mono">/ #/d/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="lucia-juan-27062026"
                    className="w-full px-3 py-2 rounded-xl border border-romantic-text/20 bg-white text-xs font-mono focus:outline-none focus:border-romantic-accent"
                  />
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-romantic-text/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-romantic-text/60">Para:</span>
                  <span className="font-bold">{partnerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-romantic-text/60">De:</span>
                  <span className="font-bold">{senderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-romantic-text/60">Álbumes:</span>
                  <span className="font-bold">{galleries.length} álbumes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-romantic-text/60">Cupones rascables:</span>
                  <span className="font-bold">{includeCoupons ? `${coupons.length} cupones` : 'Sin cupones'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── BOTTOM CONTROL NAVIGATION ─── */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-romantic-text/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="bg-white text-romantic-text border border-romantic-text/20 px-5 py-2.5 rounded-full text-xs font-bold hover:bg-romantic-bg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} /> Anterior
            </button>
          ) : <div />}

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              className="bg-romantic-accent hover:bg-romantic-accent-hover text-white px-6 py-2.5 rounded-full text-xs font-bold shadow flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
            >
              Siguiente <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={isProcessing}
              className="bg-romantic-accent hover:bg-romantic-accent-hover text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
            >
              <Heart size={16} fill="currentColor" /> Publicar Dedicatoria
            </button>
          )}
        </div>
      </main>

      {/* ─── MODAL PREVISUALIZACIÓN DE CARTA (Paso 3) ─── */}
      {isPreviewLetterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-romantic-card rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#F2E8D5] relative my-8"
          >
            <button
              onClick={() => setIsPreviewLetterOpen(false)}
              className="absolute top-4 right-4 p-2 text-romantic-text/60 hover:text-romantic-text"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-6">
              <span className="font-serif italic font-bold text-xl text-romantic-accent">
                Previsualización de tu Carta
              </span>
            </div>

            <div className="font-serif leading-relaxed text-sm space-y-4 bg-[#FFFBF0] p-6 rounded-xl border border-[#E8DCC4]">
              <p className="italic text-romantic-accent font-bold">
                {letterTitle || `Para ti, ${partnerName || 'mi amor'}:`}
              </p>
              {letterParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── MODAL AYUDA CUPONES (Paso 5) ─── */}
      {showCouponHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl relative">
            <button onClick={() => setShowCouponHelp(false)} className="absolute top-3 right-3 text-romantic-text/40">
              <X size={16} />
            </button>
            <h4 className="font-serif font-bold text-base mb-2 text-romantic-accent">¿Qué son los Cupones Rascables?</h4>
            <p className="text-xs text-romantic-text/70 leading-relaxed mb-4">
              Son tarjetas virtuales interactiva que tu pareja debe raspar con su dedo o mouse para descubrir recompensas románticas que tú le regalas (ej: *"Vale por una cena"*, *"Vale por un masaje"*).
            </p>
            <p className="text-xs text-romantic-text/70 leading-relaxed">
              Al desbloquear un cupón, aparecerá un botón instantáneo para enviarte la captura por WhatsApp y reclamar su premio.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};
