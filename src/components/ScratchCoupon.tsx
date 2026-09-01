import React, { useRef, useEffect, useState } from 'react';
import { Gift, Check, MessageCircle } from 'lucide-react';
import { ScratchCouponData } from '../types/dedication';

interface ScratchCouponProps {
  coupon: ScratchCouponData;
  partnerName?: string;
  senderName?: string;
}

export const ScratchCoupon: React.FC<ScratchCouponProps> = ({ coupon, partnerName = 'mi amor', senderName = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const isScratchingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Metal rose-gold gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#E5A9B4');
    gradient.addColorStop(0.5, '#C86D7D');
    gradient.addColorStop(1, '#A04858');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ Raspa aquí con tu dedo o mouse ✨', width / 2, height / 2);
  }, []);

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = x - rect.left;
    const clientY = y - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(clientX, clientY, 18, 0, Math.PI * 2);
    ctx.fill();

    if (!isRevealed) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let clearedPixels = 0;
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] === 0) clearedPixels++;
      }
      const percentage = (clearedPixels / (imageData.data.length / 4)) * 100;
      if (percentage > 45) {
        setIsRevealed(true);
      }
    }
  };

  const handleClaimWhatsApp = () => {
    const message = encodeURIComponent(
      `¡Hola ${senderName || 'mi amor'}! ❤️ Acabo de raspar tu dedicatoria y desbloqueé este regalo:\n\n✨ *${coupon.title}*: ${coupon.rewardText}\n\n¡Quiero reclamarlo! 🕯️🥂`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="relative w-full aspect-[2.4/1] max-w-sm mx-auto bg-white rounded-2xl p-4 shadow-md border-2 border-dashed border-romantic-accent/40 flex flex-col items-center justify-center overflow-hidden">
      {/* Hidden Reward */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-gradient-to-br from-[#FFFBF5] to-[#FFF5E8] text-center">
        <Gift size={20} className="text-romantic-accent mb-0.5" />
        <h4 className="font-serif italic font-bold text-xs text-romantic-accent">{coupon.title}</h4>
        <p className="font-sans font-bold text-sm text-romantic-text mt-0.5 leading-snug">{coupon.rewardText}</p>
        
        {isRevealed && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
              <Check size={12} /> Desbloqueado
            </span>
            <button
              onClick={handleClaimWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1 transition-transform hover:scale-105 cursor-pointer"
            >
              <MessageCircle size={11} /> Reclamar por WhatsApp
            </button>
          </div>
        )}
      </div>

      {/* Canvas Scratch Layer */}
      {!isRevealed && (
        <canvas
          ref={canvasRef}
          width={300}
          height={120}
          onMouseDown={(e) => scratch(e.clientX, e.clientY)}
          onMouseMove={(e) => e.buttons === 1 && scratch(e.clientX, e.clientY)}
          onTouchMove={(e) => e.touches.length > 0 && scratch(e.touches[0].clientX, e.touches[0].clientY)}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none rounded-xl"
        />
      )}
    </div>
  );
};
