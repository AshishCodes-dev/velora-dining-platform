import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Home, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-block">
          <p className="font-serif-display text-8xl sm:text-9xl font-bold tracking-tight text-white/10 select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <Utensils className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#F5F2FA]">
            Culinary Course Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#B8AFC9] max-w-sm mx-auto leading-relaxed">
            The plate or chamber you are looking for has either moved to a private salon or does not exist on our tasting menu.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold shadow-lg shadow-[#8B5CF6]/20 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Dining Room</span>
          </Link>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 hover:border-white/30 text-[#F5F2FA] text-xs font-semibold transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore Menu</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
