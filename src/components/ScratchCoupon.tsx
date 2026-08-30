import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Gift, Check } from 'lucide-react';
import { ScratchCouponData } from '../types/dedication';

interface ScratchCouponProps {
  coupon: ScratchCouponData;
}

export const ScratchCoupon: React.FC<ScratchCouponProps> = ({ coupon }) => {
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

    // Draw metallic rose-gold scratch layer
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#E5A9B4');
    gradient.addColorStop(0.5, '#C86D7D');
    gradient.addColorStop(1, '#A04858');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Overlay text instructions
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

    // Check revealed percentage
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

  const handleMouseDown = (e: React.MouseEvent) => {
    isScratchingRef.current = true;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isScratchingRef.current) {
      scratch(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    isScratchingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      scratch(touch.clientX, touch.clientY);
    }
  };

  return (
    <div className="relative w-full aspect-[2.8/1] max-w-sm mx-auto bg-white rounded-2xl p-4 shadow-md border-2 border-dashed border-romantic-accent/40 flex flex-col items-center justify-center overflow-hidden">
      {/* Hidden Reward (Underneath Canvas) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-gradient-to-br from-[#FFFBF5] to-[#FFF5E8] text-center">
        <Gift size={20} className="text-romantic-accent mb-1" />
        <h4 className="font-serif italic font-bold text-sm text-romantic-accent">{coupon.title}</h4>
        <p className="font-sans font-bold text-base text-romantic-text mt-0.5">{coupon.rewardText}</p>
        {isRevealed && (
          <span className="mt-1 text-[10px] text-green-600 font-semibold flex items-center gap-1">
            <Check size={12} /> ¡Cupón Desbloqueado!
          </span>
        )}
      </div>

      {/* Canvas Scratch Layer */}
      {!isRevealed && (
        <canvas
          ref={canvasRef}
          width={300}
          height={110}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none rounded-xl"
        />
      )}
    </div>
  );
};
