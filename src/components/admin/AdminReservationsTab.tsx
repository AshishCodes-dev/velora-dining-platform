import React, { useState } from 'react';
import type { Reservation, ReservationStatus } from '../../types/restaurant';

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={resDateFilter}
          onChange={(e) => setResDateFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-[#150F20] border border-white/10 text-xs font-mono-tabular text-[#F5F2FA]"
        />
        {['All', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setResStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              resStatusFilter === st
                ? 'bg-[#8B5CF6] text-white'
                : 'bg-[#150F20] text-[#B8AFC9] border border-white/10'
            }`}
          >
            {st}
          </button>
        ))}
        {resDateFilter && (
          <button
            type="button"
            onClick={() => setResDateFilter('')}
            className="text-xs text-[#EC4899] hover:underline"
          >
            Clear Date
          </button>
        )}
      </div>

      <div className="space-y-3">
        {filteredReservations.map((r) => (
          <div
            key={r.id}
            className="nocturne-surface rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <p className="font-mono-tabular text-xs font-bold text-[#F59E0B]">
                #{r.reservationCode} · {r.date} at {r.time} · {r.guests} Guests
              </p>
              <p className="text-sm font-semibold text-[#F5F2FA]">
                {r.name} ({r.phone}) · {r.tableArea}
              </p>
              {r.specialRequest && (
                <p className="text-xs text-[#B8AFC9]">Note: "{r.specialRequest}"</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono-tabular text-xs text-[#10B981] mr-2">
                {r.status}
              </span>
              <button
                type="button"
                onClick={() => onReservationStatus(r.id, 'CONFIRMED')}
                className="px-3 py-1.5 rounded-lg bg-[#10B981] text-[#081C15] text-xs font-semibold"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => onReservationStatus(r.id, 'REJECTED')}
                className="px-3 py-1.5 rounded-lg bg-[#F43F5E]/20 text-[#F43F5E] text-xs font-semibold"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
