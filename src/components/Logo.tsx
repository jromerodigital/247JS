import React from 'react';

interface LogoProps {
  variant?: 'full' | 'horizontal' | 'icon' | 'wordmark';
  theme?: 'light' | 'dark' | 'accent'; // light = white, dark = brown, accent = pink
  className?: string;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'horizontal', 
  theme = 'accent', 
  className = '',
  showTagline = false
}) => {
  const colors = {
    light: '#FFFFFF',
    dark: '#4A3E3D',
    accent: '#C27A7E'
  };
  
  const color = colors[theme];

  // Icon SVG (L + Heart)
  // We use Playfair Display for the L, and a custom path for the heart.
  const Icon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill={color}>
      {/* The L */}
      <text x="25" y="85" fontFamily="'Playfair Display', serif" fontSize="85" fontWeight="normal">L</text>
      {/* The Heart overlapping the L */}
      <path 
        d="M 50 45 C 50 35, 65 30, 75 40 C 85 50, 70 70, 50 82 C 45 78, 40 73, 40 68" 
        fill="none" 
        stroke={color} 
        strokeWidth="6" 
        strokeLinecap="round"
      />
      <path 
        d="M 50 45 C 45 40, 38 42, 35 48" 
        fill="none" 
        stroke={color} 
        strokeWidth="6" 
        strokeLinecap="round"
      />
    </svg>
  );

  // SVG Heart perfectly drawn to match the logo
  const CustomIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
      {/* 
        To make it match exactly without complex paths, let's use a simpler clean approach 
        using text and a standard heart. The user's icon has the heart outline intertwined.
      */}
      <text x="15" y="80" fontFamily="'Playfair Display', serif" fontSize="80" fill={color}>L</text>
      <path 
        d="M 45 50 C 45 35, 75 35, 75 55 C 75 70, 55 80, 48 83 C 41 80, 25 70, 25 55 C 25 45, 35 38, 42 42"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );

  // Use the exact icon provided by the user via a CSS mask
  const LogoMark = () => (
    <div 
      className="w-full h-full"
      style={{
        backgroundColor: color,
        WebkitMaskImage: 'url(/logo-icon.png)',
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskImage: 'url(/logo-icon.png)',
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
      }}
    />
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-block ${className}`}>
        <LogoMark />
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex flex-col items-center justify-center ${className}`}>
        <span className="font-serif italic font-bold tracking-tight leading-none" style={{ color }}>
          LinkLove
        </span>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 shrink-0 flex items-center justify-center">
          <LogoMark />
        </div>
        <div className="flex flex-col justify-center">
          <span className="font-serif italic font-bold text-2xl tracking-tight leading-none mt-1" style={{ color }}>
            LinkLove
          </span>
          {showTagline && (
            <span className="text-[6.5px] tracking-[0.2em] font-sans mt-1 uppercase opacity-80" style={{ color }}>
              Regalos Digitales Que Enamoran
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full / Stacked Variant
  return (
    <div className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}>
      <div className="w-16 h-16">
        <LogoMark />
      </div>
      <div className="flex flex-col items-center">
        <span className="font-serif italic font-bold text-4xl tracking-tight leading-none" style={{ color }}>
          LinkLove
        </span>
        {showTagline && (
          <div className="flex items-center gap-2 mt-3 w-full">
            <div className="flex-1 h-[1px] opacity-20" style={{ backgroundColor: color }}></div>
            <span className="text-[8px] tracking-[0.25em] font-sans uppercase whitespace-nowrap opacity-80" style={{ color }}>
              Regalos Digitales Que Enamoran
            </span>
            <div className="flex-1 h-[1px] opacity-20" style={{ backgroundColor: color }}></div>
          </div>
        )}
      </div>
    </div>
  );
};
