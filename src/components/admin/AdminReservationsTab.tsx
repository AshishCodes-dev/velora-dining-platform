import React, { useState } from 'react';
import type { Reservation, ReservationStatus } from '../../types/restaurant';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AdminReservationsTabProps {
  reservations: Reservation[];
  onReservationStatus: (id: string, status: ReservationStatus) => Promise<void>;
}

export const AdminReservationsTab: React.FC<AdminReservationsTabProps> = ({
  reservations,
  onReservationStatus,
}) => {
  const [resDateFilter, setResDateFilter] = useState<string>('');
  const [resStatusFilter, setResStatusFilter] = useState<string>('All');

  const filteredReservations = reservations.filter((r) => {
    if (resDateFilter && r.date !== resDateFilter) return false;
    if (resStatusFilter !== 'All' && r.status !== resStatusFilter) return false;
    return true;
  });

  const getStatusBadgeVariant = (status: ReservationStatus) => {
    if (status === 'CANCELLED' || status === 'REJECTED') return 'danger';
    if (status === 'CONFIRMED' || status === 'COMPLETED') return 'success';
    return 'warning';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={resDateFilter}
          onChange={(e) => setResDateFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs font-mono-tabular text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
        />
        {['All', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'].map((st) => (
          <Button
            key={st}
            type="button"
            variant={resStatusFilter === st ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setResStatusFilter(st)}
          >
            {st}
          </Button>
        ))}
        {resDateFilter && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setResDateFilter('')}
            className="text-xs text-yellow hover:text-yellow-hover"
          >
            Clear Date
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {filteredReservations.map((r) => (
          <div
            key={r.id}
            className="nocturne-surface rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:border-border-accent"
          >
            <div className="space-y-1">
              <p className="font-mono-tabular text-xs font-bold text-yellow">
                #{r.reservationCode} · {r.date} at {r.time} · {r.guests} Guests
              </p>
              <p className="text-sm font-semibold text-text">
                {r.name} ({r.phone}) · {r.tableArea}
              </p>
              {r.specialRequest && (
                <p className="text-xs text-text-soft">Note: "{r.specialRequest}"</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={getStatusBadgeVariant(r.status)}
                dot
                className="mr-2"
              >
                {r.status}
              </Badge>
              <Button
                type="button"
                variant="success"
                size="sm"
                onClick={() => onReservationStatus(r.id, 'CONFIRMED')}
              >
                Confirm
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => onReservationStatus(r.id, 'REJECTED')}
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
