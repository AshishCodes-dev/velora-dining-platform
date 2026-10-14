import React from 'react';
import { Check } from 'lucide-react';
import type { NotificationItem } from '../../types/restaurant';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AdminNotificationsTabProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => Promise<void>;
}

export const AdminNotificationsTab: React.FC<AdminNotificationsTabProps> = ({
  notifications,
  onMarkAllRead,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onMarkAllRead}
          leftIcon={<Check className="w-3.5 h-3.5" />}
        >
          Mark All Read
        </Button>
      </div>
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`nocturne-surface rounded-xl p-5 flex items-center justify-between gap-4 transition-colors hover:border-border-accent ${
            !n.read ? 'border-yellow/50' : ''
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-text">{n.title}</p>
              {!n.read && (
                <Badge variant="yellow" dot size="sm">
                  New
                </Badge>
              )}
            </div>
            <p className="text-xs text-text-soft">{n.message}</p>
          </div>
          <span className="text-[11px] font-mono-tabular text-text-muted">
            {new Date(n.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      ))}
    </div>
  );
};
