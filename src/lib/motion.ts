import { useReducedMotion } from 'motion/react';
import type { Variants } from 'motion/react';

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_SPRING = { type: 'spring', stiffness: 400, damping: 28 } as const;

export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease: 'easeIn' as const },
  },
};

export const fadeUpVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: EASE_OUT },
  },
};

export const scaleInVariants: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.18, ease: 'easeIn' as const },
  },
};

export const heartPopKeyframes = {
  scale: [1, 1.3, 0.92, 1],
  transition: { duration: 0.35, ease: 'easeInOut' as const },
};

export const badgeBounceKeyframes = {
  scale: [1, 1.35, 0.9, 1],
  transition: { duration: 0.3, ease: 'easeOut' as const },
};

/**
 * Returns variants or empty/instant object if the user prefers reduced motion.
 */
export function useAccessibleVariants<T extends Record<string, unknown>>(variants: T): T {
  const shouldReduce = useReducedMotion();
  if (shouldReduce) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.01 } },
      exit: { opacity: 0, transition: { duration: 0.01 } },
    } as unknown as T;
  }
  return variants;
}
