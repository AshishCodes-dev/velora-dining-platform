import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'yellow' | 'green';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  yellow: 'bg-yellow/15 border border-yellow/30 text-yellow',
  success: 'bg-green-light/15 border border-green-light/30 text-green-light',
  warning: 'bg-yellow/15 border border-yellow/30 text-yellow',
  danger: 'bg-danger/15 border border-danger/30 text-danger',
  neutral: 'bg-white/5 border border-border text-text-soft',
  green: 'bg-green-deep border border-green-mid/50 text-green-light',
};

const dotColors: Record<BadgeVariant, string> = {
  yellow: 'bg-yellow',
  success: 'bg-green-light',
  warning: 'bg-yellow',
  danger: 'bg-danger',
  neutral: 'bg-text-soft',
  green: 'bg-green-light',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-[11px] px-2 py-0.5 gap-1.5',
  md: 'text-xs px-2.5 py-1 gap-1.5',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full uppercase tracking-wider ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
