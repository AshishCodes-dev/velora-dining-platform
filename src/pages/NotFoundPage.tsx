import React from 'react';
import { Utensils, Home, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { pageTransitionVariants } from '../lib/motion';

export const NotFoundPage: React.FC = () => {
  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="min-h-[70vh] flex items-center justify-center px-4 py-16"
    >
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-block">
          <p className="font-serif-display text-8xl sm:text-9xl font-bold tracking-tight text-yellow/20 select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-yellow/15 border border-yellow/30 flex items-center justify-center text-yellow shadow-inner">
              <Utensils className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-serif-display text-2xl sm:text-3xl font-semibold text-text">
            Culinary Course Not Found
          </h1>
          <p className="text-xs sm:text-sm text-text-soft max-w-sm mx-auto leading-relaxed">
            The plate or chamber you are looking for has either moved to a private salon or does not exist on our tasting menu.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            to="/"
            leftIcon={<Home className="w-3.5 h-3.5" />}
          >
            Return to Dining Room
          </Button>
          <Button
            variant="outline"
            size="md"
            to="/menu"
            leftIcon={<Compass className="w-3.5 h-3.5" />}
          >
            Explore Menu
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
