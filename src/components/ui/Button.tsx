import React from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from './Spinner';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'icon';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  to?: string;
  href?: string;
  asChild?: boolean;
  children?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-yellow text-black font-semibold border border-yellow hover:bg-yellow-hover hover:border-yellow-hover hover:shadow-[0_0_24px_-6px_rgba(245,197,24,0.55)] hover:-translate-y-px active:scale-[0.97] active:bg-yellow-hover',
  secondary:
    'bg-green-deep border border-green-mid text-text-soft font-medium hover:text-text hover:bg-green-mid/30 active:scale-[0.97]',
  outline:
    'bg-transparent border border-border text-text font-medium hover:border-yellow hover:text-yellow active:scale-[0.97]',
  ghost:
    'bg-transparent text-text-soft font-medium hover:text-text hover:bg-white/5 active:scale-[0.97]',
  danger:
    'bg-danger/15 border border-danger/40 text-danger font-medium hover:bg-danger/25 active:scale-[0.97]',
  success:
    'bg-green-light text-black font-semibold border border-green-light hover:bg-green-mid active:scale-[0.97]',
  icon:
    'bg-transparent text-text-soft hover:text-text hover:bg-white/5 border border-transparent hover:border-border active:scale-[0.97] !p-2 justify-center',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-lg min-h-[36px] gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-lg min-h-[44px] gap-2',
  lg: 'text-base px-6 py-3 rounded-lg min-h-[48px] gap-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      to,
      href,
      type = 'button',
      className = '',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseClasses = [
      'relative inline-flex items-center justify-center select-none font-medium text-center',
      'transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-200 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black',
      sizeClasses[size],
      variantClasses[variant],
      fullWidth ? 'w-full' : '',
      isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const content = (
      <>
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
            <Spinner
              size={size === 'lg' ? 'md' : 'sm'}
              variant={variant === 'primary' || variant === 'success' ? 'current' : 'yellow'}
            />
          </span>
        )}
        <span className={`inline-flex items-center gap-2 ${loading ? 'invisible' : ''}`}>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </span>
      </>
    );

    if (to && !isDisabled) {
      return (
        <Link to={to} className={baseClasses}>
          {content}
        </Link>
      );
    }

    if (href && !isDisabled) {
      return (
        <a href={href} className={baseClasses} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={baseClasses}
        onClick={onClick}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
