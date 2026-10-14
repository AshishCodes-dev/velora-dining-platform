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
            <rect width="240" height="180" fill="#160F24" />
            <circle cx="120" cy="90" r="72" fill="#2A1B3D" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="120" cy="90" r="62" fill="#D97706" fillOpacity="0.85" />
            <circle cx="120" cy="90" r="53" fill="#991B1B" />
            {/* Burrata & Truffle 2D Art */}
            <circle cx="120" cy="90" r="20" fill="#FFFBEB" />
            <circle cx="95" cy="70" r="8" fill="#1F1630" stroke="#F59E0B" strokeWidth="1.2" />
            <circle cx="145" cy="72" r="9" fill="#1F1630" stroke="#F59E0B" strokeWidth="1.2" />
            <circle cx="98" cy="112" r="8" fill="#1F1630" stroke="#F59E0B" strokeWidth="1.2" />
            <circle cx="142" cy="110" r="7" fill="#1F1630" stroke="#F59E0B" strokeWidth="1.2" />
            {/* Emerald Basil Leaves */}
            <path d="M118 65 C124 55, 134 62, 122 72 Z" fill="#10B981" />
            <path d="M102 95 C90 92, 92 104, 105 100 Z" fill="#10B981" />
            <path d="M136 92 C148 88, 146 102, 134 98 Z" fill="#10B981" />
          </svg>
        );
      case 'biryani':
        return (
          <svg viewBox="0 0 240 180" className="w-full h-full" fill="none">
            <rect width="240" height="180" fill="#140D21" />
            <ellipse cx="120" cy="118" rx="68" ry="26" fill="#78350F" stroke="#F59E0B" strokeWidth="1.5" />
            <path d="M56 105 Q120 52 184 105 Z" fill="#FDE68A" />
            <path d="M62 106 C62 145, 178 145, 178 106 Z" fill="#92400E" stroke="#FBBF24" strokeWidth="1.5" />
            {/* Saffron & Mint & Rose Petals */}
            <circle cx="105" cy="92" r="5" fill="#10B981" />
            <circle cx="135" cy="94" r="5" fill="#10B981" />
            <circle cx="120" cy="84" r="4" fill="#EC4899" />
            <circle cx="112" cy="98" r="3.5" fill="#EC4899" />
            {/* Aromatic Steam */}
            <path d="M100 68 Q94 52 104 40" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <path d="M120 62 Q126 46 118 32" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <path d="M140 68 Q146 52 136 40" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          </svg>
        );
      case 'burger':
        return (
          <svg viewBox="0 0 240 180" className="w-full h-full" fill="none">
            <rect width="240" height="180" fill="#150F22" />
            <circle cx="120" cy="90" r="68" fill="#1F1630" stroke="#8B5CF6" strokeOpacity="0.35" />
            {/* Top Brioche Bun */}
            <path d="M72 82 C72 46, 168 46, 168 82 Z" fill="#D97706" />
            {/* Emerald Arugula & Pickled Pink Shallots */}
            <path d="M68 85 Q95 78 120 86 Q145 94 172 84" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
            <path d="M76 92 L164 92" stroke="#EC4899" strokeWidth="4" strokeLinecap="round" />
            {/* Aged Cheddar & Wagyu Patties */}
            <rect x="70" y="96" width="100" height="12" rx="6" fill="#451A03" stroke="#F59E0B" strokeWidth="1.5" />
            <path d="M78 96 L92 108 L106 96" fill="#FBBF24" />
            <rect x="72" y="110" width="96" height="11" rx="5.5" fill="#3F1D0B" />
            {/* Bottom Bun */}
            <rect x="76" y="123" width="88" height="14" rx="7" fill="#B45309" />
          </svg>
        );
      case 'tart':
      case 'elixir':
        return (
          <svg viewBox="0 0 240 180" className="w-full h-full" fill="none">
            <rect width="240" height="180" fill="#150E22" />
            <circle cx="120" cy="92" r="64" fill="#1E1430" stroke="#EC4899" strokeOpacity="0.4" />
            <circle cx="120" cy="92" r="44" fill="#831843" />
            <circle cx="120" cy="92" r="34" fill="#BE185D" />
            <circle cx="108" cy="84" r="10" fill="#FBBF24" />
            <circle cx="132" cy="96" r="8" fill="#F59E0B" />
            <circle cx="122" cy="76" r="5" fill="#10B981" />
            <path d="M116 88 L124 80 L128 92 Z" fill="#FDE047" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 240 180" className="w-full h-full" fill="none">
            <rect width="240" height="180" fill="#140E20" />
            <circle cx="120" cy="90" r="68" fill="#1C142B" stroke="#8B5CF6" strokeWidth="1.2" strokeOpacity="0.45" />
            <circle cx="120" cy="90" r="52" fill="#120C1C" stroke="#F59E0B" strokeWidth="0.8" strokeOpacity="0.4" />
            <ellipse cx="106" cy="86" rx="22" ry="15" fill="#F59E0B" fillOpacity="0.85" />
            <ellipse cx="136" cy="98" rx="18" ry="12" fill="#991B1B" />
            <circle cx="138" cy="74" r="7" fill="#10B981" />
            <circle cx="96" cy="106" r="5" fill="#EC4899" />
          </svg>
        );
    }
  };

  if (mode === 'illustration' || imgError || !src) {
    return (
      <div className={`relative overflow-hidden bg-[#150F20] ${className}`}>
        {render2DIllustration()}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#150F20] ${className}`}>
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
      {/* Subtle contrast scrim for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0914]/75 via-transparent to-transparent pointer-events-none" />
      {/* Subtle 2D geometric corner motif */}
      {showArtAccent && (
        <svg
          viewBox="0 0 48 48"
          className="absolute bottom-2.5 right-2.5 w-7 h-7 opacity-45 pointer-events-none"
          fill="none"
        >
          <circle cx="24" cy="24" r="20" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="24" cy="24" r="4" fill="#10B981" />
        </svg>
      )}
    </div>
  );
};
