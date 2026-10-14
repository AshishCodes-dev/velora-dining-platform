import React, { useState } from 'react';
import type { Food } from '../types/restaurant';

interface DishVisualProps {
  src: string;
  alt: string;
  illustrationType?: Food['illustrationType'];
  mode?: 'photo' | 'illustration';
  className?: string;
  showArtAccent?: boolean;
  width?: number;
  height?: number;
}

export const DishVisual: React.FC<DishVisualProps> = ({
  src,
  alt,
  illustrationType = 'platter',
  mode = 'photo',
  className = 'w-full h-full',
  showArtAccent = true,
  width = 800,
  height = 600,
}) => {
  const [imgError, setImgError] = useState(false);

  const render2DIllustration = () => {
    switch (illustrationType) {
      case 'pizza':
        return (
          <svg viewBox="0 0 240 180" className="w-full h-full" fill="none">
            <rect width="240" height="180" className="fill-surface" />
            <circle cx="120" cy="90" r="72" className="fill-green-deep stroke-yellow" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="120" cy="90" r="62" className="fill-yellow-hover" fillOpacity="0.85" />
            <circle cx="120" cy="90" r="53" className="fill-danger" />
            {/* Burrata & Truffle 2D Art */}
            <circle cx="120" cy="90" r="20" className="fill-text" />
            <circle cx="95" cy="70" r="8" className="fill-elevated stroke-yellow" strokeWidth="1.2" />
            <circle cx="145" cy="72" r="9" className="fill-elevated stroke-yellow" strokeWidth="1.2" />
            <circle cx="98" cy="112" r="8" className="fill-elevated stroke-yellow" strokeWidth="1.2" />
            <circle cx="142" cy="110" r="7" className="fill-elevated stroke-yellow" strokeWidth="1.2" />
            {/* Emerald Basil Leaves */}
            <path d="M118 65 C124 55, 134 62, 122 72 Z" className="fill-green-light" />
            <path d="M102 95 C90 92, 92 104, 105 100 Z" className="fill-green-light" />
            <path d="M136 92 C148 88, 146 102, 134 98 Z" className="fill-green-light" />
          </svg>
        );
      case 'biryani':
        return (
          <svg viewBox="0 0 240 180" className="w-full h-full" fill="none">
            <rect width="240" height="180" className="fill-surface" />
            <ellipse cx="120" cy="118" rx="68" ry="26" className="fill-green-deep stroke-yellow" strokeWidth="1.5" />
            <path d="M56 105 Q120 52 184 105 Z" className="fill-yellow/40" />
            <path d="M62 106 C62 145, 178 145, 178 106 Z" className="fill-green-deep stroke-yellow" strokeWidth="1.5" />
            {/* Saffron & Mint & Rose Petals */}
            <circle cx="105" cy="92" r="5" className="fill-green-light" />
            <circle cx="135" cy="94" r="5" className="fill-green-light" />
            <circle cx="120" cy="84" r="4" className="fill-yellow" />
            <circle cx="112" cy="98" r="3.5" className="fill-yellow" />
            {/* Aromatic Steam */}
            <path d="M100 68 Q94 52 104 40" className="stroke-yellow" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <path d="M120 62 Q126 46 118 32" className="stroke-yellow" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <path d="M140 68 Q146 52 136 40" className="stroke-green-light" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          </svg>
        );
      case 'burger':
        return (
          <svg viewBox="0 0 240 180" className="w-full h-full" fill="none">
            <rect width="240" height="180" className="fill-surface" />
            <circle cx="120" cy="90" r="68" className="fill-elevated stroke-yellow" strokeOpacity="0.35" />
            {/* Top Brioche Bun */}
            <path d="M72 82 C72 46, 168 46, 168 82 Z" className="fill-yellow-hover" />
            {/* Emerald Arugula & Pickled Pink Shallots */}
            <path d="M68 85 Q95 78 120 86 Q145 94 172 84" className="stroke-green-light" strokeWidth="5" strokeLinecap="round" />
            <path d="M76 92 L164 92" className="stroke-green-mid" strokeWidth="4" strokeLinecap="round" />
            {/* Aged Cheddar & Wagyu Patties */}
            <rect x="70" y="96" width="100" height="12" rx="6" className="fill-green-deep stroke-yellow" strokeWidth="1.5" />
            <path d="M78 96 L92 108 L106 96" className="fill-yellow" />
            <rect x="72" y="110" width="96" height="11" rx="5.5" className="fill-elevated" />
            {/* Bottom Bun */}
            <rect x="76" y="123" width="88" height="14" rx="7" className="fill-yellow-hover" />
          </svg>
        );
      case 'tart':
      case 'elixir':
        return (
          <svg viewBox="0 0 240 180" className="w-full h-full" fill="none">
            <rect width="240" height="180" className="fill-surface" />
            <circle cx="120" cy="92" r="64" className="fill-elevated stroke-yellow" strokeOpacity="0.4" />
            <circle cx="120" cy="92" r="44" className="fill-green-deep" />
            <circle cx="120" cy="92" r="34" className="fill-green-mid" />
            <circle cx="108" cy="84" r="10" className="fill-yellow" />
            <circle cx="132" cy="96" r="8" className="fill-yellow-hover" />
            <circle cx="122" cy="76" r="5" className="fill-green-light" />
            <path d="M116 88 L124 80 L128 92 Z" className="fill-yellow" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 240 180" className="w-full h-full" fill="none">
            <rect width="240" height="180" className="fill-surface" />
            <circle cx="120" cy="90" r="68" className="fill-elevated stroke-yellow" strokeWidth="1.2" strokeOpacity="0.45" />
            <circle cx="120" cy="90" r="52" className="fill-canvas stroke-yellow" strokeWidth="0.8" strokeOpacity="0.4" />
            <ellipse cx="106" cy="86" rx="22" ry="15" className="fill-yellow" fillOpacity="0.85" />
            <ellipse cx="136" cy="98" rx="18" ry="12" className="fill-green-deep" />
            <circle cx="138" cy="74" r="7" className="fill-green-light" />
            <circle cx="96" cy="106" r="5" className="fill-yellow" />
          </svg>
        );
    }
  };

  if (mode === 'illustration' || imgError || !src) {
    return (
      <div className={`relative overflow-hidden bg-surface ${className}`}>
        {render2DIllustration()}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-surface ${className}`}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setImgError(true)}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
      {/* Subtle dark-green contrast scrim for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-green-deep/25 to-transparent pointer-events-none" />
      {/* Subtle 2D geometric corner motif */}
      {showArtAccent && (
        <svg
          viewBox="0 0 48 48"
          className="absolute bottom-2.5 right-2.5 w-7 h-7 opacity-45 pointer-events-none"
          fill="none"
        >
          <circle cx="24" cy="24" r="20" className="stroke-yellow" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="24" cy="24" r="4" className="fill-green-light" />
        </svg>
      )}
    </div>
  );
};
