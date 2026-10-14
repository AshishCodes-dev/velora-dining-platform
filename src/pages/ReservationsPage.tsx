import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle2, XCircle } from 'lucide-react';
import { apiRequest } from '../services/api';
import { useRestaurant } from '../context/RestaurantContext';
import type { Reservation } from '../types/restaurant';

interface TimeSlot {
  time: string;
  available: boolean;
  remainingTables: number;
}

export const ReservationsPage: React.FC = () => {
  const { user, showToast, refreshNotifications } = useRestaurant();

  const [name, setName] = useState(user?.name || 'Elena Rostova');
  const [phone, setPhone] = useState(user?.phone || '+1 (415) 602-8819');
  const [email, setEmail] = useState(user?.email || 'elena@example.com');
  const [date, setDate] = useState('2026-10-09');
  const [time, setTime] = useState('20:00');
  const [guests, setGuests] = useState(2);
  const [tableArea, setTableArea] = useState<Reservation['tableArea']>('Velvet Chef Counter');
  const [specialRequest, setSpecialRequest] = useState('');

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedRes, setConfirmedRes] = useState<Reservation | null>(null);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setEmail(user.email);
    }
  }, [user]);

  const loadSlots = async (selectedDate: string) => {
    try {
      setLoadingSlots(true);
      const res = await apiRequest<{ date: string; slots: TimeSlot[] }>(
        `/api/reservations/slots?date=${encodeURIComponent(selectedDate)}`
      );
      setSlots(res.slots);
    } catch {
      // fallback slots
    } finally {
      setLoadingSlots(false);
    }
  };

  const loadMyReservations = async () => {
    try {
      setLoadingList(true);
      const res = await apiRequest<{ reservations: Reservation[] }>('/api/reservations');
      setReservations(res.reservations);
    } catch {
      // silent
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadSlots(date);
  }, [date]);

  useEffect(() => {
    loadMyReservations();
  }, [user]);

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !date || !time) {
      showToast('✕ Please complete all required reservation fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiRequest<{ reservation: Reservation }>('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          name,
          phone,
          email,
          date,
          time,
          guests,
          tableArea,
          specialRequest,
        }),
      });
      setConfirmedRes(res.reservation);
      showToast('✓ Reservation confirmed', 'success');
      await loadSlots(date);
      await loadMyReservations();
      await refreshNotifications();
    } catch (err) {
      showToast(err instanceof Error ? `✕ ${err.message}` : '✕ Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelReservation = async (id: string) => {
    try {
      await apiRequest(`/api/reservations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      showToast('✓ Reservation cancelled', 'info');
      await loadMyReservations();
      await loadSlots(date);
    } catch {
      showToast('✕ Could not cancel reservation', 'error');
    }
  };

  const upcomingReservations = reservations.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'PENDING'
  );
  const pastReservations = reservations.filter(
    (r) => r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'REJECTED'
  );

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 space-y-14">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs text-[#8B5CF6] font-medium">
            VELORA · Concierge &amp; Private Dining
          </p>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-semibold text-[#F5F2FA] mt-1">
            Table &amp; Sommelier Vault Reservations
          </h1>
        </div>
        <p className="text-xs text-[#B8AFC9] font-mono-tabular">
          Instant Seat Confirmation · Parties of 1 to 20 Guests
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Interactive Reservation Form OR Confirmation Receipt */}
        <div className="lg:col-span-7">
          {confirmedRes ? (
            <div className="nocturne-surface rounded-2xl p-8 space-y-6 border border-[#10B981]/40">
              <div className="flex items-center gap-3 text-[#10B981]">
                <CheckCircle2 className="w-7 h-7" />
                <div>
                  <p className="text-xs font-mono-tabular uppercase">
                    Reservation Code #{confirmedRes.reservationCode}
                  </p>
                  <h2 className="font-serif-display text-3xl font-semibold text-[#F5F2FA]">
                    Your Table is Reserved
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#B8AFC9] leading-relaxed">
                We look forward to welcoming you to VELORA. Our Maître D’ has reserved your seating with a 15-minute grace period.
              </p>

              <div className="p-5 rounded-xl bg-[#0D0914] border border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[#7E7394] block">Guest Name</span>
                  <span className="font-semibold text-[#F5F2FA] mt-0.5 block">
                    {confirmedRes.name}
                  </span>
                </div>
                <div>
                  <span className="text-[#7E7394] block">Date &amp; Time</span>
                  <span className="font-mono-tabular font-semibold text-[#F59E0B] mt-0.5 block">
                    {confirmedRes.date} · {confirmedRes.time}
                  </span>
                </div>
                <div>
                  <span className="text-[#7E7394] block">Party Size</span>
                  <span className="font-mono-tabular font-semibold text-[#10B981] mt-0.5 block">
                    {confirmedRes.guests} Guests
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-white/5">
                  <span className="text-[#7E7394] block">Dining Area</span>
                  <span className="font-semibold text-[#8B5CF6] mt-0.5 block">
                    {confirmedRes.tableArea}
                  </span>
                  {confirmedRes.specialRequest && (
                    <p className="text-[#B8AFC9] mt-1">
                      Note: "{confirmedRes.specialRequest}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmedRes(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold"
                >
                  Make Another Reservation
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleReserve}
              className="nocturne-surface rounded-2xl p-6 sm:p-8 space-y-6"
            >
              <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
                Reserve Your Evening Seating
              </h2>

              {/* Date, Guests, Dining Room Area */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#B8AFC9] mb-1.5">
                    <Calendar className="w-3.5 h-3.5 inline mr-1 text-[#8B5CF6]" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs font-mono-tabular text-[#F5F2FA]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#B8AFC9] mb-1.5">
                    <Users className="w-3.5 h-3.5 inline mr-1 text-[#10B981]" />
                    Number of Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs font-mono-tabular text-[#F5F2FA]"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#B8AFC9] mb-1.5">
                    Sanctuary Seating Area
                  </label>
                  <select
                    value={tableArea}
                    onChange={(e) =>
                      setTableArea(e.target.value as Reservation['tableArea'])
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                  >
                    <option value="Velvet Chef Counter">Velvet Chef Counter</option>
                    <option value="Main Dining Room">Main Dining Room</option>
                    <option value="Velora Garden Terrace">Velora Garden Terrace</option>
                    <option value="Private Sommelier Vault">Private Sommelier Vault</option>
                  </select>
                </div>
              </div>

              {/* Available Time Slots */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#B8AFC9]">
                    <Clock className="w-3.5 h-3.5 inline mr-1 text-[#F59E0B]" />
                    Available Evening Time Slots ({date})
                  </label>
                  {loadingSlots && (
                    <span className="text-[11px] text-[#7E7394]">Checking availability...</span>
                  )}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {slots.map((slot) => {
                    const selected = time === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setTime(slot.time)}
                        className={`p-2.5 rounded-xl border text-center font-mono-tabular transition-all ${
                          !slot.available
                            ? 'bg-[#0D0914]/40 border-white/5 text-[#7E7394] line-through opacity-50 cursor-not-allowed'
                            : selected
                            ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white font-semibold'
                            : 'bg-[#0D0914] border-white/10 text-[#F5F2FA] hover:border-[#8B5CF6]/50'
                        }`}
                      >
                        <span className="text-xs block">{slot.time}</span>
                        <span className="text-[10px] opacity-75 block">
                          {slot.remainingTables} left
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guest Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs text-[#B8AFC9] mb-1">Guest Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#B8AFC9] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#B8AFC9] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                  />
                </div>
              </div>

              {/* Special Request */}
              <div>
                <label className="block text-xs text-[#B8AFC9] mb-1">
                  Special Request (Dietary Restrictions, Celebration, Sommelier Pairing)
                </label>
                <textarea
                  rows={2}
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  placeholder="e.g., Anniversary table styling, gluten-free tasting menu, quiet corner booth..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA] placeholder-[#7E7394]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#081C15] font-semibold text-sm transition-colors"
              >
                {submitting
                  ? 'Confirming Seating...'
                  : `Confirm Table Reservation (${date} at ${time})`}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Upcoming & Past Reservations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="nocturne-surface rounded-2xl p-6 space-y-4">
            <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
              Upcoming Reservations ({upcomingReservations.length})
            </h2>

            {loadingList ? (
              <div className="h-32 rounded-xl bg-[#0D0914] animate-pulse" />
            ) : upcomingReservations.length === 0 ? (
              <p className="text-xs text-[#7E7394] py-4">
                No upcoming reservations yet. Select a date and time slot on the left to book your table.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingReservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-4 rounded-xl bg-[#0D0914] border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono-tabular text-xs font-bold text-[#F59E0B]">
                        #{res.reservationCode} · {res.date} at {res.time}
                      </span>
                      <span className="text-xs font-semibold text-[#10B981]">
                        {res.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#F5F2FA]">
                      {res.tableArea} · {res.guests} Guests ({res.name})
                    </p>
                    {res.specialRequest && (
                      <p className="text-[11px] text-[#B8AFC9]">"{res.specialRequest}"</p>
                    )}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleCancelReservation(res.id)}
                        className="inline-flex items-center gap-1 text-xs text-[#F43F5E] hover:underline"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Reservation</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="nocturne-surface rounded-2xl p-6 space-y-4">
            <h2 className="font-serif-display text-xl font-semibold text-[#F5F2FA]">
              Past &amp; Cancelled Reservations ({pastReservations.length})
            </h2>
            {pastReservations.length === 0 ? (
              <p className="text-xs text-[#7E7394]">No past reservations recorded.</p>
            ) : (
              <div className="space-y-3">
                {pastReservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-xl bg-[#0D0914]/60 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[#B8AFC9]">
                        #{res.reservationCode} · {res.tableArea}
                      </p>
                      <p className="font-mono-tabular text-[11px] text-[#7E7394]">
                        {res.date} at {res.time} · {res.guests} Guests
                      </p>
                    </div>
                    <span className="font-mono-tabular text-[11px] text-[#7E7394]">
                      {res.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
