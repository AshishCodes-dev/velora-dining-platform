import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'elevated' | 'glass' | 'canvas';
  interactive?: boolean;
  padded?: boolean;
  children?: React.ReactNode;
}

const variantClasses = {
  surface: 'bg-surface border border-border',
  elevated: 'bg-elevated border border-border',
  glass: 'bg-surface/85 backdrop-blur-md border border-border',
  canvas: 'bg-canvas border border-border',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'surface',
      interactive = false,
      padded = true,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const classes = [
      'rounded-xl text-text transition-[transform,box-shadow,border-color] duration-300 ease-out',
      variantClasses[variant],
      padded ? 'p-5 sm:p-6' : '',
      interactive
        ? 'cursor-pointer hover:-translate-y-1 hover:border-border-accent hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow'
        : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
