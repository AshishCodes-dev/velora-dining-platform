import React from 'react';
import { Check } from 'lucide-react';
import type { NotificationItem } from '../../types/restaurant';

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
        <button
          type="button"
          onClick={onMarkAllRead}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B5CF6] text-white text-xs font-semibold"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark All Read</span>
        </button>
      </div>
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`nocturne-surface rounded-xl p-5 flex items-center justify-between gap-4 ${
            !n.read ? 'border-[#8B5CF6]/50' : ''
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-[#F5F2FA]">{n.title}</p>
            <p className="text-xs text-[#B8AFC9] mt-1">{n.message}</p>
          </div>
          <span className="text-[11px] font-mono-tabular text-[#7E7394]">
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
