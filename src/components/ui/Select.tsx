import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      leftIcon,
      id,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-text-soft"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-text-muted pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
            }
            className={[
              'w-full appearance-none bg-canvas text-text text-sm rounded-lg border',
              'py-2.5 px-3.5 pr-10 min-h-[44px]',
              leftIcon ? 'pl-10' : '',
              'transition-[border-color,box-shadow] duration-200 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-black',
              error
                ? 'border-danger focus-visible:border-danger focus-visible:ring-danger/30'
                : 'border-border hover:border-text-muted/40 focus-visible:border-yellow focus-visible:ring-yellow/30',
              disabled ? 'opacity-50 cursor-not-allowed bg-surface' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          >
            {children
              ? children
              : options?.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-elevated text-text">
                    {opt.label}
                  </option>
                ))}
          </select>
          <span className="absolute right-3.5 text-text-muted pointer-events-none flex items-center">
            <ChevronDown className="w-4 h-4" />
          </span>
        </div>
        {error && (
          <p id={`${selectId}-error`} className="text-xs text-danger font-medium">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${selectId}-helper`} className="text-xs text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
