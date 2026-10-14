import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionTo?: string;
  actionNode?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionTo,
  actionNode,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl bg-surface/50 border border-border/80 ${className}`}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-green-deep/40 border border-green-mid/40 flex items-center justify-center text-yellow mb-5 shadow-inner">
          {icon}
        </div>
      )}
      <h3 className="text-lg sm:text-xl font-semibold text-text mb-2 font-serif-display">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-text-soft max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {actionNode ? (
        actionNode
      ) : actionLabel && (actionTo || onAction) ? (
        <Button
          variant="primary"
          to={actionTo}
          onClick={onAction}
          className="shadow-md"
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};
